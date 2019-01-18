import { Input, Item, Label, List, Note, Select, Theme, withTheme } from '@components';
import { AppState } from '@modules';
import { AWSAPIKey, AWSLightsailAgent, AWSRegions } from '@modules/cloud/providers/lightsail/AWSProvider';
import React from 'react';
import { Alert, Dimensions, View } from 'react-native';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { setApi } from '../../..';
import SubmitButtonWrapper, { SubmitButton } from '../../../../../components/SubmitButton';
import { User } from '../../../Agent';
import { Account } from '../../../type';

interface LightsailNewProps {
  theme?: Theme;
  user?: User;
  back: () => void;
  save: (account: Account) => void;
  find: (accessKey: string) => Account | undefined;
  dispatch: Dispatch;
}

interface LightsailNewState {
  mode: 'select' | 'input';
  title: string;
  name: string;
  accessKey: string;
  secretKey: string;
  defaultRegion: string;
  user?: User;
  status: 'initialize' | 'success';
}

class LightsailNew extends React.Component<LightsailNewProps, LightsailNewState> {
  constructor(props: LightsailNewProps) {
    super(props);
    this.state = {
      mode: 'select',
      title: 'Lightsail',
      accessKey: '',
      secretKey: '',
      name: 'Default',
      status: 'initialize',
      defaultRegion: 'ap-northeast-1'
    };
  }
  submit = React.createRef<SubmitButton>();
  toggleMode = () => {
    const { mode } = this.state;
    this.setState({ mode: mode === 'select' ? 'input' : 'select' });
  };

  componentDidMount() {
    this.submit.current!.disable();
  }

  handleAccessKey = (accessKey: string) => {
    this.setState({ accessKey });
    this.handleButState(accessKey, this.state.secretKey);
  };
  handleSecretKey = (secretKey: string) => {
    this.setState({ secretKey });
    this.handleButState(this.state.accessKey, secretKey);
  };
  handleDefaultRegion = (defaultRegion: string) => {
    this.setState({ defaultRegion });
  };
  handleAPIKey(accessKeyId?: string, secretAccessKey?: string) {
    if (accessKeyId && secretAccessKey) {
      return { accessKeyId, secretAccessKey };
    }
  }

  handleButState = (accessKeyId?: string, secretAccessKey?: string) => {
    if (accessKeyId && secretAccessKey) {
      this.submit.current!.enable();
    } else {
      this.submit.current!.disable();
    }
  };

  apiKey = (): AWSAPIKey | undefined => {
    const { accessKey, secretKey } = this.state;
    if (accessKey && secretKey) {
      return { accessKeyId: accessKey, secretAccessKey: secretKey };
    }
  };

  handleJumpToRegions = () => {
    // const { navigation } = this.props;
    // navigation.navigate('AWSRegions', {});
  };

  handleSave = async () => {
    const { find, back, save, dispatch } = this.props;
    const { defaultRegion } = this.state;
    if (this.state.status === 'success') {
      back();
      return;
    }
    const account = find(this.state.accessKey!);
    if (account) {
      Alert.alert('Duplicated', `This is already added as ${account.name}`);
      return;
    }
    const submit = this.submit.current!;
    try {
      submit.submittingText('Verifying API-Key');
      const apiKey = this.apiKey()!;
      const api = new AWSLightsailAgent(apiKey!, { defaultRegion, regions: [] });
      const user = await api.user();
      save({
        id: user.id,
        title: 'AWS Lightsail',
        apiKey: user.apiKey,
        name: user.name,
        email: user.email,
        provider: 'lightsail',
        sshkeys: [],
        settings: {
          defaultRegion: defaultRegion
        }
      });
      this.setState({ user });
      setApi(api.id, api);
      submit.submittingText('Pulling SSH Keys');
      const sshkeys = await api.sshkeys();
      await dispatch({ type: 'cloud/sshkeys', payload: { id: user.id, sshkeys } });
      submit.submittingText('Pulling Instances');
      const instances = await api.instance.list();
      await dispatch({ type: 'cloud/instances', payload: { uid: user.id, instances } });
      this.setState({ status: 'success' });
    } catch (error) {
      this.setState({ status: 'initialize' });
      const { response } = error;
      if (response && response.status === 403) {
        throw new Error('Please enter the correct API-Key');
      } else {
        throw error;
      }
    }
  };

  render() {
    const { accessKey, secretKey, defaultRegion, user } = this.state;
    const regions = Object.keys(AWSRegions).map(key => ({
      label: AWSRegions[key].name,
      value: key
    }));
    return (
      <>
        <List title="Access Key">
          <Item>
            <Input testID="lightsail-accesskey" onValueChange={this.handleAccessKey} defaultValue={accessKey} />
          </Item>
        </List>
        <List title="Secret Key">
          <Item>
            <Input testID="lightsail-secretkey" onValueChange={this.handleSecretKey} defaultValue={secretKey} />
          </Item>
        </List>
        <List title="Default Region">
          <Item>
            <Select
              defaultValue={regions.find(r => r.value === defaultRegion)}
              required
              hideClearButton
              onValueChange={this.handleDefaultRegion}
              items={regions}
            />
          </Item>
        </List>
        {!!user && (
          <List title="Info">
            <Item>
              <Label>Name</Label>
              <Note>{user!.name}</Note>
            </Item>
          </List>
        )}
        <List visible={false} title="Configuration Region">
          <Item onClick={this.handleJumpToRegions} push>
            <Note />
          </Item>
        </List>
        <View style={{ flex: 1, alignItems: 'center', marginTop: 20 }}>
          <SubmitButtonWrapper
            testID="newaccount-save"
            style={{ width: Dimensions.get('window').width - 40 }}
            ref={this.submit}
            reentrant
            onSubmit={this.handleSave}
            title="Save"
          />
        </View>
      </>
    );
  }
}

const mapStateToProps = ({ cloud: { accounts: allAccount } }: AppState) => {
  const accounts = allAccount.filter(data => data.provider === 'digitalocean');
  return {
    find: (accessKey: string) => {
      return accounts.find(account => (account.apiKey as AWSAPIKey).accessKeyId === accessKey);
    }
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
  return { dispatch };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withTheme(LightsailNew, false));
