import { Input, Item, Label, List, Note, Theme, withTheme } from '@components';
import { ReduxState } from '@modules';
import React from 'react';
import { Alert, Dimensions, View } from 'react-native';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { setApi } from '../../..';
import SubmitButtonWrapper, { SubmitButton } from '../../../../../components/SubmitButton';
import { User } from '../../../Agent';
import BandwagonHostAgent, { BandwagonHostAPIKey } from '../../../agents/BandwagonHostAgent';
import { Account } from '../../../type';

type QueryType = 'id' | 'veid';

interface BandwagonHostNewProps {
  theme?: Theme;
  back: () => void;
  save: (account: Account) => void;
  find: (type: QueryType, id: string) => Account | undefined;
  dispatch: Dispatch;
}

interface BandwagonHostNewState {
  mode: 'select' | 'input';
  account?: string;
  title: string;
  name: string;
  veid?: string;
  token?: string;
  user?: User;
  status: 'initialize' | 'success';
}

class BandwagonHostNew extends React.Component<BandwagonHostNewProps, BandwagonHostNewState> {
  constructor(props: BandwagonHostNewProps) {
    super(props);
    this.state = {
      mode: 'select',
      veid: '',
      title: 'BandwagonHost',
      name: 'Default',
      token: '',
      status: 'initialize'
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

  handleVeid = (veid: string) => {
    this.setState({ veid });
    this.handleButState(veid, this.state.token!);
  };

  handleButState = (veid: string, token: string) => {
    if (veid && token) {
      this.submit.current!.enable();
    } else {
      this.submit.current!.disable();
    }
  };

  handleToken = (token: string) => {
    this.setState({ token });
    this.handleButState(this.state.veid!, token);
  };

  handleAccount = (account?: string) => {
    this.setState({ account });
  };

  apiKey = (): BandwagonHostAPIKey | undefined => {
    const { veid, token, account } = this.state;
    if (veid && token) {
      return { id: account!, vpses: [{ veid, token }] };
    }
  };

  handleSave = async () => {
    const { find, back, save, dispatch } = this.props;
    if (this.state.status === 'success') {
      back();
      return;
    }
    let account = find('veid', this.state.veid!);
    if (account) {
      Alert.alert('Duplicated', `This is already added as ${account.name} at ${this.state.veid}`);
      return;
    }
    const submit = this.submit.current!;
    try {
      submit.submittingText('Verifying API-Key');
      const apiKey = this.apiKey()!;
      apiKey.id = this.state.account || '';
      const api = new BandwagonHostAgent(apiKey!);
      const user = await api.user();
      account = find('id', user.id);
      if (account) {
        const bwgapi: BandwagonHostAPIKey = account.apiKey as BandwagonHostAPIKey;
        bwgapi.vpses.push(apiKey.vpses[0]);
        api.setKey(bwgapi);
      } else {
        account = {
          id: user.id,
          title: 'BandwagonHost',
          apiKey: user.apiKey,
          name: user.name,
          email: user.email,
          provider: 'bandwagonhost',
          sshkeys: []
        };
      }
      save(account);
      setApi(account.id, api);
      this.setState({ user });
      submit.submittingText('Pulling Instances');
      const instances = await api.instance.list();
      await dispatch({ type: 'cloud/instances', payload: { instances } });
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
    const { user, token, veid } = this.state;
    return (
      <>
        <List title="KiwiVM REST API">
          <Item>
            <Input placeholder="VEID" testID="bandwagonhost-veid" onValueChange={this.handleVeid} defaultValue={veid} />
          </Item>
          <Item>
            <Input
              placeholder="API Key"
              testID="bandwagonhost-apikey"
              onValueChange={this.handleToken}
              defaultValue={token}
            />
          </Item>
        </List>
        {!!user && (
          <List title="Info">
            <Item>
              <Label>E-Mail</Label>
              <Note>{user!.email}</Note>
            </Item>
          </List>
        )}
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

const mapStateToProps = ({ cloud: { accounts } }: ReduxState) => {
  const bwgAccounts = accounts.filter(data => data.provider === 'bandwagonhost');
  return {
    find: (type: QueryType, id: string) => {
      if (type === 'veid') {
        return bwgAccounts.find(account => (account.apiKey as BandwagonHostAPIKey).vpses.some(api => api.veid === id));
      } else {
        return bwgAccounts.find(account => account.id === id);
      }
    }
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
  return { dispatch };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withTheme(BandwagonHostNew, false));
