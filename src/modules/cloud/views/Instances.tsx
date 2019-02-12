import { Item, ItemBody, Label, List } from '@components';
import React from 'react';
import { Dimensions, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import firebase, { RNFirebase } from 'react-native-firebase';
import { NavigationScreenOptions, NavigationScreenProp, SafeAreaView } from 'react-navigation';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { getApi, utils } from '../index';
import { ReduxState } from '../..';
import ActionButton from '../../../components/ActionButton';
import Card from '../../../components/Card';
import Theme, { withTheme, defaultTheme } from '../../../components/Theme';
import { SafeArea, sleep } from '../../../utils';
import { SSHConnection } from '../../ssh/type';
import { User } from '../Agent';
import InstanceActions, { OperateStatus } from '../components/InstanceActions';
import OSLogo from '../components/OSLogo';
import { Account, Instance, KeyPair } from '../type';
import { format } from '@utils';

interface InstancesProps {
  dispatch: Dispatch;
  navigation: NavigationScreenProp<any>;
  instances: Instance[];
  keyPairs: KeyPair[];
  connections: SSHConnection[];
  refresh: () => Promise<void>;
  track: (node: Instance) => Promise<void>;
  isNoAccount: boolean;
  currentAccount: string;
  theme: Theme;
}

interface InstantState {
  id: string;
  status: 'Pending' | 'Stopping' | 'Stopped' | 'Installing' | 'Resizeing' | 'Starting' | any;
}

interface InstancesState {
  instantStates: InstantState[];
  refreshing: boolean;
}

class Instances extends React.Component<InstancesProps, InstancesState> {
  static navigationOptions: NavigationScreenOptions = {
    tabBarVisible: false
  };
  static defaultProps = {
    onChange: () => {}
  };
  analytics?: RNFirebase.Analytics;
  constructor(props: InstancesProps) {
    super(props);
    this.state = { instantStates: [], refreshing: false };
  }
  componentDidMount() {
    this.analytics = firebase.analytics();
    this.analytics.setCurrentScreen('Servers', 'Instances.tsx');
    // this.props.navigation.navigate('VULTR_Backup');
  }
  handleRefresh = async (display: boolean = true) => {
    this.analytics!.logEvent('Refresh');
    const { refresh } = this.props;
    try {
      display && this.setState({ refreshing: true });
      await refresh();
      display && this.setState({ refreshing: false });
    } catch (e) {
      this.setState({ refreshing: false });
    }
  };

  handleActionExecute = async (operate: string, status: OperateStatus, data: Instance) => {
    const { track } = this.props;
    const { instantStates } = this.state;
    if (status != 'Complete') {
      instantStates.push({
        id: data.id,
        status
      });
      this.setState({ instantStates });
    } else {
      track(data);
      await sleep(200);
      this.setState({ instantStates: instantStates.filter(state => state.id !== data.id) });
    }
  };

  getStatusText(data: Instance) {
    const { instantStates } = this.state;
    const state = instantStates.find(state => state.id === data.id);
    if (state) {
      return state.status;
    }
    return data.status;
  }

  handleOpenTerminal = (data: Instance) => async () => {
    const { navigation } = this.props;
    navigation.navigate('Terminal', { value: data });
  };

  handleJumpToDeploy = () => {
    const { navigation, isNoAccount } = this.props;
    this.analytics!.logEvent('Press_Deploy');
    if (isNoAccount) {
      navigation.navigate('ChooseProvider', {
        callback: () => {
          navigation.navigate('AccountNew', {
            callback: (user: User) => {
              if (user) {
                navigation.navigate('Deploy');
              }
            }
          });
        }
      });
    } else {
      navigation.navigate('Deploy');
    }
  };

  handleJumpToView = (value: Instance) => () => {
    const { navigation } = this.props;
    navigation.navigate('InstanceView', { value });
  };

  render() {
    const { instances, isNoAccount, currentAccount } = this.props;
    const { colors, fonts } = defaultTheme;
    return (
      <SafeAreaView
        forceInset={{ bottom: 'never' }}
        style={[styles.container, { backgroundColor: colors.backgroundColor }]}
      >
        <ScrollView
          style={{ paddingTop: 13 }}
          contentContainerStyle={{ alignItems: 'center' }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={this.handleRefresh}
              tintColor={colors.minor}
            />
          }
        >
          {instances.filter(node => !currentAccount || node.account === currentAccount).map(data => {
            const status = this.getStatusText(data);
            const statusColor = utils.getStatusColor(status, colors);
            return (
              <Card key={`node-${data.id}`} onPress={this.handleJumpToView(data)}>
                <List
                  style={{ marginBottom: 0 }}
                  itemStyle={{
                    paddingHorizontal: 10,
                    backgroundColor: 'transparent'
                  }}
                >
                  <Item size={60}>
                    <ItemBody style={{ paddingRight: 0 }}>
                      <View style={{ width: 60, height: '100%', alignItems: 'flex-start', justifyContent: 'center' }}>
                        <View style={[styles.powerStatusContainer, { backgroundColor: colors.backgroundColorDeeper }]}>
                          <View
                            style={[
                              styles.powerStatus,
                              {
                                backgroundColor: statusColor
                              }
                            ]}
                          />
                        </View>
                        <OSLogo name={data.os} size={40} />
                      </View>
                      <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'center' }}>
                        <Text style={[{ color: colors.primary, lineHeight: 25 }, fonts.title]}>{data.name}</Text>
                      </View>
                      <View
                        style={{
                          height: 40,
                          flexDirection: 'row',
                          justifyContent: 'flex-end',
                          paddingVertical: 5
                        }}
                      >
                        {/*
                            TODO: 先隐藏 Terminal 功能
                          <TouchableOpacity
                            onPress={this.handleOpenTerminal(data)}
                            style={{
                              width: 30,
                              alignItems: 'center',
                              justifyContent: 'center',
                              marginRight: 5
                            }}
                          >
                            <Icon name="terminal" color="#4180EE" size={18} />
                          </TouchableOpacity>
                          */}
                        <InstanceActions
                          data={data}
                          theme={defaultTheme}
                          dispatch={this.props.dispatch}
                          navigation={this.props.navigation}
                          onExecute={this.handleActionExecute}
                        />
                      </View>
                    </ItemBody>
                  </Item>
                  <Item>
                    <Label>
                      {data.ram.size} MB RAM、 {data.vcpu} vCPU
                      {data.vcpu > 1 ? 's' : ''}、{format.fileSize(data.disk.size, 'GB')} {data.disk.type}
                    </Label>
                  </Item>
                  <Item>
                    <View style={{ flex: 1, justifyContent: 'center' }}>
                      <Text style={{ fontSize: 12, color: colors.secondary }}>{status}</Text>
                    </View>
                    <View style={{ justifyContent: 'center', alignItems: 'flex-end' }}>
                      <View style={{ height: 16 }}>
                        <Text style={{ fontSize: 12, color: colors.secondary, textAlign: 'right' }}>
                          {data.publicIP}
                        </Text>
                      </View>
                      <View style={{ height: 14 }}>
                        <Text style={{ fontSize: 11, color: colors.secondary, textAlign: 'right' }}>
                          {data.location.title}
                        </Text>
                      </View>
                    </View>
                  </Item>
                </List>
              </Card>
            );
          })}
          <Text style={{ color: 'transparent' }}>test-refresh</Text>
          {isNoAccount && (
            <View
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                height: Dimensions.get('window').height - SafeArea.bottom - SafeArea.top - 70
              }}
            >
              <Text style={[fonts.callout, { color: colors.secondary, height: 50 }]}>No Servers Here, Yet.</Text>
            </View>
          )}
        </ScrollView>
        <ActionButton
          testID="servers-deploy"
          position="right"
          radius={80}
          size={50}
          actionStyle={{ top: -SafeArea.bottom, left: -15 }}
          buttonColor={colors.primary}
          onPress={this.handleJumpToDeploy}
        />
      </SafeAreaView>
    );
  }
}

