import { HeaderLeftClose, Icon, Item, ItemStart, List, Note, Theme, withTheme } from '@components';
import { sleep } from '@utils';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import firebase, { RNFirebase } from 'react-native-firebase';
import { NavigationScreenOptions, NavigationScreenProp, SafeAreaView } from 'react-navigation';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { Account } from '../../cloud/type';
import { logos } from '../components/AccountLable';

type Mode = 'choose' | 'manage';

interface SettingsProps {
  navigation: NavigationScreenProp<any>;
  accounts: Account[];
  value: Account;
  onChange: (value: Account) => void;
  mode?: Mode;
  theme?: Theme;
}

interface SettingsState {
  value: Account;
}

class Settings extends React.Component<SettingsProps, SettingsState> {
  static handleClose: any;
  static navigationOptions = ({ navigation }: SettingsProps): NavigationScreenOptions => {
    return {
      headerTitle: 'Settings',
      headerBackTitle: 'Back',
      headerLeft: (
        <HeaderLeftClose
          testID="close-settings"
          onPress={() => {
            Settings.handleClose();
          }}
        />
      )
    };
  };
  analytics?: RNFirebase.Analytics;
  isFocused: boolean = false;

  constructor(props: SettingsProps) {
    super(props);
    this.state = { value: props.value };
    Settings.handleClose = this.handleClose;
  }

  componentDidMount() {
    this.analytics = firebase.analytics();
    this.analytics.setCurrentScreen('Settings', 'Settings.tsx');
    this.props.navigation.addListener('didBlur', () => {
      this.isFocused = false;
    });
    this.props.navigation.addListener('didFocus', () => {
      this.isFocused = true;
    });
  }

  handleClose = async () => {
    const { navigation } = this.props;
    await this.waitFocused();
    navigation.pop();
  }

  async waitFocused(timeout: number = 5000) {
    const time = Date.now();
    while (!this.isFocused) {
      console.log('waitFocused...');
      await sleep(100);
      if (Date.now() - time >= timeout) {
        throw 'await focused error';
      }
    }
  }

  handleJumpToNewAccount = async () => {
    this.analytics!.logEvent('Press_AddAccount');
    const { navigation } = this.props;
    await this.waitFocused();
    navigation.navigate('AccountNew');
  };

  handleJumpToAccountView = async (value: Account) => {
    this.analytics!.logEvent('Press_AccountView', {
      id: value.id,
      provider: value.provider,
      name: value.name,
      email: value.email
    });
    const { navigation } = this.props;
    await this.waitFocused();
    navigation.navigate('AccountView', { data: value });
  };

  handleJumpToKeyPairs = async () => {
    this.analytics!.logEvent('Press_KeyPairs');
    const { navigation } = this.props;
    await this.waitFocused();
    navigation.navigate('KeyPairs');
  };

  handleDone = () => {
    const { onChange } = this.props;
    const { value } = this.state;
    onChange(value);
  };

  render() {
    const { accounts, mode } = this.props;
    const isSelection = mode === 'choose';
    const { colors, fonts } = this.props.theme as Theme;
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.backgroundColor }]}>
        <ScrollView>
          <List
            value={this.state.value}
            valueKey="id"
            style={{ marginTop: 13 }}
            type={isSelection ? 'radio-group' : 'list'}
            title="Accounts"
          >
            {accounts.map(a => (
              <Item
                testID="account-list-item"
                size={62}
                key={`account-${a.id}`}
                value={a}
                onClick={this.handleJumpToAccountView}
                push
              >
                <ItemStart>
                  <Image source={logos[a.provider]} resizeMode="contain" style={{ height: 32, width: 32 }} />
                </ItemStart>
                <View style={{ flex: 1 }}>
                  <Note style={[{ color: colors.major, textAlignVertical: 'bottom' }, fonts.callout]}>{a.title}</Note>
                  <Note style={{ color: colors.secondary, marginTop: 4 }}>{a.alias || a.name}</Note>
                </View>
              </Item>
            ))}
            <Item testID="new-account" size={44} skip onClick={this.handleJumpToNewAccount}>
              <View style={{ alignItems: 'center', flex: 1 }}>
                <Note style={[fonts.callout, { color: colors.primary }]}>Add Account</Note>
              </View>
            </Item>
          </List>
          <List>
            <Item testID="settings-keypairs" onClick={this.handleJumpToKeyPairs} push>
              <Icon type="MaterialCommunityIcons" name="key-change" size={16} color="#4180EE" />
              <Note>Key Pairs</Note>
            </Item>
          </List>
          <View style={{ alignItems: 'center', marginTop: 50 }}>
            <Text style={[{ color: colors.minor }, fonts.footnote]}>
              Version {DeviceInfo.getVersion()} ({DeviceInfo.getBuildNumber()})
            </Text>
          </View>
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

const mapStateToProps = ({ cloud: { accounts } }: any, { navigation }: any) => {
  const onChange = navigation.getParam('callback');
  const value = navigation.getParam('value');
  const mode: Mode = !!onChange ? 'choose' : 'manage';
  return {
    accounts: accounts as Account[],
    mode,
    value,
    onChange: (value: Account) => {
      if (!onChange) {
        return;
      }
      onChange(value);
      navigation.goBack();
    }
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withTheme(Settings, false));
