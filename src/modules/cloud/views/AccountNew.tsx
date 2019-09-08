import { ReduxState } from '@modules';
import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { NavigationScreenOptions, NavigationScreenProp, SafeAreaView } from 'react-navigation';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import Theme, { withTheme } from '../../../components/Theme';
import { APIKey, Bill, User } from '../Agent';
import { AWSOptions } from '../providers/lightsail/AWSProvider';
import { Region } from '../Provider';
import { CloudManager } from '../providers';
import { Account, ProviderType } from '../type';

// import BandwagonHostNew from '../bandwagon/BandwagonHostNew';
interface AccountNewProps {
  dispatch: Dispatch;
  navigation: NavigationScreenProp<any>;
  provider: ProviderType;
  addAccount: (account: Account) => void;
  updateAccount: (account: Account) => void;
  goBack: (user?: User) => void;
  exists: (id: string) => boolean;
  theme?: Theme;
}

interface AccountNewState {
  user?: User;
  bill?: Bill;
  status: 'initialize' | 'success';
  apiKey?: APIKey;
  regions?: Region[];
  options?: AWSOptions;
}

class AccountNew extends React.Component<AccountNewProps, AccountNewState> {
  static handleGoBack: () => void;
  static navigationOptions = ({ navigation }: AccountNewProps): NavigationScreenOptions => {
    return {
      headerTitle: 'Add Account'
    };
  };
  analytics?: RNFirebase.Analytics;
  constructor(props: AccountNewProps) {
    super(props);
    this.state = {
      status: 'initialize'
    };
    AccountNew.handleGoBack = () => {
      props.goBack(this.state.user);
    };
  }

  componentDidMount() {
    this.analytics = firebase.analytics();
    this.analytics.setCurrentScreen('AccountNew_' + this.props.provider, 'AccountNew.tsx');
  }

  handleValueChange = (value: string) => {
    this.setState({ apiKey: value });
  };

  handleAPIKeyChange = (apiKey?: APIKey, options: any = {}) => {
    this.setState({ apiKey, options });
  };

  handleJumpToSSHKeys = () => {
    const { user } = this.state;
    this.props.navigation.navigate('SSHPublicKeys', { data: user });
  };

  handleJumpToInstances = () => {
    const { user } = this.state;
    this.props.navigation.navigate('Instances', { data: user });
  };

  saveAccount = (account: Account) => {
    const { exists, addAccount, updateAccount } = this.props;
    if (exists(account.id)) {
      updateAccount(account);
    } else {
      addAccount(account);
    }
  };

  render() {
    const { colors } = this.props.theme as Theme;
    const { goBack } = this.props;
    const provider = CloudManager.getProvider(this.props.provider);
    const Component = provider.getComponent('AccountNew');
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.backgroundColor }]}>
        <ScrollView accessible={false} style={{ flex: 1, paddingTop: 13 }}>
          <Component back={goBack} save={this.saveAccount} />
        </ScrollView>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});

const mapStateToProps = ({ cloud: { accounts }, nav: { routes } }: ReduxState, { navigation }: AccountNewProps) => {
  const provider = navigation.getParam('provider') || 'lightsail';
  return {
    provider,
    routes,
    exists: (id: string) => {
      return accounts.some((k: Account) => k.id === id);
    },
    goBack() {
      const accountNewRoute = routes[routes.length - 1];
      navigation.goBack(accountNewRoute.key);
    }
  };
};

const mapDispatchToProps = (dispatch: Dispatch, { navigation }: AccountNewProps) => {
  const provider = navigation.getParam('provider') || 'lightsail';
  return {
    addAccount(account: Account) {
      dispatch({ type: 'cloud/addAccount', payload: { ...account, provider } });
    },
    updateAccount(account: Account) {
      dispatch({ type: 'cloud/updateAccount', payload: account });
    },
    dispatch
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withTheme(AccountNew, false));