const mapStateToProps = (
  { cloud: { instances, accounts }, ssh: { connections }, settings: { currentAccount } }: ReduxState,
  { navigation }: InstancesProps
) => {
  navigation.state.currentAccount = currentAccount;
  return {
    connections: connections,
    instances: currentAccount ? instances.filter((a: Instance) => a.account === currentAccount) : instances,
    isNoAccount: !accounts.length
  };
};

const mapDispatchToProps = (dispatch: Dispatch, { navigation, instances }: InstancesProps) => {
  const source = {
    get accountId() {
      return navigation.state.currentAccount;
    },
    get api() {
      const api = this.accountId ? getApi(this.accountId) : false;
      return api || getApi('adapter');
    }
  };
  navigation.state.params = {
    refresh: async (uid: string, instances: Instance[]) => {
      dispatch({ type: 'cloud/instances', payload: { uid, instances } });
    }
  };
  return {
    dispatch,
    async get(id: string) {
      return await source.api.instance.get(id);
    },
    async start(id: string) {
      await source.api.instance.start(id);
    },
    async stop(id: string) {
      await source.api.instance.stop(id);
    },
    async restart(id: string) {
      await source.api.instance.start(id);
    },
    async destroy(id: string) {
      await source.api.instance.destroy(id);
    },
    async reinstall(id: string) {
      await source.api.instance.reinstall(id);
    },
    async track(node: Instance) {
      dispatch({ type: 'cloud/track', payload: { node } });
    },
    async refresh() {
      const instances = await source.api.instance.list();
      dispatch({ type: 'cloud/instances', payload: { uid: source.accountId, instances } });
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withTheme(Instances, false));

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  iconContainer: {
    height: 24,
    width: 44,
    alignItems: 'center',
    justifyContent: 'center'
  },
  powerStatusContainer: {
    top: -2,
    left: 24,
    borderRadius: 8,
    width: 16,
    height: 16,
    zIndex: 100,
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center'
  },
  powerStatus: {
    borderRadius: 5,
    width: 10,
    height: 10
  }
});
