import React from 'react';
import { RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import Spinner from 'react-native-spinkit';
import { NavigationScreenOptions, NavigationScreenProp, SafeAreaView } from 'react-navigation';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { getApi } from '..';
import { Icon, Item, Label, List, Note } from '../../../components';
import HeaderLeftClose from '../../../components/HeaderLeftClose';
import HeaderRight from '../../../components/HeaderRight';
import Theme, { withTheme } from '../../../components/Theme';
import KeyPairNewBut from '../../settings/components/KeyPairNewBut';
import KeyPairs from '../../settings/components/KeyPairs';
import { SSHKey } from '../Provider';
import { Account, KeyPair } from '../type';
import firebase, { RNFirebase } from 'react-native-firebase';

type Mode = 'choose' | 'manage';
interface SSHPublicKeysProps {
  navigation: NavigationScreenProp<any>;
  sshkeys: SSHKey[];
  mode: Mode;
  keyPairs: KeyPair[];
  values: SSHKey[];
  refresh: () => Promise<void>;
  deleteSSHKey: (id: string) => Promise<void>;
  updateSSHKey: (id: string, keyPair: KeyPair) => Promise<void>;
  uploadSSHKey: (keyPair: KeyPair) => Promise<void>;
  onChange: (value: SSHKey[]) => void;
  theme: Theme;
}

interface SSHPublicKeysState {
  loadingId?: string;
  loadingType?: 'keyPair' | 'sshkey';
  refreshing: boolean;
  values: SSHKey[];
}

class SSHPublicKeys extends React.Component<SSHPublicKeysProps, SSHPublicKeysState> {
  static headerRight = React.createRef<any>();
  static handleClickHeaderRight: any;
  static navigationOptions: ({ navigation }: SSHPublicKeysProps) => NavigationScreenOptions = ({
    navigation
  }: SSHPublicKeysProps) => {
    const title = navigation.getParam('callback') ? 'Choose keys' : 'SSH Keys';
    const dangerous = navigation as any;
    const options: NavigationScreenOptions = {
      headerTitle: title,
      headerRight: (
        <HeaderRight
          onClick={() => {
            SSHPublicKeys.handleClickHeaderRight();
          }}
          visible={false}
          ref={SSHPublicKeys.headerRight}
          title="Done"
        />
      )
    };
    if (dangerous.dangerouslyGetParent().state.routeName === 'SSHPublicKeys') {
      options.headerLeft = (
        <HeaderLeftClose
          onPress={() => {
            navigation.pop();
          }}
        />
      );
    }
    return options;
  };
  static defaultProps = {
    mode: 'manage'
  };
  analytics?: RNFirebase.Analytics;
  constructor(props: SSHPublicKeysProps) {
    super(props);
    this.state = { loadingId: undefined, loadingType: undefined, refreshing: false, values: props.values };
    SSHPublicKeys.handleClickHeaderRight = this.handleDone;
  }
  componentDidMount() {
    this.analytics = firebase.analytics();
    this.analytics.setCurrentScreen('SSHKeys', 'SSHKeys.tsx');
  }
  handleDelete = (data: SSHKey) => () => {
    const { deleteSSHKey } = this.props;
    this.setState({ loadingId: data.id, loadingType: 'sshkey' });
    deleteSSHKey(data.id as string);
  };
  handleKeyPairSyncSSHKey = (id: string, value: KeyPair) => async () => {
    const { updateSSHKey } = this.props;
    this.setState({ loadingId: id, loadingType: 'sshkey' });
    await updateSSHKey(id, value);
    this.setState({ loadingId: undefined, loadingType: undefined });
  };
  handleKeyPairToAccount = (value: KeyPair) => async () => {
    const { uploadSSHKey } = this.props;
    this.setState({ loadingId: value.id, loadingType: 'keyPair' });
    await uploadSSHKey(value);
    this.setState({ loadingId: undefined, loadingType: undefined });
  };
  handleJumpToKeyPairView = (value: KeyPair) => {
    const { navigation } = this.props;
    navigation.navigate('SSHKeyView', { id: value.id });
  };
  loading = () => {
    const {
      theme: { colors, fonts }
    } = this.props;
    return (
      <View style={styles.iconContainer}>
        <Spinner isVisible size={18} type="Arc" color={colors.primary} />
      </View>
    );
  };
  handleRefresh = async () => {
    const { refresh } = this.props;
    this.setState({ refreshing: true });
    await refresh();
    this.setState({ refreshing: false });
  };

  additional = (value: KeyPair) => {
    const { sshkeys } = this.props;
    const { loadingId, loadingType } = this.state;
    const {
      theme: { colors, fonts }
    } = this.props;
    if (loadingId === value.id && loadingType === 'keyPair') {
      return this.loading();
    }
    const sshkey = sshkeys.find(sshkey => sshkey.publicKey.includes(value.publicKey as string));
    if (sshkey) {
      if (sshkey.name !== value.name) {
        return (
          <TouchableOpacity onPress={this.handleKeyPairSyncSSHKey(sshkey.id, value)} style={styles.iconContainer}>
            <Icon type="MaterialCommunityIcons" name="cloud-sync" color={colors.primary} size={18} />
          </TouchableOpacity>
        );
      } else {
        return (
          <View style={styles.iconContainer}>
            <Icon type="Ionicons" name="ios-link" color={colors.primary} size={18} />
          </View>
        );
      }
    }
    return (
      <TouchableOpacity onPress={this.handleKeyPairToAccount(value)} style={styles.iconContainer}>
        <Icon type="MaterialCommunityIcons" name="cloud-upload" color={colors.primary} size={18} />
      </TouchableOpacity>
    );
  };
  handleChoose = (values: SSHKey[]) => {
    this.setState({ values: values });
    if (values.length > 0) {
      SSHPublicKeys.headerRight.current.show();
      this.handleDone(values);
    } else {
      SSHPublicKeys.headerRight.current.hide();
    }
  };
  handleDone = (values?: SSHKey[]) => {
    const { onChange } = this.props;
    onChange(values || this.state.values);
  };
  render() {
    const {
      sshkeys,
      keyPairs,
      theme: { colors, fonts },
      mode
    } = this.props;
    const { loadingId, loadingType } = this.state;
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.backgroundColor }]}>
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={this.handleRefresh}
              tintColor={colors.minor}
            />
          }
        >
          <List
            type={mode === 'choose' ? 'multi-choice' : 'list'}
            onChange={this.handleChoose}
            value={this.state.values}
            isEqual={(left, right) => left.id === right.id}
            title="Has been uploaded"
            style={{ marginTop: 13 }}
          >
            {sshkeys.map(data => (
              <Item key={`sshkeys-${data.id}`} value={data}>
                <Note>{data.name}</Note>
                <Label style={[{ flex: 1, textAlign: 'right', marginRight: 10 }, fonts.subhead]}>
                  {' '}
                  {/*getPublicKeyFingerprint(data.publicKey) Created on: {data.createdAt}*/}
                </Label>
                {loadingId === data.id && loadingType === 'sshkey'
                  ? this.loading()
                  : mode === 'manage' && (
                      <TouchableOpacity onPress={this.handleDelete(data)} style={styles.iconContainer}>
                        <Icon type="EvilIcons" name="trash" color={colors.colorful.red} size={24} />
                      </TouchableOpacity>
                    )}
              </Item>
            ))}
            {!sshkeys.length && (
              <Item>
                <Note>No SSH Keys</Note>
              </Item>
            )}
          </List>
          <KeyPairs
            title="In keychain"
            keyPairs={keyPairs}
            onClick={this.handleJumpToKeyPairView}
            additional={this.additional}
          />
        </ScrollView>
        <KeyPairNewBut />
      </SafeAreaView>
    );
  }
}

