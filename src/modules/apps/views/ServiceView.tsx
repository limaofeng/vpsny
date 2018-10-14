import React from 'react';
import { connect } from 'react-redux';
import { NavigationScreenOptions, SafeAreaView, NavigationScreenProp } from 'react-navigation';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Dimensions,
  Switch,
  Animated,
  Easing,
  LayoutChangeEvent,
  Image
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { Dispatch } from 'redux';
import Spinner from 'react-native-spinkit';

import { sleep } from '../../../utils';
import { List, Item, Label, Input, Note, ItemDivider, Select, Icon, ItemBody, ItemStart } from '../../../components';
import { Service, Port, Volume, Link, Env, generateCommand } from '..';
import BottomRegion from '../../../components/BottomRegion';
import Theme, { withTheme } from '../../../components/Theme';
import SubmitButton from '../../../components/SubmitButton';
import DockerImageInput from '../components/DockerImageInput';
import DockerToolbar, { Tool } from '../components/DockerToolbar';
import MultiInput from '../components/MultiInput';
import { Instance } from '../../cloud/type';
import TabBar from '../../../components/TabBar';
import ScrollableTabView from 'react-native-scrollable-tab-view';
import ScrollableTab from '../../home/components/ScrollableTab';

interface StretchProps {
  disableSlider?: boolean;
  left: React.ReactElement<any>;
  separator: React.ReactElement<any>;
  right: React.ReactElement<any>;
  onRemove?: () => void;
}

interface StretchState {
  animated: Animated.Value;
  status: 'laying' | 'ready';
}

class Stretch extends React.Component<StretchProps, StretchState> {
  widths: number[] = [];
  left: React.ReactElement<any>;
  right: React.ReactElement<any>;
  constructor(props: StretchProps) {
    super(props);
    this.state = { animated: new Animated.Value(1), status: 'laying' };
    this.left = React.cloneElement(props.left, {
      onFocus: this.handleWidthMove(2),
      onBlur: this.handleWidthMove(1)
    });
    this.right = React.cloneElement(props.right, {
      onFocus: this.handleWidthMove(0),
      onBlur: this.handleWidthMove(1)
    });
  }
  handleWidthMove = (value: number) => () => {
    if (this.props.disableSlider) {
      return;
    }
    const { animated } = this.state;
    animated.stopAnimation();
    Animated.timing(animated, {
      toValue: value,
      duration: 250,
      easing: Easing.linear
    }).start();
  };
  handleLayout = (index: number) => (e: LayoutChangeEvent) => {
    if (!this.widths[index]) {
      this.widths[index] = e.nativeEvent.layout.width;
      if (this.widths.filter(w => !!w).length == 2) {
        this.setState({ status: 'ready' });
      }
    }
  };
  style = (value: number, index: number): any => {
    const { status, animated } = this.state;
    if (status === 'laying') {
      return { flex: value };
    }
    const large = this.widths.reduce((l, r) => l + r) - 40;
    if (status === 'ready') {
      return {
        width: animated.interpolate({
          inputRange: [0, 1, 2],
          outputRange: index ? [large, this.widths[index], 40] : [40, this.widths[index], large]
        })
      };
    }
  };
  render() {
    return (
      <View style={{ flexDirection: 'row' }}>
        <Animated.View onLayout={this.handleLayout(0)} style={[{ justifyContent: 'center' }, this.style(3, 0)]}>
          {this.left}
        </Animated.View>
        <View style={{ height: 24, width: 24, alignItems: 'center', justifyContent: 'center' }}>
          {this.props.separator}
        </View>
        <Animated.View onLayout={this.handleLayout(1)} style={[{ justifyContent: 'center' }, this.style(2.3, 1)]}>
          {this.right}
        </Animated.View>
        <TouchableOpacity
          onPress={this.props.onRemove}
          style={{ height: 24, width: 44, alignItems: 'center', justifyContent: 'center' }}
        >
          <Icon type="Ionicons" name="ios-remove" color="#E74628" size={20} />
        </TouchableOpacity>
      </View>
    );
  }
}

interface ServiceViewProps {
  navigation: NavigationScreenProp<any>;
  allNodes: Instance[];
  deploy: (service: Service) => Promise<void>;
  dispatch: Dispatch;
  theme: Theme;
}
interface ServiceViewState {
  showNginxOptions: boolean;
  step: number;
  name?: string;
  image: string;
  mode: 'complex' | 'simplify';
  nodes: string[];
  tool: Tool;
  ports: Port[];
  links: Link[];
  volumes: Volume[];
  envs: Env[];
}

