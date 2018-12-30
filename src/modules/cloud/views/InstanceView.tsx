import React from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import Spinner from 'react-native-spinkit';
import { NavigationScreenOptions, NavigationScreenProp, SafeAreaView } from 'react-navigation';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { getApi, utils } from '..';
import { Icon } from '../../../components';
import Theme, { withTheme } from '../../../components/Theme';
import { format, sleep } from '../../../utils';
import { Docker } from '../../home/components/Docker';
import Overview from '../../home/components/Overview';
import { Program } from '../../home/components/Program';
import { InstantState } from '../../home/type';
import InstanceActions, { OperateStatus } from '../components/InstanceActions';
import OSLogo from '../components/OSLogo';
import { Instance } from '../type';
import firebase, { RNFirebase } from 'react-native-firebase';

interface InstanceViewProps {
  navigation: NavigationScreenProp<any>;
  refresh: () => Promise<Instance>;
  track: (node: Instance) => Promise<void>;
  instance: Instance;
  dispatch: Dispatch;
  theme: Theme;
}

interface InstanceViewState {
  refreshing: boolean;
  instantState?: InstantState;
}

class InstanceView extends React.Component<InstanceViewProps, InstanceViewState> {
  static navigationOptions: NavigationScreenOptions = {
    title: 'Details',
    tabBarLabel: 'InstanceView',
    headerBackTitle: ' '
  };

  docker = React.createRef<Docker>();
  program = React.createRef<Program>();
  analytics?: RNFirebase.Analytics;
  constructor(props: InstanceViewProps) {
    super(props);
    this.state = {
      refreshing: false,
      instantState: undefined
    };
  }

  componentDidMount() {
    this.handleRefresh(true);
    this.analytics = firebase.analytics();
    this.analytics.setCurrentScreen('ServerView', 'ServerView.tsx');
  }

  handleOpenTerminal = () => {
    const { navigation, instance } = this.props;
    navigation.navigate('Terminal', { value: instance });
  };

  handleGoToBindHost = () => {
    const { navigation } = this.props;
    navigation.navigate('Deploy');
  };

  handleActionExecute = async (operate: string, status: OperateStatus, data: Instance) => {
    const { track } = this.props;
    if (status != 'Complete') {
      this.setState({ instantState: { status } });
    } else {
      track(data);
      await sleep(200);
      this.setState({ instantState: undefined });
    }
  };

  handleRefresh = async (ignore?: boolean) => {
    const { refresh } = this.props;
    !ignore && this.setState({ refreshing: true });
    await refresh();
    !ignore && this.setState({ refreshing: false });
    // const client = getSSHClient(instance.id);
    // await client.connect();
    // await client.authenticate();
    // const docker = this.docker.current as Docker;
    // const program = this.program.current as Program;
    // await program.refresh(client);
    // await docker.refresh(client);
  };

  getStatusText(data: Instance) {
    const { instantState } = this.state;
    if (instantState) {
      return instantState.status;
    }
    return data.status;
  }

