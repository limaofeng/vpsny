import { HeaderRight, Item, List, Note, Theme, withTheme } from '@components';
import { ReduxState } from '@modules';
import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { NavigationScreenOptions, NavigationScreenProp, SafeAreaView } from 'react-navigation';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { Account } from '../type';
import { CloudManager } from '../providers';

type Mode = 'choose' | 'manage';

interface AccountListProps {
  navigation: NavigationScreenProp<any>;
  accounts: Account[];
  value: Account;
  onChange: (value: Account) => void;
  mode?: Mode;
  theme?: Theme;
}

interface AccountListState {
  value: Account;
}

class AccountList extends React.Component<AccountListProps, AccountListState> {
  static headerRight = React.createRef<any>();
  static handleClickHeaderRight: any;
  static navigationOptions: ({ navigation }: AccountListProps) => NavigationScreenOptions = ({
    navigation
  }: AccountListProps) => {
    const title = navigation.getParam('callback') ? 'Choose Account' : 'Accounts';
    return {
      headerTitle: title,
      headerBackTitle: ' ',
      headerRight: (
        <HeaderRight
          onClick={() => {
            AccountList.handleClickHeaderRight();
          }}
          visible={false}
          ref={AccountList.headerRight}
          title="Done"
        />
      )
    };
  };

  constructor(props: AccountListProps) {
    super(props);
    this.state = { value: props.value };
    AccountList.handleClickHeaderRight = this.handleDone;
  }

  handleChange = (value: Account) => {
    this.setState({ value });
    if (this.props.value.id !== value.id) {
      AccountList.headerRight.current.show();
      this.handleDone(value);
    } else {
      AccountList.headerRight.current.hide();
    }
  };

  handleCreate = () => {
    const { navigation } = this.props;
    navigation.navigate('ChooseProvider', {
      callback: () => {
        navigation.navigate('AccountNew');
      }
    });
  };

  handleClick = (value: any) => {
    const { navigation } = this.props;
    navigation.navigate('AccountView', { data: value });
  };

  handleDone = (value?: Account) => {
    const { onChange } = this.props;
    onChange(value || this.state.value);
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
            title="Cloud Server Account"
          >
            {accounts.map(a => (
              <Item key={`account-${a.id}`} value={a} push={!isSelection}>
                <Note>
                  {a.provider} - {a.email || a.name}
                </Note>
              </Item>
            ))}
            {!accounts.length && (
              <Item skip>
                <Note> No Vultr account</Note>
              </Item>
            )}

            {/* <Item skip onClick={this.handleCreate} push>
              <Note>Connect to your cloud providers</Note>
            </Item> */}
          </List>
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

const mapStateToProps = ({ cloud: { accounts } }: ReduxState, { navigation }: AccountListProps) => {
  const onChange = navigation.getParam('callback');
  const value = navigation.getParam('value');
  const mode: Mode = !!onChange ? 'choose' : 'manage';
  const providers = CloudManager.getProviders()
    .filter(p => p.features.deploy)
    .map(p => p.id);
  return {
    accounts: accounts.filter(a => providers.some(p => p === a.provider)),
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
)(withTheme(AccountList, false));
