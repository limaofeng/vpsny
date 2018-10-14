import { isEqual } from 'lodash';
import React from 'react';
import { Alert, Dimensions, ScrollView, StyleSheet, View } from 'react-native';
import { NavigationScreenOptions, NavigationScreenProp, SafeAreaView } from 'react-navigation';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { setApi } from '..';
import BottomRegion from '../../../components/BottomRegion';
import HeaderLeftClose from '../../../components/HeaderLeftClose';
import SubmitButtonWrapper, { SubmitButton } from '../../../components/SubmitButton';
import Theme, { withTheme } from '../../../components/Theme';
import { APIKey, User, Bill } from '../Agent';
import { AWSAPIKey, AWSLightsailAgent } from '../AWSProvider';
import ConnectToAWSLightsail from '../components/ConnectToAWSLightsail';
import ConnectToVultr from '../components/ConnectToVultr';
import { Account } from '../type';
import { VultrAgent, VultrAPIKey } from '../VultrProvider';
import { AppState } from '@modules';

interface AccountNewProps {
  dispatch: Dispatch;
  navigation: NavigationScreenProp<any>;
  provider: 'vultr' | 'lightsail';
  addAccount: (user: User) => void;
  goBack: (user?: User) => void;
  findAccountByApiKey: (apiKey: APIKey) => Account | undefined;
  theme?: Theme;
}

interface AccountNewState {
  user?: User;
  bill?: Bill;
  status: 'initialize' | 'success';
  apiKey?: APIKey;
}

class AccountNew extends React.Component<AccountNewProps, AccountNewState> {
  static handleGoBack: () => void;
  static navigationOptions = ({ navigation }: AccountNewProps): NavigationScreenOptions => {
    return {
      headerTitle: 'Add Account',
      headerLeft: <HeaderLeftClose onPress={() => {
        navigation.popToTop();
      }}/>
    };
  };
  submit = React.createRef<SubmitButton>();
  constructor(props: AccountNewProps) {
    super(props);
    this.state = {
      status: 'initialize'
    };
    AccountNew.handleGoBack = () => {
      props.goBack(this.state.user);
    };
  }

  handleValueChange = (value: string) => {
    this.setState({ apiKey: value });
  };

  handleAPIKeyChange = (apiKey?: APIKey) => {
    this.setState({ apiKey });
    if (apiKey) {
      this.submit.current!.enable();
    } else {
      this.submit.current!.disable();
    }
  };

  handleJumpToSSHKeys = () => {
    const { user } = this.state;
    this.props.navigation.navigate('SSHPublicKeys', { data: user });
  };

  handleJumpToInstances = () => {
    const { user } = this.state;
    this.props.navigation.navigate('Instances', { data: user });
  };

  handleSave = async () => {
    const { provider, findAccountByApiKey } = this.props;
    if (this.state.status === 'success') {
      const { goBack } = this.props;
      goBack(this.state.user);
      return;
    }
    const account = findAccountByApiKey(this.state.apiKey!);
    if (account) {
      Alert.alert('Duplicated', `This is already added as ${account.name}`);
      return;
    }
    const submit = this.submit.current!;
    try {
      submit.submittingText('Verifying API-Key');
      if (provider === 'lightsail') {
        await this.handleSaveForLightsail();
      } else if (provider === 'vultr') {
        await this.handleSaveForVultr();
      }
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

  handleSaveForLightsail = async () => {
    const { addAccount, dispatch } = this.props;
    const submit = this.submit.current!;
    const apiKey = this.state.apiKey as AWSAPIKey;
    const api = new AWSLightsailAgent(apiKey);
    const user = await api.user();
    addAccount(user);
    setApi(api.id, api);
    submit.submittingText('Pulling SSH Keys');
    const sshkeys = await api.sshkeys();
    await dispatch({ type: 'cloud/sshkeys', payload: { id: user.id, sshkeys } });
    submit.submittingText('Pulling Instances');
    const instances = await api.instance.list();
    await dispatch({ type: 'cloud/instances', payload: { instances } });
  };

  handleSaveForVultr = async () => {
    const { addAccount, dispatch } = this.props;
    const apiKey = this.state.apiKey as VultrAPIKey;
    const submit = this.submit.current as SubmitButton;
    const api = new VultrAgent(apiKey!);
    const user = await api.user();
    addAccount(user);
    setApi(api.id, api);
    this.setState({ user });
    submit.submittingText('Pulling Bill');
    const bill = await api.bill();
    await dispatch({ type: 'cloud/bill', payload: { id: user.id, bill } });
    this.setState({ bill });
    submit.submittingText('Pulling SSH Keys');
    const sshkeys = await api.sshkeys();
    await dispatch({ type: 'cloud/sshkeys', payload: { id: user.id, sshkeys } });
    submit.submittingText('Pulling Instances');
    const instances = await api.instance.list();
    await dispatch({ type: 'cloud/instances', payload: { instances } });
    this.setState({ status: 'success' });
  };
  render() {
    const { provider } = this.props;
    const { colors } = this.props.theme as Theme;
    const { user, bill } = this.state;
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.backgroundColor }]}>
        <ScrollView style={{ flex: 1, paddingTop: 13 }}>
          {provider === 'vultr' && <ConnectToVultr user={user} bill={bill} onChangeAPIKey={this.handleAPIKeyChange} />}
          {provider === 'lightsail' && <ConnectToAWSLightsail onChangeAPIKey={this.handleAPIKeyChange} />}
          <View style={{ flex: 1, alignItems: 'center', marginTop: 20 }}>
            <SubmitButtonWrapper
              style={{ width: Dimensions.get('window').width - 40 }}
              ref={this.submit}
              reentrant
              onSubmit={this.handleSave}
              title="Save"
            />
          </View>
        </ScrollView>
        <BottomRegion />
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});

const mapStateToProps = ({ cloud: { accounts }, nav: { routes } }: AppState, { navigation }: AccountNewProps) => {
  const callback = navigation.getParam('callback');
  const provider = navigation.getParam('provider') || 'lightsail';
  return {
    provider,
    routes,
    findAccountByApiKey: (apiKey: APIKey) => {
      return accounts.find((k: Account) => isEqual(k.apiKey, apiKey));
    },
    goBack(user?: User) {
      const accountNewRoute = routes[routes.length - 1];
        navigation.goBack(accountNewRoute.key);
        callback && callback(user);
    }
  };
};

const mapDispatchToProps = (dispatch: Dispatch, { navigation }: AccountNewProps) => {
  const provider = navigation.getParam('provider') || 'lightsail';
  return {
    addAccount(user: User) {
      dispatch({ type: 'cloud/addAccount', payload: { ...user, provider } });
    },
    dispatch
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withTheme(AccountNew, false));