  render() {
    const {
      instance: data,
      dispatch,
      navigation,
      theme: { colors, fonts }
    } = this.props;
    const { refreshing } = this.state;

    const isRunning = data.status === 'running';
    const status = this.getStatusText(data);
    const statusColor = utils.getStatusColor(status, colors);
    const isPending = status !== 'Running' && status !== 'Stopped';

    return (
      <SafeAreaView style={styles.container} forceInset={{ bottom: 'never' }}>
        <ScrollView
          style={{ flex: 1 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={this.handleRefresh} tintColor={colors.minor} />
          }
        >
          <View
            style={{
              flexDirection: 'row',
              height: 80,
              justifyContent: 'center',
              backgroundColor: colors.backgroundColorDeeper,
              paddingLeft: 5,
              paddingVertical: 8
            }}
          >
            <View style={{ width: 80, alignItems: 'center', justifyContent: 'center' }}>
              <OSLogo name={data.os} size={50} />
            </View>
            <View style={{ flexDirection: 'column', flex: 1 }}>
              <View style={{ flex: 1, flexDirection: 'row' }}>
                <View style={{ flex: 1, justifyContent: 'center' }}>
                  <Text style={[{ color: colors.primary, lineHeight: 25 }, fonts.title]}>{data.name}</Text>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    paddingVertical: 5,
                    paddingRight: 10
                  }}
                >
                  {/* TODO: 先隐藏 Terminal 功能
                  <TouchableOpacity
                    style={{
                      width: 30,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 5
                    }}
                    onPress={this.handleOpenTerminal}
                  >
                    <Icon name="terminal" color="#4180EE" size={18} />
                  </TouchableOpacity>
                  */}
                  <InstanceActions
                    theme={this.props.theme!}
                    data={data}
                    dispatch={dispatch}
                    navigation={navigation}
                    onExecute={this.handleActionExecute}
                  />
                </View>
              </View>
              <View style={{ height: 24, flexDirection: 'row', alignItems: 'center' }}>
                <View
                  style={{
                    borderRadius: 9,
                    width: 18,
                    height: 18,
                    backgroundColor: format.color(statusColor, 'rgba', 0.1),
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Spinner isVisible={isPending} size={18} type="Arc" color={statusColor} />
                  {!isPending && (
                    <Icon
                      type="MaterialCommunityIcons"
                      name={isRunning ? 'play-circle-outline' : 'stop-circle-outline'}
                      color={statusColor}
                      size={18}
                    />
                  )}
                </View>
                <Text
                  style={[
                    {
                      color: statusColor,
                      lineHeight: 18,
                      marginLeft: 5
                    },
                    fonts.footnote
                  ]}
                >
                  {status}
                </Text>
              </View>
            </View>
          </View>
          <Overview data={data} tabLabel="Overview" navigation={navigation} />
          {/* <ScrollableTabView
            style={{ flex: 1 }}
            renderTabBar={() => (
              <TabBar
                backgroundColor={colors.backgroundColorDeeper}
                tabUnderlineDefaultWidth={80}
                tabUnderlineScaleX={2}
                activeColor={colors.primary}
                inactiveColor={colors.minor}
                style={{ height: 40 }}
                textStyle={{ fontWeight: 'normal', fontSize: 13 }}
              />
            )}
            prerenderingSiblingsNumber={Infinity}
          >
            <Overview data={data} tabLabel="Overview" />
            <ScrollableTab tabLabel="Apps">
              <DockerPanel ref={this.docker} />
            </ScrollableTab>
            <ScrollableTab tabLabel="Process">
              <ProgramPanel ref={this.program} />
            </ScrollableTab>
            <ScrollableTab tabLabel="Metrics">
              <DockerPanel />
            </ScrollableTab>
          </ScrollableTabView> */}
        </ScrollView>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F1F2'
  },
  powerStatusContainer: {
    top: 9,
    left: 38,
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
  },
  tabbar: {
    backgroundColor: '#3f51b5'
  },
  tab: {
    width: 120
  },
  indicator: {
    backgroundColor: '#ffeb3b'
  },
  label: {
    color: '#fff',
    fontWeight: '400',
    fontSize: 13
  }
});

const mapStateToProps = ({ cloud: { instances, accounts } }: any, { navigation }: InstanceViewProps) => {
  const value = navigation.getParam('value') as Instance;
  const api = getApi(value.account);
  return {
    instance: instances.find((node: Instance) => node.id === value.id) || value
  };
};

const mapDispatchToProps = (dispatch: Dispatch, { navigation }: InstanceViewProps) => {
  const instance = navigation.getParam('value') as Instance;
  const api = getApi(instance.account);
  return {
    async refresh() {
      const result = await api.instance.get(instance.id);
      dispatch({ type: 'cloud/instance', payload: { operate: 'update', instance: result } });
      return result;
    },
    async track(node: Instance) {
      dispatch({ type: 'cloud/track', payload: { node } });
    },
    dispatch
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withTheme(InstanceView, false));
