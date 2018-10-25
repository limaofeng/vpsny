import React from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  LayoutChangeEvent,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { NavigationScreenOptions, SafeAreaView } from 'react-navigation';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { Env, generateCommand, Link, Port, Service, Volume } from '..';
import { Icon, Input, Item, ItemBody, ItemDivider, Label, List, Select } from '../../../components';
import BottomRegion from '../../../components/BottomRegion';
import SubmitButton from '../../../components/SubmitButton';
import Theme, { withTheme } from '../../../components/Theme';
import { sleep } from '../../../utils';
import { Instance } from '../../cloud/type';
import DockerImageInput from '../components/DockerImageInput';
import DockerToolbar, { Tool } from '../components/DockerToolbar';
import MultiInput from '../components/MultiInput';

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

interface ServiceNewProps {
  instances: Instance[];
  deploy: (service: Service) => Promise<void>;
  dispatch: Dispatch;
  theme: Theme;
}
interface ServiceNewState {
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

class ServiceNew extends React.Component<ServiceNewProps, ServiceNewState> {
  static tools: Tool[] = ['Command', 'Volumes', 'Env', 'Labels', 'Restart policy'];
  static navigationOptions: NavigationScreenOptions = {
    tabBarVisible: false
  };
  envs = React.createRef<MultiInput>();
  ports = React.createRef<MultiInput>();
  links = React.createRef<MultiInput>();
  volumes = React.createRef<MultiInput>();
  constructor(props: ServiceNewProps) {
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
    const { instances } = this.props;
    return (
      <SafeAreaView style={[styles.container]}>
        <KeyboardAwareScrollView>
          <List style={{ marginTop: 13 }} key="input-image">
            <Item>
              <Input defaultValue={name} placeholder="Name" />
            </Item>
            <Item>
              <Icon name="docker" color="#4180EE" size={22} />
              <ItemBody>
                <DockerImageInput defaultValue={image} onValueChange={this.handleImageChange} />
              </ItemBody>
            </Item>
          </List>
          <MultiInput
            ref={this.ports}
            title="Ports"
            values={ports}
            onValueChange={this.handleProts}
            renderItem={(data: Port, { handleRemove, handleValueChange }) => {
              return (
                <Item>
                  <ItemBody>
                    <TextInput
                      defaultValue={String(data.public)}
                      onChangeText={handleValueChange('public')}
                      keyboardType="number-pad"
                      style={{ fontSize: 13, flex: 3 }}
                      placeholder="public host port"
                    />
                    <View style={{ height: 24, width: 24, alignItems: 'center', justifyContent: 'center' }}>
                      <Icon type="FontAwesome" size={18} name="angle-right" color="#828282" />
                    </View>
                    <TextInput
                      defaultValue={String(data.private)}
                      onChangeText={handleValueChange('private')}
                      style={{ fontSize: 13, flex: 1 }}
                      placeholder="8080"
                    />
                    <Select
                      defaultValue={{
                        label: 'TCP',
                        value: data.protocol
                      }}
                      required
                      style={{
                        viewContainer: { width: 70, flex: 0 }
                      }}
                      hideIcon
                      hideClearButton
                      onValueChange={handleValueChange('protocol')}
                      items={[
                        {
                          label: 'TCP',
                          value: 'tcp'
                        },
                        { label: 'UDP', value: 'udp' }
                      ]}
                    />
                    <TouchableOpacity
                      onPress={handleRemove}
                      style={{ height: 24, width: 44, alignItems: 'center', justifyContent: 'center' }}
                    >
                      <Icon type="Ionicons" name="ios-remove" color="#E74628" size={20} />
                    </TouchableOpacity>
                  </ItemBody>
                </Item>
              );
            }}
          />
          <MultiInput
            ref={this.links}
            title="Links"
            values={[{}]}
            onValueChange={this.handleLinks}
            renderItem={(data: any, { handleRemove, handleValueChange }) => {
              return (
                <Item>
                  <ItemBody>
                    <Stretch
                      disableSlider
                      onRemove={handleRemove}
                      left={
                        <Select
                          placeholder={{
                            label: 'Choose Alias container',
                            value: ''
                          }}
                          hideIcon
                          onValueChange={handleValueChange('service')}
                          items={[
                            {
                              label: 'TCP',
                              value: 'tcp'
                            },
                            { label: 'UDP', value: 'udp' }
                          ]}
                        />
                      }
                      separator={<Icon type="FontAwesome" size={18} name="angle-right" color="#828282" />}
                      right={
                        <TextInput
                          onChangeText={handleValueChange('alias')}
                          style={{ fontSize: 13, flex: 2.3 }}
                          placeholder="Alias"
                          clearButtonMode="while-editing"
                        />
                      }
                    />
                  </ItemBody>
                </Item>
              );
            }}
          />
          <List style={{ marginTop: 15, marginBottom: 0 }}>
            <Item>
              <Icon type="MaterialIcons" name="playlist-add" color="#4180EE" size={20} />
              <ItemBody>
                <DockerToolbar tools={ServiceNew.tools} onClick={this.handleToolClick} />
              </ItemBody>
            </Item>
          </List>

          <List title="Command" visible={tool === 'Command'}>
            <Item>
              <Label>Command</Label>
              <Input placeholder="e.g. /usr/bin/nginx -t -c /mynginx.conf" />
            </Item>
            <Item>
              <Label>Entry Point</Label>
              <Input placeholder="e.g. /bin/sh -c" />
            </Item>
            <Item>
              <Label>Working Dir</Label>
              <Input placeholder="e.g. /myapp" />
            </Item>
          </List>
          <MultiInput
            ref={this.envs}
            visible={tool === 'Env'}
            title="Envs"
            values={[{}]}
            onValueChange={this.handleEnvs}
            renderItem={(data: any, { handleRemove, handleValueChange }) => {
              return (
                <Item>
                  <ItemBody>
                    <Stretch
                      onRemove={handleRemove}
                      left={
                        <TextInput
                          onChangeText={handleValueChange('key')}
                          style={[{ fontSize: 13 }]}
                          clearButtonMode="while-editing"
                          placeholder="MYSQL_ROOT_PASSWORD"
                        />
                      }
                      separator={<Text style={{ color: '#828282', fontSize: 20 }}>=</Text>}
                      right={
                        <TextInput
                          onChangeText={handleValueChange('value')}
                          style={[{ fontSize: 13 }]}
                          clearButtonMode="while-editing"
                          placeholder="数据库URL"
                        />
                      }
                    />
                  </ItemBody>
                </Item>
              );
            }}
          />
          <MultiInput
            ref={this.volumes}
            visible={tool === 'Volumes'}
            title="Volumes"
            values={[{}]}
            onValueChange={this.handleVolumes}
            renderItem={(data: any, { handleRemove, handleValueChange }) => {
              return (
                <Item>
                  <ItemBody>
                    <Stretch
                      left={
                        <TextInput
                          onChangeText={handleValueChange('local')}
                          style={{ fontSize: 13 }}
                          clearButtonMode="while-editing"
                          placeholder="/path/on/host"
                        />
                      }
                      separator={<Icon type="FontAwesome" size={18} name="angle-right" color="#828282" />}
                      right={
                        <TextInput
                          onChangeText={handleValueChange('dest')}
                          style={{ fontSize: 13 }}
                          clearButtonMode="while-editing"
                          placeholder="/path/in/container"
                        />
                      }
                      onRemove={handleRemove}
                    />
                  </ItemBody>
                </Item>
              );
            }}
          />
          {false && (
            <View
              key="toggle-view"
              style={{
                height: 40,
                position: 'absolute',
                paddingVertical: 8,
                top: 13 + 32 + 40,
                zIndex: 150,
                right: 5
              }}
            >
              <TouchableOpacity
                onPress={this.handleMagic}
                style={{
                  width: 24,
                  height: 24,
                  marginRight: 10,
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                {step === 1 ? (
                  <Icon type="FontAwesome5" name="staylinked" color="#4180EE" size={18} />
                ) : (
                  <Icon type="Ionicons" name="ios-arrow-back" color="#4180EE" size={18} />
                )}
              </TouchableOpacity>
            </View>
          )}
          {this.renderNginxOptions()}
          <List title="Hosts">
            {instances.map(({ id, label }) => (
              <Item key={`hosts-${id}`}>
                <ItemBody>
                  <Text
                    style={{
                      flex: 1,
                      fontSize: 13,
                      color: '#828282'
                    }}
                  >
                    {label}
                  </Text>
                  <Switch
                    style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }], marginRight: 10 }}
                    value={nodes.some(node => node === id)}
                    onValueChange={this.handleNodeChange(id)}
                    tintColor="#4180EE"
                    onTintColor="#4180EE"
                  />
                </ItemBody>
              </Item>
            ))}
          </List>
        </KeyboardAwareScrollView>
        <BottomRegion>
          <SubmitButton
            style={{ width: Dimensions.get('window').width - 40 }}
            doneText="Done"
            onSubmit={this.handleSubmit}
            title={'Save'}
            submittingText="Saveing"
          />
        </BottomRegion>
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

const mapStateToProps = ({ cloud: { instances } }: any) => ({ instances });

const mapDispatchToProps = (dispatch: Dispatch) => ({
  async deploy(service: Service) {
    dispatch({ type: 'apps/deploy', payload: service });
  }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withTheme(ServiceNew, false));
