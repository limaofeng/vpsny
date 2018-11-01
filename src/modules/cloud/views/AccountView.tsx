import { Input, Item, Label, List, Note, Theme, withTheme } from '@components';
import { AppState } from '@modules';
import React from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { NavigationScreenOptions, NavigationScreenProp, SafeAreaView } from 'react-navigation';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { APIKey } from '../Agent';
import AWSLightsailView from '../components/AWSLightsailView';
import VultrView from '../components/VultrView';
import { Instance } from '../Provider';
import { Account } from '../type';
import { getApi } from '..';
import { AWSLightsailAgent } from '../AWSProvider';
import firebase, { RNFirebase } from 'react-native-firebase';

export type UpdateAccount = (key: 'title' | 'alias' | 'apiKey' | 'defaultRegion', value: string | APIKey) => void;

interface AccountViewProps {
  navigation: NavigationScreenProp<any>;
  account: Account;
  instances: Instance[];
  update: UpdateAccount;
  findAccountByApiKey: (provider: string, apiKey: string) => Account | undefined;
  deleteAccount: () => void;
  refreshAccount: () => void;
  theme?: Theme;
}

interface AccountViewState {
  apiKey: APIKey;
  title?: string;
  alias?: string;
  refreshing: boolean;
}

class AccountView extends React.Component<AccountViewProps, AccountViewState> {
  static navigationOptions = ({ navigation }: AccountViewProps): NavigationScreenOptions => {
    return {
      headerTitle: 'Account Details'
    };
  };
  analytics?: RNFirebase.Analytics;
  constructor(props: AccountViewProps) {
    super(props);
    const { account } = this.props;
    this.state = {
      apiKey: account.apiKey!,
      title: account.title,
      alias: account.alias || account.name,
      refreshing: false
    };
  }

  componentDidMount() {
    this.analytics = firebase.analytics();
    this.analytics.setCurrentScreen('AccountView_' + this.props.account.provider, 'AccountView.tsx');
  }

  toSSHKey = (id: string) => {
    const { navigation } = this.props;
    return () => {
      navigation.navigate('SSHKey', { id });
    };
  };

  handleTitleChange = (title: string) => {
    this.props.update('title', title);
  };
  handleAliasChange = (alias: string) => {
    this.props.update('alias', alias);
  };

  handleDelete = () => {
    const { deleteAccount } = this.props;
    Alert.alert(
      'Confirm',
      'Are you sure to delete this account?',
      [{ text: 'Cancel' }, { text: 'OK', onPress: deleteAccount }],
      {
        cancelable: false
      }
    );
  };

  handleRefresh = () => {
    const { refreshAccount } = this.props;
    this.setState({ refreshing: true });
    refreshAccount();
    this.setState({ refreshing: false });
  };

  handleJumpToSSHKeys = () => {
    const { account } = this.props;
    this.props.navigation.navigate('SSHPublicKeys', { data: account });
  };

  handleJumpToInstances = () => {
    const { account } = this.props;
    this.props.navigation.navigate('Instances', { data: account });
  };

  render() {
    const { colors } = this.props.theme as Theme;
    const { account } = this.props;
    const { title, alias } = this.state;
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.backgroundColor }]}>
        <ScrollView
          style={{ flex: 1, paddingTop: 13 }}
          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={this.handleRefresh}
              tintColor={colors.minor}
            />
          }
        >
          <List>
            <Item>
              <Label>Title</Label>
              <Input defaultValue={title} onValueChange={this.handleTitleChange} clearButtonMode="never" />
            </Item>
            <Item>
              <Label>Name</Label>
              <Input defaultValue={alias} onValueChange={this.handleAliasChange} clearButtonMode="never" />
            </Item>
          </List>
          {account.provider === 'vultr' && <VultrView account={account} />}
          {account.provider === 'lightsail' && (
            <AWSLightsailView navigation={this.props.navigation} update={this.props.update} account={account} />
          )}
          <List title=" ">
            <Item testID="account-delete" onClick={this.handleDelete}>
              <View style={{ alignItems: 'center', flex: 1 }}>
                <Note style={{ color: colors.colorful.red }}>Delete Account</Note>
              </View>
            </Item>
          </List>
        </ScrollView>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  scrollAscension: {
    width: 1,
    height: 54
  }
});

const mapStateToProps = ({ cloud: { accounts, instances } }: AppState, { navigation }: AccountViewProps) => {
  const account = navigation.getParam('data') as Account;
  return {
    account: accounts.find(a => a.id === account.id) || account,
    instances: instances.filter(node => node.account === account.id),
    findAccountByApiKey: (provider: string, apiKey: string) => {
      return accounts.find((k: Account) => k.provider === provider && k.apiKey === apiKey);
    }
  };
};

const mapDispatchToProps = (dispatch: Dispatch, { navigation }: AccountViewProps) => {
  const account = navigation.getParam('data') as Account;
  const api = getApi(account.id);
  return {
    deleteAccount() {
      dispatch({ type: 'cloud/dropAccount', payload: { id: account.id } });
      navigation.goBack();
    },
    refreshAccount() {
      const { id, apiKey } = navigation.getParam('data');
      dispatch({ type: 'cloud/refreshAccount', payload: { id, apiKey } });
    },
    update(key: 'title' | 'alias' | 'apiKey' | 'defaultRegion', value: string | APIKey) {
      switch (key) {
        case 'title':
          dispatch({ type: 'cloud/updateAccount', payload: { id: account.id, title: value } });
          break;
        case 'alias':
          dispatch({ type: 'cloud/updateAccount', payload: { id: account.id, alias: value } });
          break;
        case 'defaultRegion':
          account.settings!.defaultRegion = value as string;
          (api as AWSLightsailAgent).setDefaultRegion(value as string);
          dispatch({ type: 'cloud/updateAccount', payload: { id: account.id, settings: account.settings } });
          break;
        case 'apiKey':
          dispatch({ type: 'cloud/updateAccountApiKey', payload: { id: account.id, apiKey: value } });
          break;
      }
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withTheme(AccountView, false));
