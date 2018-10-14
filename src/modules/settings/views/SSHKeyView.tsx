import React from 'react';
import { SafeAreaView, NavigationScreenProp, NavigationScreenOptions } from 'react-navigation';
import { StyleSheet, ScrollView, Text, View, Alert, Clipboard, TouchableOpacity, Dimensions } from 'react-native';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import forge from 'node-forge';
import { isEqual } from 'lodash';
import Ionicons from 'react-native-vector-icons/Ionicons';
import BottomRegion from '../../../components/BottomRegion';
import { List, Item, Label, Input, ItemBody, ItemDivider, Icon } from '../../../components';
import Theme, { withTheme } from '../../../components/Theme';

import { KeyPair } from '../../cloud/type';
import { SafeArea } from '../../../utils';

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
  mode: 'edit' | 'view';
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
  constructor(props: SSHKeyViewProps) {
    super(props);
    const { name, passphrase } = this.props.keyPair;
    this.handleChangeName = this.handleChange('name');
    this.handleChangePassphrase = this.handleChange('passphrase');
    this.handlePublicKey = this.handleChange('publicKey');
    this.state = { name, passphrase, mode: 'view' };
  }

  select = (plan: any) => {
    const { navigation } = this.props;
    return () => {
      navigation.getParam('callback')(plan);
      navigation.goBack();
    };
  };

  handleChange = (field: string) => (value: string) => {
    const {
      keyPair: { name, passphrase },
      updateKeyPair
    } = this.props;
    const keyPair = { name, passphrase };
    const current = { name: this.state.name, passphrase: this.state.passphrase, [field]: value };

    this.setState({ mode: isEqual(keyPair, current) ? 'view' : 'edit', [field]: value });
  };

  handleSave = () => {
    const { updateKeyPair } = this.props;
    const { name, passphrase } = this.state;
    updateKeyPair({ name, passphrase });
    this.setState({ mode: 'view' });
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
    const { mode } = this.state;
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
              <Item onClick={this.handleDeleteKeyPair}>
                <Icon type="EvilIcons" name="trash" color={colors.colorful.red} size={24} />
                <Label style={{ color: colors.colorful.red }}>Delete</Label>
              </Item>
            </List>

            <List title="Settings">
              <Item>
                <Label>Name</Label>
                <Input onValueChange={this.handleChangeName} defaultValue={keyPair.name} />
              </Item>
              <Item>
                <Label>Password</Label>
                <Input
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
              <Text
                style={[
                  {
                    textAlign: 'center',
                    color: colors.backgroundColorDeeper
                  },
                  fonts.callout
                ]}
              >
                Save
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
