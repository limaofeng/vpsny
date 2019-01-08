import { Icon, Item, Label, List, Note, Theme, withTheme } from '@components';
import { AppState } from '@modules';
import { format, SafeArea } from '@utils';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NavigationScreenOptions, NavigationScreenProp } from 'react-navigation';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { CloudManager } from '../../cloud/providers';
import { Account, Instance } from '../../cloud/type';
import AccountLable, { AllAccountLable, NewAccountLable } from '../components/AccountLable';

interface SidebarProps {
  dispatch: any;
  navigation: NavigationScreenProp<any>;
  theme: Theme;
  accounts: Account[];
  openMenu: (open: boolean) => void;
  changeAccount: (account: string) => void;
  currentAccount: string;
  instances: Instance[];
}

interface SidebarState {
  current?: Account;
}

class Sidebar extends React.Component<SidebarProps, SidebarState> {
  static navigationOptions: NavigationScreenOptions = {
    tabBarLabel: 'Sidebar'
  };
  constructor(props: SidebarProps) {
    super(props);
    this.state = { current: props.accounts.find(node => node.id === props.currentAccount) };
  }

  handleAccountManager = () => {
    const { navigation } = this.props;
    navigation.navigate('AccountList');
  };

  handleJumpToServers = () => {
    const { navigation } = this.props;
    const { current } = this.state;
    navigation.navigate('server', { data: current });
  };

  handleJumpToKeyPairs = () => {
    const { navigation } = this.props;
    navigation.navigate('KeyPairs');
  };

  handleCreate = () => {
    const { navigation } = this.props;
    navigation.navigate('ChooseProvider', {
      callback: () => {
        navigation.navigate('AccountNew');
      }
    });
  };

  handleJumpToNewAccount = () => {
    const { navigation } = this.props;
    navigation.navigate('AccountNew');
  };

  handleJumpSettings = () => {
    const { navigation } = this.props;
    navigation.navigate('Settings');
    this.props.openMenu(false);
  };

  handleJumpToSSHKeys = () => {
    const { navigation } = this.props;
    const { current } = this.state;
    navigation.navigate('SSHPublicKeys', { data: current });
  };

  handleLableClick = (account?: Account) => {
    const { changeAccount } = this.props;
    this.setState({ current: account });
    changeAccount(account ? account.id : '');
  };

  render() {
    const { colors, fonts } = this.props.theme;
    const { accounts, instances } = this.props;
    const { current } = this.state;
    const serversNumber = current ? instances.filter(node => node.account === current.id).length : instances.length;
    const sshkeysNumber = current ? current.sshkeys.length : 0;
    const paddingTop = Math.max(30, SafeArea.top);
    return (
      <View style={{ flex: 1, backgroundColor: colors.backgroundColorDeeper }}>
        <View style={{ flex: 1, flexDirection: 'row' }}>
          <View style={{ width: 70, backgroundColor: '#F0F1F2', paddingTop, alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <AllAccountLable testID="all-accounts" light={!current} onClick={this.handleLableClick} />
              {accounts.map(a => (
                <AccountLable
                  key={a.id}
                  light={current === a}
                  logo={CloudManager.getProvider(a.provider).logo}
                  value={a}
                  onClick={this.handleLableClick}
                />
              ))}
              <NewAccountLable testID="new-account" onClick={this.handleJumpToNewAccount} />
            </View>
            <View>
              <TouchableOpacity
                testID="open-settings"
                accessibilityTraits="button"
                onPress={this.handleJumpSettings}
                style={{ width: 70, height: 70, alignItems: 'center', justifyContent: 'center' }}
              >
                <Icon type="MaterialIcons" name="settings" color={colors.minor} size={28} />
              </TouchableOpacity>
            </View>
            <View style={{ height: SafeArea.bottom }} />
          </View>
          <View style={{ paddingTop, flex: 1 }}>
            <View
              style={{
                height: 65,
                borderBottomWidth: 1,
                borderBottomColor: colors.backgroundColor,
                paddingTop: 15,
                paddingLeft: 18,
                justifyContent: 'center',
                paddingBottom: 15
              }}
            >
              {current ? (
                <>
                  <Text style={[{ color: colors.major, fontWeight: 'bold', marginBottom: 5 }, fonts.title]}>
                    {current.title}
                  </Text>
                  <Text style={[{ color: colors.secondary }, fonts.headline]}>{current.alias || current.name}</Text>
                </>
              ) : (
                <Text style={[{ color: colors.major, fontWeight: 'bold', marginBottom: 5 }, fonts.title]}>
                  All Accounts
                </Text>
              )}
            </View>
            <ScrollView style={{ paddingTop: 10 }}>
              <List itemStyle={{ height: 45 }}>
                <Item onClick={this.handleJumpToServers}>
                  <Icon type="Ionicons" name="ios-albums" size={16} color={colors.minor} />
                  <Note style={[{ flex: 1 }, fonts.callout]}>Servers</Note>
                  <View
                    style={{
                      paddingHorizontal: 5,
                      height: 20,
                      marginRight: 15,
                      borderRadius: 4,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: colors.backgroundColor
                    }}
                  >
                    <Text style={[{ color: colors.secondary }, fonts.headline]}>{serversNumber}</Text>
                  </View>
                </Item>
                <Item visible={!!current} onClick={this.handleJumpToSSHKeys}>
                  <Icon type="Ionicons" name="ios-key" size={16} color={colors.minor} />
                  <Note style={[{ flex: 1 }, fonts.callout]}>SSH Keys</Note>
                  <View
                    style={{
                      paddingHorizontal: 5,
                      height: 20,
                      marginRight: 15,
                      borderRadius: 4,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: colors.backgroundColor
                    }}
                  >
                    <Text style={[{ color: colors.secondary }, fonts.headline]}>{sshkeysNumber}</Text>
                  </View>
                </Item>
                <Item testID="keypairs" onClick={this.handleJumpToKeyPairs}>
                  <Icon type="MaterialCommunityIcons" name="key-change" size={16} color={colors.minor} />
                  <Note style={[{ flex: 1 }, fonts.callout]}>Key Pairs</Note>
                </Item>
              </List>
            </ScrollView>
            {current &&
              current.provider === 'vultr' && (
                <List
                  title="Billing"
                  style={{ borderTopColor: colors.trivial, borderTopWidth: StyleSheet.hairlineWidth }}
                  titleStyle={{ color: colors.secondary }}
                >
                  <Item>
                    <Label>Balance</Label>
                    <Note>${format.number(current.bill!.balance, '0.00')}</Note>
                  </Item>
                  <Item>
                    <Label>This Month</Label>
                    <Note>${format.number(current.bill!.pendingCharges, '0.00')}</Note>
                  </Item>
                  <Item>
                    <Label>Remaining</Label>
                    <Note>${format.number(current.bill!.balance - current.bill!.pendingCharges, '0.00')}</Note>
                  </Item>
                </List>
              )}
            <View style={{ height: SafeArea.bottom }} />
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F1F1F1'
  }
});

const mapStateToProps = (
  { cloud: { accounts, instances }, settings: { currentAccount } }: AppState,
  { navigation }: SidebarProps
) => {
  return { accounts, instances, currentAccount };
};

const mapDispatchToProps = (dispatch: Dispatch, { navigation }: SidebarProps) => {
  return {
    changeAccount(account: string) {
      dispatch({ type: 'settings/current', payload: account });
    }
  };
};
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withTheme(Sidebar, false));