class ServiceView extends React.Component<ServiceViewProps, ServiceViewState> {
  static tools: Tool[] = ['Command', 'Volumes', 'Env', 'Labels', 'Restart policy'];
  static navigationOptions: NavigationScreenOptions = {
    tabBarVisible: false
  };
  envs = React.createRef<MultiInput>();
  ports = React.createRef<MultiInput>();
  links = React.createRef<MultiInput>();
  volumes = React.createRef<MultiInput>();
  constructor(props: ServiceViewProps) {
    super(props);
    this.state = {
      step: 1,
      showNginxOptions: false,
      name: 'Docker Image',
      image: 'nginx:latest',
      mode: 'simplify',
      nodes: [],
      ports: [
        {
          public: 8081,
          protocol: 'tcp',
          private: 80
        }
      ],
      links: [],
      volumes: [],
      envs: [],
      tool: 'Command'
    };
  }
  toggleNginxOptions = () => {
    const { blocks } = this.state;
    if (blocks.some(b => b === 'Nginx & SSL')) {
      this.setState({ blocks: blocks.filter(b => b != 'Nginx & SSL') });
    } else {
      this.setState({ blocks: [...blocks, 'Nginx & SSL'] });
    }
  };
  toggleMode = () => {
    const { mode } = this.state;
    this.setState({ mode: mode === 'simplify' ? 'complex' : 'simplify' });
  };
  handleEnvs = (values: any[]) => {
    this.setState({ envs: values });
  };
  handleProts = (values: any[]) => {
    this.setState({ ports: values });
  };
  handleLinks = (values: any[]) => {
    this.setState({ links: values });
  };
  handleVolumes = (values: any[]) => {
    this.setState({ volumes: values });
  };
  handleToolClick = (tool: Tool) => {
    this.setState({ tool });
    // const { blocks, envs, ports, volumes, links } = this.state;
    // switch (tool) {
    //   case 'Envs':
    //     !envs.length && (this.envs.current as MultiInput).handleNew();
    //     break;
    //   case 'Ports':
    //     !ports.length && (this.ports.current as MultiInput).handleNew();
    //     break;
    //   case 'Volumes':
    //     !volumes.length && (this.volumes.current as MultiInput).handleNew();
    //     break;
    //   case 'Links':
    //     !links.length && (this.links.current as MultiInput).handleNew();
    //     break;
    // }
    // this.setState({ blocks: [...blocks, tool] });
  };
  handleImageChange = (value: string) => {
    this.setState({ image: value });
  };
  handleNodeChange = (value: string) => (checked: boolean) => {
    const { nodes } = this.state;
    this.setState({ nodes: checked ? [...nodes, value] : nodes.filter(h => h !== value) });
  };
  handleNameChange = (value: string) => {
    this.setState({ name: value });
  };

