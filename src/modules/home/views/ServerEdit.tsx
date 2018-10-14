import React from 'react';
import { connect } from 'react-redux';
import { NavigationScreenOptions, NavigationScreenProp, SafeAreaView } from 'react-navigation';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Dispatch } from 'redux';
import { List, Item, Label, Input, Select } from '../../../components';
import { Host } from '..';

import Server, { ServerProps } from '../components/Server';

const mapStateToProps = (
  { settings: { keyPairs }, server: { hosts } }: any,
  { navigation }: { navigation: NavigationScreenProp<any> }
) => ({
  keyPairs,
  host: hosts.find((h: Host) => h.id === navigation.getParam('id')),
  findHostByIP: (ip: string) => {
    return hosts.find((h: Host) => h.ip === ip);
  }
});

const mapDispatchToProps = (dispatch: Dispatch, { navigation }: ServerProps) => ({
  updateServer(data: Host) {
    dispatch({ type: 'server/updateServer', payload: { ...data, id: navigation.getParam('id') } });
    navigation.goBack();
  }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Server);
