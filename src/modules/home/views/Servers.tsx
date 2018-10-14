import React from 'react';
import { SafeAreaView } from 'react-navigation';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  Image,
  Dimensions,
  TouchableOpacity,
  RefreshControl,
  Animated,
  Easing
} from 'react-native';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { ProgressCircle } from 'react-native-svg-charts';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ServerItem } from '../components/ServerItem';
// import DeployButton from '../components/DeployButton';

import { List, Item, Note, ItemStart, ItemBody, Svg, Icon } from '../../../components';
import DashLine from '../../../components/DashLine';
import Spinner from '../../../components/Spinner';
import ActionButton from '../../../components/ActionButton';
import { sleep } from '../../../utils';
import { fileSize } from '../../../utils/format';
import { Host } from '..';

interface ServerProps {
  navigation: any;
  refresh: () => void;
  refreshServer: (id: string) => void;
  hosts: Host[];
}

interface CircularProps {
  value: number;
  summary: string;
  title: string;
}

interface CircularState {
  progress: number;
  animated: Animated.Value;
}

class Circular extends React.Component<CircularProps, CircularState> {
  constructor(props: CircularProps) {
    super(props);
    this.state = {
      progress: 0,
      animated: new Animated.Value(0)
    };
  }

  componentDidMount() {
    const { animated } = this.state;
    animated.addListener(({ value }) => {
      this.setState({ progress: Math.min(value, 1) });
    });
    this.move(this.props.value / 100);
  }

  componentWillReceiveProps(nextProps: CircularProps) {
    this.move(nextProps.value / 100);
  }

  move = async (value: number) => {
    const { animated } = this.state;
    await sleep(1000);
    animated.stopAnimation();
    Animated.timing(animated, {
      toValue: value,
      delay: 300,
      duration: 500,
      easing: Easing.linear
    }).start();
  };

  render() {
    const { title, summary } = this.props;
    //  transform: [{ rotate: '180deg' }]
    return (
      <View style={{ flex: 1, alignItems: 'center' }}>
        <View style={{ height: 60, width: 60, alignItems: 'center' }}>
          <ProgressCircle
            style={{ height: 60, width: 60 }}
            progress={this.state.progress}
            progressColor={'#04E577'}
            startAngle={-Math.PI * 0.8}
            endAngle={Math.PI * 0.8}
            strokeWidth={5.5}
          />
          <Text style={{ top: -(60 / 2) - 6, fontSize: 12, color: '#919192' }}>{summary}</Text>
        </View>
        <Text style={{ fontSize: 12, color: '#919192', marginTop: 5 }}>{title}</Text>
      </View>
    );
  }
}

class Servers extends React.Component<ServerProps> {
  static navigationOptions = {
    title: 'Servers',
    tabBarLabel: 'Servers',
    headerBackTitle: 'ssss '
    // headerStyle: {
    //   backgroundColor: colors.backgroundColor,
    //   height: 140 - 44,
    //   borderBottomWidth: 0
    // },
    // headerTintColor: colors.backgroundColor,
    // headerLeft: undefined,
    // headerTitleStyle: {
    //   flex: 1,
    //   position: 'relative',
    //   textAlign: 'left',
    //   marginTop: 50,
    //   marginLeft: 14,
    //   letterSpacing: 0.4,
    //   fontWeight: 'bold',
    //   color: '#000000',
    //   height: 52,
    //   fontSize: 34
    // }
  };

  state = {
    refreshing: false
  };

  constructor(props: ServerProps) {
    super(props);
  }

  handleOpenTerminal = () => {
    const { navigation } = this.props;
    navigation.navigate('Terminal');
  };

  handleGoToBindHost = () => {
    const { navigation } = this.props;
    navigation.navigate('Deploy');
  };

  handleSettings = (id: string) => () => {
    const { navigation, hosts } = this.props;
    navigation.navigate('ServerEdit', { id, title: (hosts.find(h => h.id === id) as Host).name });
  };

  handleRefresh = async () => {
    const { refresh } = this.props;
    this.setState({ refreshing: true });
    refresh();
    this.setState({
      refreshing: false
    });
  };

  handleRefreshServer = (id: string) => () => {
    const { refreshServer } = this.props;
    refreshServer(id);
  };

