import React from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { NavigationScreenOptions, NavigationScreenProp, SafeAreaView } from 'react-navigation';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { Icon, Item, ItemStart, List, Note } from '../../../components';
import HeaderLeftClose from '../../../components/HeaderLeftClose';
import HeaderRight from '../../../components/HeaderRight';
import Theme, { withTheme } from '../../../components/Theme';
import { Account } from '../../cloud/type';
import { logos } from '../components/AccountLable';
import firebase, { RNFirebase } from 'react-native-firebase';

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
  static headerRight = React.createRef<any>();
  static handleClickHeaderRight: any;
  static navigationOptions = ({ navigation }: SettingsProps): NavigationScreenOptions => {
    return {
      headerTitle: 'Settings',
      headerBackTitle: 'Back',
      headerLeft: (
        <HeaderLeftClose
          testID="close-settings"
          onPress={() => {
            navigation.pop();
          }}
        />
      ),
      headerRight: (
        <HeaderRight
          onClick={() => {
            Settings.handleClickHeaderRight();
          }}
          visible={false}
          ref={Settings.headerRight}
          title="Done"
        />
      )
    };
  };
  analytics?: RNFirebase.Analytics;

  constructor(props: SettingsProps) {
    super(props);
    this.state = { value: props.value };
    Settings.handleClickHeaderRight = this.handleDone;
  }

  componentDidMount() {
    this.analytics = firebase.analytics();
    this.analytics.setCurrentScreen('Settings', 'Settings.tsx');
  }

  handleChange = (value: Account) => {
    this.setState({ value });
    if (this.props.value.id !== value.id) {
      Settings.headerRight.current.show();
    } else {
      Settings.headerRight.current.hide();
    }
  };

  handleJumpToNewAccount = () => {
    this.analytics!.logEvent('Press_AddAccount');
    const { navigation } = this.props;
    navigation.navigate('AccountNew');
  };

  handleJumpToAccountView = (value: Account) => {
    this.analytics!.logEvent('Press_AccountView', {
      id: value.id,
      provider: value.provider,
      name: value.name,
      email: value.email
    });
    const { navigation } = this.props;
    navigation.navigate('AccountView', { data: value });
  };

  handleJumpToKeyPairs = () => {
    this.analytics!.logEvent('Press_KeyPairs');
    const { navigation } = this.props;
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
            onChange={this.handleChange}
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
