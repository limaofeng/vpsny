import React from 'react';
import { connect } from 'react-redux';
import { NavigationScreenOptions, NavigationScreenProp, SafeAreaView } from 'react-navigation';
import { Alert } from 'react-native';
import { Dispatch } from 'redux';
import { List, Item, Label, Input, Select } from '../../../components';
import { Host } from '..';

import Server, { ServerProps } from '../components/Server';

const mapStateToProps = ({ settings: { keyPairs }, server: { hosts } }: any) => ({
  keyPairs,
  findHostByIP: (ip: string) => {
    return hosts.find((h: Host) => h.ip === ip);
  }
});

const mapDispatchToProps = (dispatch: Dispatch, { navigation }: ServerProps) => ({
  addHost(host: Host) {
    if (!host.ip || host.username) {
      Alert.alert('Host and user are required.');
      return;
    }
    dispatch({ type: 'server/addServer', payload: host });
    navigation.goBack();
  }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Server);