const mapStateToProps = ({ settings: { keyPairs }, cloud: { accounts } }: any, { navigation }: SSHPublicKeysProps) => {
  const account = navigation.getParam('data') as Account;
  const choose = !!navigation.getParam('callback');
  const values = navigation.getParam('values') || [];
  const mode: Mode = choose ? 'choose' : 'manage';
  return {
    mode,
    keyPairs: keyPairs,
    sshkeys: accounts.find((a: Account) => a.id === account.id).sshkeys || account.sshkeys,
    values,
    onChange: (value: SSHKey[]) => {
      if (!choose) {
        return;
      }
      navigation.getParam('callback')(value);
      navigation.goBack();
    }
  };
};

const mapDispatchToProps = (dispatch: Dispatch, { navigation }: SSHPublicKeysProps) => {
  const account = navigation.getParam('data') as Account;
  const api = getApi(account.id);
  return {
    async deleteSSHKey(id: string) {
      await api.destroySSHKey(id);
      const sshkeys = await api.sshkeys();
      dispatch({ type: 'cloud/updateAccount', payload: { id: account.id, sshkeys: sshkeys } });
    },
    async refresh() {
      const sshkeys = await api.sshkeys();
      dispatch({ type: 'cloud/updateAccount', payload: { id: account.id, sshkeys } });
    },
    async updateSSHKey(id: string, keyPair: KeyPair) {
      await api.updateSSHKey({
        id,
        name: keyPair.name,
        publicKey: (keyPair.publicKey as string) + keyPair.name
      });
      const sshkeys = await api.sshkeys();
      dispatch({ type: 'cloud/updateAccount', payload: { id: account.id, sshkeys: sshkeys } });
    },
    async uploadSSHKey(keyPair: KeyPair) {
      await api.createSSHKey({
        name: keyPair.name,
        publicKey: (keyPair.publicKey as string) + keyPair.name
      });
      const sshkeys = await api.sshkeys();
      dispatch({ type: 'cloud/updateAccount', payload: { id: account.id, sshkeys: sshkeys } });
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withTheme(SSHPublicKeys, false));

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  iconContainer: { height: 24, width: 44, alignItems: 'center', justifyContent: 'center' }
});
