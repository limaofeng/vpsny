import React from 'react';
import { connect } from 'react-redux';
import { NavigationScreenOptions, NavigationScreenProp, SafeAreaView } from 'react-navigation';

import { StyleSheet, Text, View, TouchableHighlight, ScrollView, Image, TouchableOpacity } from 'react-native';

import { List, Item, Label, Input, Icon, Note, ItemStart, ItemBody } from '../../../components';
import { AppState } from '../..';
import { Dispatch } from 'redux';
import Theme, { withTheme } from '../../../components/Theme';
import { SafeArea, format } from '../../../utils';
import { Account, Instance } from '../../cloud/type';
import AccountLable, { AllAccountLable, NewAccountLable } from '../components/AccountLable';
import { color } from '../../../utils/format';

interface SettingsProps {
  dispatch: any;
  navigation: NavigationScreenProp<any>;
  theme: Theme;
  accounts: Account[];
  instances: Instance[];
}

interface SettingsState {
  current?: Account;
}

class Settings extends React.Component<SettingsProps, SettingsState> {
  static navigationOptions: NavigationScreenOptions = {
    tabBarLabel: 'Settings'
  };

  constructor(props: SettingsProps) {
    super(props);
    this.state = { current: undefined };
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
  };

  handleJumpToSSHKeys = () => {
    const { navigation } = this.props;
    const { current } = this.state;
    navigation.navigate('SSHPublicKeys', { data: current });
  };

  handleLableClick = (account?: Account) => {
    const { navigation, instances } = this.props;
    this.setState({ current: account });
    const tabs = navigation.state.routes[0];
    const server = tabs.routes.find((route: any) => route.routeName === 'server');
    const {
      refresh = (uid: string, instances: Instance[]) => {
        console.warn('servers refresh not available !');
      }
    } = server.params;
    server.params = { ...server.params, data: account };
    if (account) {
      refresh(account.id, instances.filter(node => node.account === account!.id));
    } else {
      refresh(undefined, instances);
    }
  };

  render() {
    const { colors, fonts } = this.props.theme;
    const { accounts, instances } = this.props;
    const { current } = this.state;
    const serversNumber = current ? instances.filter(node => node.account === current.id).length : instances.length;
    const sshkeysNumber = current ? current.sshkeys.length : 0;
    return (
      <View style={{ flex: 1, backgroundColor: colors.backgroundColorDeeper }}>
        <View style={{ flex: 1, flexDirection: 'row' }}>
          <View style={{ width: 70, backgroundColor: '#F0F1F2', paddingTop: SafeArea.top, alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <AllAccountLable light={!current} onClick={this.handleLableClick} />
              {accounts.map(a => (
                <AccountLable
                  key={a.id}
                  light={current === a}
                  logo={a.provider}
                  value={a}
                  onClick={this.handleLableClick}
                />
              ))}
              <NewAccountLable onClick={this.handleJumpToNewAccount} />
            </View>
            <View>
              <TouchableOpacity
                onPress={this.handleJumpSettings}
                style={{ width: 70, height: 70, alignItems: 'center', justifyContent: 'center' }}
              >
                <Icon type="MaterialIcons" name="settings" color={colors.minor} size={28} />
              </TouchableOpacity>
            </View>
            <View style={{ height: SafeArea.bottom }} />
          </View>
          <View style={{ paddingTop: SafeArea.top, flex: 1 }}>
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
                    {current.provider.replace(/^\S/, s => s.toUpperCase())}
                  </Text>
                  <Text style={[{ color: colors.secondary }, fonts.headline]}>{current.email}</Text>
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
                <Item onClick={this.handleJumpToKeyPairs}>
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

const mapStateToProps = ({ cloud: { accounts, instances } }: AppState, { navigation }: SettingsProps) => {
  return { accounts, instances };
};

const mapDispatchToProps = (dispatch: Dispatch, { navigation }: SettingsProps) => {
  return {};
};
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withTheme(Settings, false));