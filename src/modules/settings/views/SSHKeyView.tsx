import forge from 'node-forge';
import React from 'react';
import { Alert, Clipboard, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NavigationScreenOptions, NavigationScreenProp, SafeAreaView } from 'react-navigation';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { Icon, Input, Item, ItemDivider, Label, List } from '../../../components';
import Theme, { withTheme } from '../../../components/Theme';
import { KeyPair } from '../../cloud/type';
import { SafeArea, debounce } from '@utils';
import firebase, { RNFirebase } from 'react-native-firebase';

interface SSHKeyViewProps {
  navigation: NavigationScreenProp<any>;
  keyPair: KeyPair;
  deleteKeyPair: () => void;
  updateKeyPair: (value: any) => void;
  theme?: Theme;
}

interface SSHKeyViewState {
  name?: string;
  passphrase?: string;
}

class SSHKeyView extends React.Component<SSHKeyViewProps, SSHKeyViewState> {
  static navigationOptions = ({ navigation }: SSHKeyViewProps): NavigationScreenOptions => {
    return {
      headerTitle: 'Key Pair'
    };
  };
  handleChangePassphrase: (value: string) => void;
  handleChangeName: (value: string) => void;
  handlePublicKey: (value: string) => void;
  handleSave: (value: any) => void;
  analytics?: RNFirebase.Analytics;
  constructor(props: SSHKeyViewProps) {
    super(props);
    const { name, passphrase } = this.props.keyPair;
    this.handleChangeName = this.handleChange('name');
    this.handleChangePassphrase = this.handleChange('passphrase');
    this.handlePublicKey = this.handleChange('publicKey');
    this.handleSave = debounce(
      { name, passphrase },
      {
        wait: 500,
        callback: data => {
          props.updateKeyPair(data);
        }
      }
    );
    this.state = { name, passphrase };
  }

  componentDidMount() {
    this.analytics = firebase.analytics();
    this.analytics.setCurrentScreen('KeyPairView', 'KeyPairView.tsx');
  }

  select = (plan: any) => {
    const { navigation } = this.props;
    return () => {
      navigation.getParam('callback')(plan);
      navigation.goBack();
    };
  };

  handleChange = (field: string) => async (value: string) => {
    const current = { name: this.state.name, passphrase: this.state.passphrase, [field]: value };
    this.setState({ [field]: value });
    this.handleSave(current);
  };

  handleCopyPublicKeyToOpenSSH = () => {
    const { keyPair } = this.props;
    if (!keyPair.publicKey) {
      try {
        const privateKey = keyPair.privateKey as string;
        const forgePrivateKey = privateKey.includes('ENCRYPTED')
          ? forge.pki.decryptRsaPrivateKey(privateKey, keyPair.passphrase)
          : forge.pki.privateKeyFromPem(privateKey);
        const forgePublicKey = forge.pki.setRsaPublicKey(forgePrivateKey.n, forgePrivateKey.e);
        const publicKey = forge.ssh.publicKeyToOpenSSH(forgePublicKey);
        this.handlePublicKey(publicKey);
        Clipboard.setString(publicKey + keyPair.name);
      } catch (err) {
        Alert.alert(
          'Error',
          'Cloud not convert private key from PEM; PEM is encrypted',
          [{ text: 'OK', onPress: () => console.log('OK Pressed') }],
          { cancelable: false }
        );
        return;
      }
    } else {
      Clipboard.setString(keyPair.publicKey + keyPair.name);
    }
  };

  setClipboardContent = () => {
    const { keyPair } = this.props;
    Clipboard.setString(keyPair.privateKey as string);
  };

  handleDeleteKeyPair = () => {
    const { deleteKeyPair } = this.props;
    Alert.alert('Confirm', 'Are you sure?', [{ text: 'Cancel' }, { text: 'Ok', onPress: deleteKeyPair }], {
      cancelable: false
    });
  };

  render() {
    const { colors, fonts } = this.props.theme as Theme;
    const { keyPair } = this.props;
    return (
      <SafeAreaView
        forceInset={{ bottom: 'never' }}
        style={[styles.container, { backgroundColor: colors.backgroundColor }]}
      >
        <ScrollView>
          <View style={{ marginTop: 17 }}>
            <List title="Actions">
              <Item onClick={this.handleCopyPublicKeyToOpenSSH}>
                <Icon type="FontAwesome5" name="copy" size={16} color={colors.primary} />
                <Label style={{ color: colors.primary }}>Copy public key</Label>
              </Item>
              <Item testID="keypairs-delete" onClick={this.handleDeleteKeyPair}>
                <Icon type="EvilIcons" name="trash" color={colors.colorful.red} size={24} />
                <Label style={{ color: colors.colorful.red }}>Delete</Label>
              </Item>
            </List>

            <List title="Settings">
              <Item>
                <Label>Name</Label>
                <Input testID="keypairs-view-name" onValueChange={this.handleChangeName} defaultValue={keyPair.name} />
              </Item>
              <Item>
                <Label>Password</Label>
                <Input
                  testID="keypairs-view-password"
                  onValueChange={this.handleChangePassphrase}
                  secureTextEntry
                  defaultValue={keyPair.passphrase}
                  placeholder="No password"
                />
              </Item>
            </List>

            <View>
              <ItemDivider>Private Key</ItemDivider>
              <TouchableOpacity activeOpacity={1} onPress={this.setClipboardContent}>
                <Text
                  selectable
                  style={[
                    {
                      backgroundColor: colors.backgroundColorDeeper,
                      padding: 15,
                      color: colors.major
                    },
                    fonts.footnote
                  ]}
                >
                  {this.props.keyPair.privateKey}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={{ alignItems: 'center', marginTop: 50 }}>
            <Text style={[{ color: colors.minor }, fonts.footnote]}>All keys are saved to your keychain securely.</Text>
          </View>
          <View style={{ height: SafeArea.bottom }} />
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

const mapStateToProps = ({ settings: { keyPairs } }: any, { navigation }: SSHKeyViewProps) => ({
  keyPair: keyPairs.find((k: any) => k.id === navigation.getParam('id')) || {}
});

const mapDispatchToProps = (dispatch: Dispatch, { navigation }: SSHKeyViewProps) => ({
  deleteKeyPair() {
    const id = navigation.getParam('id');
    dispatch({ type: 'settings/deleteKeyPair', payload: { id } });
    navigation.goBack();
  },
  updateKeyPair(keyPair: any) {
    const id = navigation.getParam('id');
    dispatch({ type: 'settings/updateKeyPair', payload: { id, ...keyPair } });
  }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withTheme(SSHKeyView, false));
