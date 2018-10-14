import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, RefreshControl, Dimensions, Image } from 'react-native';
import { SafeAreaView, NavigationScreenProp, NavigationScreenOptions, HeaderBackButton } from 'react-navigation';
import Spinner from 'react-native-spinkit';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';

import { Icon, List, Item, Note, Label, ItemBody } from '../../../components';
import { KeyPair, Instance, Account } from '../type';
import Theme, { withTheme } from '../../../components/Theme';
import DashLine from '../../../components/DashLine';
import ActionButton from '../../../components/ActionButton';
import { utils, getApi } from '../';
import MergeAgent from '../AgentAdapter';
import InstanceActions, { Operate, OperateStatus } from '../components/InstanceActions';
import { sleep, format, SafeArea } from '../../../utils';
import OSLogo from './OSLogo';
import Card from '../../../components/Card';
import { getSSHClient } from '../../ssh';
import { AppState } from '../..';
import { User } from '../Agent';
import { SSHConnection } from '../../ssh/type';

interface InstancesProps {
  navigation: NavigationScreenProp<any>;
  instances: Instance[];
  keyPairs: KeyPair[];
  connections: SSHConnection[];
  refresh: () => Promise<void>;
  track: (node: Instance) => Promise<void>;
  isNoAccount: boolean;
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
  constructor(props: InstancesProps) {
    super(props);
    this.state = { instantStates: [], refreshing: false };
  }
  handleRefresh = async (display: boolean = true) => {
    const { refresh } = this.props;
    display && this.setState({ refreshing: true });
    await refresh();
    display && this.setState({ refreshing: false });
  };

  handleActionExecute = async (operate: Operate, status: OperateStatus, data: Instance) => {
    const { instantStates } = this.state;
    const { track } = this.props;
    console.log(operate, status);
    if (status == 'start') {
      switch (operate) {
        case 'stop':
          instantStates.push({
            id: data.id,
            status: 'Stopping'
          });
          break;
        case 'reinstall':
        case 'start':
        case 'reboot':
        case 'delete':
        default:
          instantStates.push({
            id: data.id,
            status: 'Pending'
          });
      }
      this.setState({ instantStates });
    } else {
      track(data);
      await sleep(1000);
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
    const {
      instances,
      theme: { colors, fonts }
    } = this.props;
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
          {instances.map(data => {
            const status = this.getStatusText(data);
            const statusColor = utils.getStatusColor(status, colors);
            return (
              <Card key={`node-${data.id}`}>
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
                        <TouchableOpacity activeOpacity={0.8} onPress={this.handleJumpToView(data)}>
                          <Text style={[{ color: colors.primary, lineHeight: 25 }, fonts.title]}>{data.name}</Text>
                        </TouchableOpacity>
                      </View>
                      <View
                        style={{
                          height: 40,
                          flexDirection: 'row',
                          justifyContent: 'flex-end',
                          paddingVertical: 5
                        }}
                      >
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
                        <InstanceActions
                          data={data}
                          onExecute={this.handleActionExecute}
                        />
                      </View>
                    </ItemBody>
                  </Item>
                  <Item>
                    <Label>
                      {data.ram} RAM、 {data.vcpu} vCPU
                      {data.vcpu > 1 ? 's' : ''}、 {data.disk}
                    </Label>
                  </Item>
                  <Item>
                    <View style={{ flex: 1, justifyContent: 'center' }}>
                      <Text style={{ fontSize: 12, color: colors.secondary }}>{status}</Text>
                    </View>
                    <View style={{ justifyContent: 'center', alignItems: 'flex-end' }}>
                      <View style={{ height: 16 }}>
                        <Text style={{ fontSize: 12, color: colors.secondary, textAlign: 'right' }}>
                          {data.hostname}
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
        </ScrollView>
        <ActionButton
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
  { cloud: { instances, accounts }, ssh: { connections } }: AppState,
  { navigation }: InstancesProps
) => {
  const account = navigation.getParam('data');
  return {
    connections: connections,
    instances: account ? instances.filter((a: Instance) => a.account === account.id) : instances,
    isNoAccount: !accounts.length
  };
};

const mapDispatchToProps = (dispatch: Dispatch, { navigation }: InstancesProps) => {
  const source = {
    get accountId() {
      const account: Account = navigation.getParam('data');
      return account ? account.id : null;
    },
    get api() {
      return this.accountId ? getApi(this.accountId) : getApi('adapter');
    }
  };
  navigation.state.params = {
    refresh: async (uid: string, instances: Instance[]) => {
      dispatch({ type: 'cloud/instances', payload: { uid, instances } });
    }
  };
  return {
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