  renderNginxOptions() {
    const { showNginxOptions } = this.state;
    if (!showNginxOptions) {
      return <></>;
    }
    return (
      <>
        <List>
          <ItemDivider title="Custom Domain">
            <View style={{ justifyContent: 'center', paddingRight: 15 }}>
              <Text style={{ fontSize: 12, color: '#898989' }}>(need nginx installed)</Text>
            </View>
          </ItemDivider>
          <Item>
            <Label>Domain</Label>
            <Input placeholder="Domain or domains (comma separated)" />
          </Item>
          <Item>
            <Label>Port</Label>
            <Input placeholder="Will auto detect if not specified" />
          </Item>
          <Item>
            <Label>HTTPS</Label>
            <Select
              placeholder={{
                label: 'Select',
                value: null
              }}
              onValueChange={() => {}}
              items={[
                { label: 'Redirect http to https', value: '1' },
                { label: "Don't redirect http to https ", value: '2' },
                { label: 'Disable http', value: '3' },
                { label: 'Disable https', value: '4' }
              ]}
            />
          </Item>
        </List>

        <List>
          <ItemDivider>Nginx SSL Support (Let's encrypt)</ItemDivider>
          <Item>
            <Label>Domain</Label>
            <Input placeholder="Should be same with the domain above" />
          </Item>
          <Item>
            <Label>Email</Label>
            <Input placeholder="Your email to manage certs" />
          </Item>
        </List>
      </>
    );
  }

  handleMagic = () => {
    const { step } = this.state;
    if (step > 1) {
      this.handleBack();
    }
  };

  handleBack = () => {
    const { step } = this.state;
    this.setState({ step: step - 1 });
  };

  handleSubmit = async () => {
    const { deploy } = this.props;
    const { step, name, image, ports, volumes, links, envs, nodes } = this.state;
    const data = {
      name: name as string,
      image,
      configs: {
        nodes,
        ports,
        volumes,
        links,
        envs
      }
    };
    const cpmmand = generateCommand(data);
    await sleep(2000);
    // if (step !== 2) {
    //   this.setState({ step: step + 1 });
    //   return;
    // }
    await deploy(data);
  };

  render() {
    const { colors, fonts } = this.props.theme as Theme;
    const { step, name, image, ports, volumes, links, envs, nodes, tool, showNginxOptions } = this.state;
    const { allNodes } = this.props;

    const statusColor = colors.colorful.green;
    const isPending = false;
    const isRunning = false;

    return (
      <SafeAreaView style={[styles.container]}>
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
            <Image
              source={require('../../../assets/images/apps/nginx.png')}
              resizeMode="contain"
              style={{ height: 50, width: 50 }}
            />
          </View>
          <View style={{ flexDirection: 'column', flex: 1 }}>
            <View style={{ flex: 1, flexDirection: 'row' }}>
              <View style={{ flex: 1, justifyContent: 'center' }}>
                <Text style={[{ color: colors.primary, lineHeight: 25 }, fonts.title]}>Nginx</Text>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  paddingVertical: 5,
                  paddingRight: 10
                }}
              >
                <TouchableOpacity
                  style={{
                    width: 30,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 5
                  }}
                >
                  <Icon type="MaterialCommunityIcons" name="book" color="#4180EE" size={20} />
                </TouchableOpacity>
                {/*
                <InstanceActions
                  data={data}
                  onExecute={this.handleActionExecute}
                  start={this.props.start}
                  stop={this.props.stop}
                  restart={this.props.restart}
                  destroy={this.props.destroy}
                  reinstall={this.props.reinstall}
                />
                */}
              </View>
            </View>
            <View style={{ height: 24, flexDirection: 'row', alignItems: 'center' }}>
              <View
                style={{
                  borderRadius: 9,
                  width: 18,
                  height: 18,
                  // backgroundColor: format.color(statusColor, 'rgba', 0.1),
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Spinner isVisible={false} size={18} type="Arc" color={statusColor} />
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
              />
            </View>
          </View>
        </View>
        <ScrollableTabView
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
          <ScrollableTab tabLabel="Nodes">
            <List title="Deployed">
              {allNodes.map(({ id, label }) => (
                <Item push>
                  <Icon type="FontAwesome" name="circle" color={colors.colorful.green} size={14}/>
                  <Note style={{ flex: 1 }}>{label}</Note>
                  <Label style={{ width: 'auto', textAlign: 'right' }}>up 8 hours</Label>
                </Item>
              ))}
            </List>
            <List title="Not deployed">
              {allNodes.map(({ id, label }) => (
                <Item>
                  <Note style={{ flex: 1 }}>{label}</Note>
                  <Switch
                    style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }], marginRight: 10 }}
                    value={nodes.some(node => node === id)}
                    onValueChange={this.handleNodeChange(id)}
                    tintColor="#4180EE"
                    onTintColor="#4180EE"
                  />
                </Item>
              ))}
            </List>
          </ScrollableTab>
          <ScrollableTab tabLabel="Settings">
            <Text>123123</Text>
          </ScrollableTab>
          <ScrollableTab tabLabel="Logs">
            <Text>123123</Text>
          </ScrollableTab>
        </ScrollableTabView>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F0F1F2',
    flex: 1
  }
});

const mapStateToProps = (
  { apps: { services }, cloud: { instances: allNodes } }: any,
  { navigation }: ServiceViewProps
) => {
  const value = navigation.getParam('value') as Service;
  return {
    service: services[0], //services.find((app: Service) => app.id === value.id) || value,
    allNodes
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  async deploy(service: Service) {
    dispatch({ type: 'apps/deploy', payload: service });
  }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withTheme(ServiceView, false));
