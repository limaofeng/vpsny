import React from 'react';
import { connect } from 'react-redux';
import { NavigationScreenOptions, NavigationScreenProp, SafeAreaView } from 'react-navigation';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Dispatch } from 'redux';
import { List, Item, Label, Input, Select } from '../../../components';
import { Host } from '..';
import { KeyPair } from '../../settings';

export interface ServerProps {
  dispatch: any;
  keyPairs: KeyPair[];
  host?: Host;
  addHost: (host: Host) => void;
  updateServer: (host: Host) => void;
  navigation: NavigationScreenProp<any>;
}

interface ServerState {
  form: Host | any;
}

export default class Server extends React.Component<ServerProps, ServerState> {
  static handleSave: () => void;
  static navigationOptions = ({ navigation }: ServerProps): NavigationScreenOptions => {
    return {
      title: navigation.state.routeName == 'ServerEdit' ? navigation.getParam('title') : 'Add Server',
      headerRight: (
        <TouchableOpacity
          style={{ paddingRight: 15 }}
          onPress={() => {
            Server.handleSave();
          }}
        >
          <Text style={{ fontSize: 13, color: '#4180EE' }}>Save</Text>
        </TouchableOpacity>
      ),
      headerBackTitle: ' ',
    };
  };
  handleNameChange: (value: any) => void;
  handleAddressChange: (value: any) => void;
  handlePortChange: (value: any) => void;
  handleUsernameChange: (value: any) => void;
  handlePassworChange: (value: any) => void;
  handleKeyChange: (value: any) => void;
  constructor(props: ServerProps) {
    super(props);
    Server.handleSave = this.handleSave;
    this.handleNameChange = this.field('name');
    this.handleAddressChange = this.field('ip');
    this.handlePortChange = this.field('port', value => (value ? parseInt(value) : 22));
    this.handleUsernameChange = this.field('username');
    this.handlePassworChange = this.field('password');
    this.handleKeyChange = this.field('sshkey');
    this.state = {
      form: props.host || {}
    };
  }
  field = (name: string, onChange: (value: any) => any = value => value) => (value: any) => {
    console.log(name, value, onChange(value));
    this.setState({ form: { ...this.state.form, [name]: onChange(value) } });
  };
  toSSHKey = () => {
    const { navigation } = this.props;
    navigation.navigate('SSHKeyList');
  };
  handleSave = () => {
    const { addHost, host, updateServer } = this.props;
    if (host) {
      updateServer(this.state.form as Host);
    } else {
      addHost(this.state.form as Host);
    }
  };
  render() {
    const { keyPairs } = this.props;
    const { name, ip, port, username, password } = this.state.form;
    console.log(keyPairs);
    return (
      <SafeAreaView style={[styles.container, {}]}>
        <View>
          <List title="Server">
            <Item>
              <Label style={{ color: '#88898A' }}>Name</Label>
              <Input defaultValue={name} onValueChange={this.handleNameChange} placeholder="My Server" />
            </Item>
            <Item>
              <Label style={{ color: '#88898A' }}>Host</Label>
              <Input
                defaultValue={ip}
                onValueChange={this.handleAddressChange}
                placeholder="Domain or IP"
                keyboardType="ascii-capable"
              />
            </Item>
            <Item>
              <Label style={{ color: '#88898A' }}>Port</Label>
              <Input
                defaultValue={port && String(port)}
                onValueChange={this.handlePortChange}
                placeholder="22"
                keyboardType="number-pad"
              />
            </Item>
            <Item>
              <Label style={{ color: '#88898A' }}>User</Label>
              <Input
                defaultValue={username}
                onValueChange={this.handleUsernameChange}
                placeholder="User with sudo perm"
              />
            </Item>
            <Item>
              <Label style={{ color: '#88898A' }}>Password</Label>
              <Input
                defaultValue={password}
                onValueChange={this.handlePassworChange}
                secureTextEntry
                placeholder="password"
              />
            </Item>
          </List>

          <List title="Key">
            <Item>
              <Label style={{ color: '#88898A' }}>Private Key</Label>
              <Select
                title="Private Key"
                placeholder={{
                  label: 'Select a Private Key',
                  value: null
                }}
                cancelText="cancel"
                confirmText="confirm"
                items={keyPairs.map(key => ({ label: key.name, value: key.id }))}
                onValueChange={this.handleKeyChange}
              />
            </Item>
            <Item onClick={this.toSSHKey} push>
              <Label style={{ color: '#4180EE' }}>Add or Create Private Keys</Label>
            </Item>
          </List>
        </View>
        <View style={{ alignItems: 'center', marginTop: 50 }}>
          <Text style={{ color: '#A9AAAB', fontSize: 12 }}>Keys/Passwords are save to Keychain securely.</Text>
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 17,
    backgroundColor: '#F1F1F1'
  }
});
