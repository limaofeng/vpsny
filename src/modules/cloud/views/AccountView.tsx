import React from 'react';
import { SafeAreaView, NavigationScreenProp, NavigationScreenOptions } from 'react-navigation';
import { StyleSheet, ScrollView, Text, Alert, TouchableOpacity, Dimensions, View, RefreshControl } from 'react-native';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import axios from 'axios';
import Spinner from 'react-native-spinkit';
import { number } from '../../../utils/format';

import { List, Item, Label, Input, Icon, Note } from '../../../components';
import { Account } from '../type';
import Theme, { withTheme } from '../../../components/Theme';
import BottomRegion from '../../../components/BottomRegion';
import { AppState } from '../..';
import { Instance } from '../Provider';
import { Bill } from '../Agent';
import { VultrAPIKey } from '../VultrProvider';
import { AWSAPIKey } from '../AWSProvider';

interface AccountViewProps {
  navigation: NavigationScreenProp<any>;
  account: Account;
  instances: Instance[];
  updateKey: (id: string, apiKey: string) => void;
  findAccountByApiKey: (provider: string, apiKey: string) => Account | undefined;
  deleteAccount: () => void;
  refreshAccount: () => void;
  theme?: Theme;
}

interface AccountViewState {
  apiKey?: string;
  mode: 'edit' | 'view';
  status: 'initialize' | 'verifying';
  refreshing: boolean;
}

class AccountView extends React.Component<AccountViewProps, AccountViewState> {
  static navigationOptions = ({ navigation }: AccountViewProps): NavigationScreenOptions => {
    const account = navigation.getParam('data') as Account;
    return {
      headerTitle: account.provider.replace(/^\S/, s => s.toUpperCase())
    };
  };

  constructor(props: AccountViewProps) {
    super(props);
    this.state = {
      apiKey: undefined,
      mode: 'view',
      refreshing: false,
      status: 'initialize'
    };
  }

  toSSHKey = (id: string) => {
    const { navigation } = this.props;
    return () => {
      navigation.navigate('SSHKey', { id });
    };
  };

  handleValueChange = (value: string) => {
    const { account } = this.props;
    if (account.apiKey !== value) {
      this.setState({ apiKey: value, mode: 'edit' });
    } else {
      this.setState({ apiKey: undefined, mode: 'view' });
    }
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

  handleSave = async () => {
    try {
      const {
        findAccountByApiKey,
        account: { id },
        updateKey
      } = this.props;
      const { apiKey } = this.state;
      this.setState({ status: 'verifying' });
      const account = findAccountByApiKey('vultr', apiKey as string);
      if (account && account.id !== id) {
        Alert.alert('Duplicated', `This is already added as ${account.name}`);
        this.setState({ status: 'initialize' });
        return;
      }
      const reps = await axios.get('https://api.vultr.com/v1/auth/info', {
        headers: {
          'API-Key': apiKey
        }
      });
      const { data } = reps;
      console.log('data', data);
      // 更新
      updateKey(id, apiKey as string);
      this.setState({ status: 'initialize', mode: 'view' });
    } catch ({ response }) {
      if (response) {
        if (response.status === 403) {
          Alert.alert(
            'Invalid API key',
            'Please enter the correct API-Key',
            [{ text: 'OK', onPress: () => console.log('OK Pressed') }],
            { cancelable: false }
          );
        }
      }
      this.setState({ status: 'initialize' });
    }
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
    const { colors, fonts } = this.props.theme as Theme;
    const { account, instances } = this.props;
    const { mode, status } = this.state;
    const bill = account.bill;
    const visible = status === 'verifying';
    let butTitle = 'Save';
    if (status === 'verifying') {
      butTitle = 'Verifying API-Key';
    }
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
          {account.provider === 'vultr' && (
            <List title="API-Key">
              <Item>
                <Input
                  editable={false}
                  onValueChange={this.handleValueChange}
                  value={(account.apiKey as VultrAPIKey).apiKey}
                />
              </Item>
            </List>
          )}
          {account.provider === 'lightsail' && (
            <>
              <List title="Access Key">
                <Item>
                  <Input defaultValue={(account.apiKey as AWSAPIKey).accessKeyId} />
                </Item>
              </List>
              <List title="Secret Key">
                <Item>
                  <Input defaultValue={(account.apiKey as AWSAPIKey).secretAccessKey} />
                </Item>
              </List>
            </>
          )}
          <List title="Info">
            <Item>
              <Label>Name</Label>
              <Note>{account.name}</Note>
            </Item>
            <Item visible={account.provider === 'vultr'}>
              <Label>E-Mail</Label>
              <Note>{account.email}</Note>
            </Item>
          </List>
          {account.provider === 'vultr' && (
            <List title="Billing">
              <Item>
                <Label>Balance</Label>
                <Note>${number(bill!.balance, '0.00')}</Note>
              </Item>
              <Item>
                <Label>This Month</Label>
                <Note>${number(bill!.pendingCharges, '0.00')}</Note>
              </Item>
              <Item>
                <Label>Remaining</Label>
                <Note>${number(bill!.balance - bill!.pendingCharges, '0.00')}</Note>
              </Item>
            </List>
          )}
          <List title=" ">
            <Item onClick={this.handleDelete}>
              <View style={{ alignItems: 'center', flex: 1 }}>
                <Note style={{ color: colors.colorful.red }}>Delete Account</Note>
              </View>
            </Item>
          </List>
        </ScrollView>
        <BottomRegion isVisible={mode === 'edit'}>
          <TouchableOpacity
            style={{
              height: 40,
              width: Dimensions.get('window').width - 40,
              borderRadius: 2,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: colors.primary,
              borderColor: 'green',
              borderStyle: 'solid',
              paddingBottom: 2
            }}
            onPress={this.handleSave}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Spinner
                isVisible={visible}
                style={{ marginRight: 10 }}
                size={21}
                type="Arc"
                color={colors.backgroundColorDeeper}
              />
              <Text
                style={[
                  {
                    textAlign: 'center',
                    color: colors.backgroundColorDeeper
                  },
                  fonts.callout
                ]}
              >
                {butTitle}
              </Text>
            </View>
          </TouchableOpacity>
        </BottomRegion>
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

const mapDispatchToProps = (dispatch: Dispatch, { navigation }: AccountViewProps) => ({
  deleteAccount() {
    dispatch({ type: 'cloud/dropAccount', payload: { id: navigation.getParam('data').id } });
    navigation.goBack();
  },
  refreshAccount() {
    const { id, apiKey } = navigation.getParam('data');
    dispatch({ type: 'cloud/refreshAccount', payload: { id, apiKey } });
  },
  updateKey(id: string, apiKey: string) {
    dispatch({ type: 'cloud/updateAccountApiKey', payload: { id, apiKey } });
  }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withTheme(AccountView, false));