  render() {
    // <DeployButton />
    const { hosts } = this.props;
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={this.state.refreshing} onRefresh={this.handleRefresh} tintColor="#A9AAAB" />
          }
          style={{ paddingTop: 13 }}
          showsVerticalScrollIndicator={false}
        >
          <List style={{ backgroundColor: '#F0F1F2' }}>
            {hosts.map(({ metrics, ...host }) => (
              <Item key={`host-${host.id}`} size={190} style={{ marginBottom: 5, backgroundColor: '#ffffff' }}>
                <ItemBody
                  style={{ flexDirection: 'column', paddingVertical: 0, alignItems: 'stretch', borderBottomWidth: 0 }}
                >
                  <View
                    style={{
                      height: 40
                      // borderBottomColor: '#c8c7cc',
                      // borderBottomWidth: StyleSheet.hairlineWidth
                    }}
                  >
                    <View style={{ flexDirection: 'row' }}>
                      <View style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}>
                        {/*<Image
                          source={require('../../../assets/images/ubuntu.png')}
                          resizeMode="contain"
                          style={{ height: 30, width: 30 }}
                        />*/}
                      </View>
                      <View style={{ flex: 1, justifyContent: 'center', paddingTop: 5, paddingLeft: 10 }}>
                        <View style={{ height: 20 }}>
                          <Text style={{ fontSize: 16, color: '#5D8BD1' }}>{host.name}</Text>
                        </View>
                      </View>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'flex-end',
                          paddingVertical: 5,
                          paddingRight: 10
                        }}
                      >
                        <Spinner
                          loading={['refreshing', 'connecting'].indexOf(host.status) !== -1}
                          onClick={this.handleRefreshServer(host.id)}
                        >
                          <Icon
                            type="MaterialIcons"
                            style={{ textAlign: 'center', textAlignVertical: 'center' }}
                            name={'sync'}
                            color="#4180EE"
                            size={20}
                          />
                        </Spinner>
                        <TouchableOpacity
                          onPress={this.handleSettings(host.id)}
                          style={{
                            width: 30,
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: 5
                          }}
                        >
                          <Icon type="MaterialIcons" name="settings" color="#4180EE" size={20} />
                        </TouchableOpacity>
                        {/*
                        <TouchableOpacity
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
                        <TouchableOpacity
                          style={{ width: 30, height: 30, alignItems: 'center', justifyContent: 'center' }}
                        >
                          <Ionicons name="md-more" color="#4180EE" size={24} />
                        </TouchableOpacity>
                      </View>
                    </View>
                    <DashLine width={Dimensions.get('window').width - 20} backgroundColor="#6c7778" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', paddingRight: 10 }}>
                      <Circular value={metrics.cpu} title="CPU" summary={`${Math.floor(metrics.cpu)} %`} />
                      <Circular
                        value={metrics.memory ? metrics.memory.percentage : 0}
                        title="Memory"
                        summary={
                          fileSize(metrics.memory ? metrics.memory.usage : 0, 'MB', {
                            mode: 'short'
                          }) as string
                        }
                      />
                      <Circular
                        value={metrics.disk ? metrics.disk.percentage : 0}
                        title="Disk"
                        summary={
                          fileSize(metrics.disk ? metrics.disk.usage : 0, 'GB', {
                            mode: 'short'
                          }) as string
                        }
                      />
                      <Circular
                        value={metrics.net ? metrics.net.percentage : 0}
                        title="Net"
                        summary={
                          fileSize(metrics.net ? metrics.net.usage : 0, 'MB', {
                            scale: 1000,
                            mode: 'short'
                          }) as string
                        }
                      />
                      {/*<Text style={{ fontSize: 12, color: '#6c7778' }}>512 MB RAM、1 vCPUs、20 GB SSD</Text>*/}
                    </View>
                    <DashLine width={Dimensions.get('window').width - 20} backgroundColor="#6c7778" />
                  </View>
                  <View style={{ flexDirection: 'row', height: 40, paddingRight: 10 }}>
                    <View style={{ flex: 1, justifyContent: 'center' }}>
                      <Text style={{ fontSize: 12, color: '#6c7778' }}>
                        {host.status === 'connecting' ? 'connecting' : `Up ${metrics.uptime} days`}
                      </Text>
                    </View>
                    <View style={{ justifyContent: 'center', alignItems: 'flex-end' }}>
                      <View style={{ height: 16 }}>
                        <Text style={{ fontSize: 12, color: '#6c7778', textAlign: 'right' }}>13.231.53.97</Text>
                      </View>
                      <View style={{ height: 14 }}>
                        <Text style={{ fontSize: 11, color: '#6c7778', textAlign: 'right' }}>东京 区域 A</Text>
                      </View>
                    </View>
                  </View>
                </ItemBody>
              </Item>
            ))}
          </List>
        </ScrollView>
        <ActionButton position="right" radius={80} size={50} buttonColor="#4180EE" onPress={this.handleGoToBindHost} />
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F1F2'
  },
  scrollAscension: {
    width: 1,
    height: 54
  },
  actionButtonIcon: {
    fontSize: 20,
    height: 22,
    color: 'white'
  }
});

/*
Servers.navigationOptions = {
  title: 'Servers',
  headerStyle: {
    backgroundColor: colors.backgroundColor,
    height: 140 - 44,
    borderBottomWidth: 0
  },
  headerTintColor: colors.backgroundColor,
  headerLeft: undefined,
  headerTitleStyle: {
    flex: 1,
    position: 'relative',
    textAlign: 'left',
    marginTop: 50,
    marginLeft: 14,
    letterSpacing: 0.4,
    fontWeight: 'bold',
    color: '#000000',
    height: 52,
    fontSize: 34
  }
};*/

const mapStateToProps = ({ server: { hosts } }: any) => ({ hosts: [...hosts] });

const mapDispatchToProps = (dispatch: Dispatch) => ({
  refresh() {
    dispatch({ type: 'server/refresh' });
  },
  refreshServer(id: string) {
    dispatch({ type: 'server/refreshServer', payload: { id } });
  }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Servers);
