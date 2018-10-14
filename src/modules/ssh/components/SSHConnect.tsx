import React from 'react';
import { connect } from 'react-redux';
import { NavigationScreenOptions, NavigationScreenProp } from 'react-navigation';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Dimensions, Alert } from 'react-native';
import { Dispatch } from 'redux';

import { List, Item, Label, Input, ItemBody, Icon, Password, Note } from '../../../components';
import Theme, { withTheme } from '../../../components/Theme';
import { KeyPair, Instance } from '../../cloud/type';
import { SafeArea, sleep } from '../../../utils';
import { AppState } from '../..';
import { SSHConnection } from '../type';
import { SSHClient } from '../SSHClient';
import SubmitButtonWrapper, { SubmitButton } from '../../../components/SubmitButton';

export interface SSHConnectProps {
  navigation: NavigationScreenProp<any>;
  onSuccess: (client: SSHClient) => void;
  dispatch: Dispatch;
  keyPair?: KeyPair;
  node: Instance;
  connection: SSHConnection;
  updateConnection?: (connection: SSHConnection, client: SSHClient) => Promise<void>;
  theme?: Theme;
}

interface SSHConnectState extends SSHConnection {
  loginType: 'password' | 'ssh';
  keyPairValue?: KeyPair;
  [key: string]: any;
}

class SSHConnect extends React.Component<SSHConnectProps, SSHConnectState> {
  static navigationOptions = ({ navigation }: SSHConnectProps): NavigationScreenOptions => {
    const node = navigation.getParam('value') as Instance;
    return {
      headerTitle: node.label
    };
  };
  save = React.createRef<SubmitButton>();
  handleNameChange: (value: any) => void;
  handleAddressChange: (value: any) => void;
  handlePortChange: (value: any) => void;
  handleUsernameChange: (value: any) => void;
  handlePassworChange: (value: any) => void;
  handleKeyChange: (value: any) => void;
  constructor(props: SSHConnectProps) {
    super(props);
    this.handleNameChange = this.handleValueChange('name');
    this.handleAddressChange = this.handleValueChange('ip');
    this.handlePortChange = this.handleValueChange('port');
    this.handleUsernameChange = this.handleValueChange('username');
    this.handlePassworChange = this.handleValueChange('password');
    this.handleKeyChange = this.handleValueChange('sshkey');
    this.state = {
      ...props.connection,
      keyPairValue: props.keyPair,
      loginType: !!props.connection.password ? 'password' : 'ssh'
    };
  }

  handleValueChange = (name: string) => (value: any) => {
    this.setState({ [name]: value });
  };

  handleJumpToKeyPairs = () => {
    const { navigation } = this.props;
    const { keyPair } = this.state;
    navigation.navigate('SSHKeyList', {
      value: keyPair ? { id: keyPair } : null,
      callback: (keyPair: KeyPair) => {
        this.setState({ keyPair: keyPair.publicKeyFingerprint, KeyPairValue: keyPair });
      }
    });
  };
  handleSave = async () => {
    const { updateConnection } = this.props;
    const { id, hostname, username, password, KeyPairValue } = this.state;
    const keyPair = KeyPairValue && KeyPairValue.publicKeyFingerprint;
    const port = parseInt(String(this.state.port));
    const client = new SSHClient(hostname, port, username, {
      type: keyPair ? 'ssh' : 'password',
      password,
      privateKey: KeyPairValue && KeyPairValue.privateKey,
      passphrase: KeyPairValue && KeyPairValue.passphrase,
      publicKey: KeyPairValue && KeyPairValue.publicKey
    });
    const button = this.save.current as SubmitButton;
    try {
      button.submittingText('Connecting');
      console.log('Connecting');
      await client.connect();
      button.submittingText('Authenticating');
      console.log('Authenticating');
      await sleep(1000);
      await client.authenticate();
      button.submittingText('Connected');
      updateConnection &&
        updateConnection({ id, hostname, port, username, password, keyPair, status: 'available' }, client);
    } catch (error) {
      if (error.domain) {
        try {
          client.disconnect();
        } catch (e) {
          console.warn(e);
        }
        throw new Error(error.userInfo.NSLocalizedDescription);
      }
    }
  };
  handleCleankeyPair = () => {
    this.setState({ keyPair: undefined });
  };
  handleLoginType = (type: 'password' | 'ssh') => () => {
    this.setState({ loginType: type });
  };
  render() {
    const { colors, fonts } = this.props.theme as Theme;
    const { hostname, username, keyPair, loginType, KeyPairValue, password, port, saveText } = this.state;
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.backgroundColorDeeper
          }
        ]}
        zIndex={500}
      >
        <ScrollView>
          <List>
            <Item>
              <Label>Host</Label>
              <Note>{hostname}</Note>
            </Item>
            <Item>
              <Label>User</Label>
              <Input
                defaultValue={username}
                onValueChange={this.handleUsernameChange}
                placeholder="User with sudo perm"
              />
            </Item>
            <Item>
              <ItemBody>
                <TouchableOpacity
                  onPress={this.handleLoginType('password')}
                  style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
                >
                  <View style={{ width: 24, height: 24, alignItems: 'center', justifyContent: 'center' }}>
                    {loginType === 'password' ? (
                      <Icon
                        style={{ height: 17, lineHeight: 17, paddingTop: 1 }}
                        type="Ionicons"
                        name="ios-checkmark-circle"
                        color={colors.primary}
                        size={20}
                      />
                    ) : (
                      <Icon type="FontAwesome" name="circle-thin" color={colors.trivial} size={18} />
                    )}
                  </View>
                  <Label style={{ flex: 1 }}>Use plan password</Label>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={this.handleLoginType('ssh')}
                  style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
                >
                  <View style={{ width: 24, height: 24, alignItems: 'center', justifyContent: 'center' }}>
                    {loginType === 'ssh' ? (
                      <Icon
                        type="Ionicons"
                        style={{ height: 17, lineHeight: 17, paddingTop: 1 }}
                        name="ios-checkmark-circle"
                        color={colors.primary}
                        size={20}
                      />
                    ) : (
                      <Icon type="FontAwesome" name="circle-thin" color={colors.trivial} size={18} />
                    )}
                  </View>
                  <Label style={{ flex: 1 }}>Use SSH key</Label>
                </TouchableOpacity>
              </ItemBody>
            </Item>
            {loginType === 'password' && (
              <Item>
                <Label>Password</Label>
                <Password defaultValue={password} placeholder="Password" onValueChange={this.handlePassworChange} />
              </Item>
            )}
            {loginType === 'ssh' && (
              <Item onClick={this.handleJumpToKeyPairs} push={!keyPair}>
                <Label>Private Key</Label>
                <View style={{ flexDirection: 'column', flex: 1 }}>
                  <View style={[{ flexDirection: 'row', alignItems: 'center', flex: 1 }]}>
                    <View pointerEvents="box-only" style={{ flex: 1, flexDirection: 'column' }}>
                      <Input
                        style={{ height: 24 }}
                        placeholder="Select a Private Key"
                        editable={false}
                        clearButtonMode="always"
                        value={keyPair && KeyPairValue.name}
                      />
                    </View>
                    {keyPair && (
                      <TouchableOpacity style={{ width: 28 }} onPress={this.handleCleankeyPair} activeOpacity={1}>
                        <Icon
                          type="Ionicons"
                          style={{ marginTop: 2, marginRight: 10 }}
                          color={colors.trivial}
                          size={17}
                          name="ios-close-circle"
                        />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </Item>
            )}
            <Item>
              <Label>Port</Label>
              <Input
                defaultValue={String(port)}
                onValueChange={this.handlePortChange}
                placeholder="22"
                keyboardType="number-pad"
              />
            </Item>
          </List>
          <View style={{ flex: 1, paddingHorizontal: 20, marginTop: 10 }}>
            <SubmitButtonWrapper ref={this.save} onSubmit={this.handleSave} title="Save" />
          </View>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});

const mapStateToProps = ({ settings: { keyPairs } }: AppState, { node, connection }: SSHConnectProps) => {
  let keyPair;
  if (connection.keyPair) {
    keyPair = keyPairs.find(key => key.publicKeyFingerprint === connection.keyPair);
    connection.keyPair = keyPair ? keyPair.id : undefined;
  }
  return { connection: connection, keyPair };
};
const mapDispatchToProps = (dispatch: Dispatch, { onSuccess }: SSHConnectProps) => ({
  async updateConnection(connection: SSHConnection, client: SSHClient) {
    dispatch({ type: 'ssh/connection', payload: connection });
    await sleep(200);
    if (onSuccess) {
      onSuccess(client);
    } else {
      await client.disconnect();
    }
  }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withTheme(SSHConnect, false));
