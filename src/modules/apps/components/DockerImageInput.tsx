import React from 'react';
import { connect } from 'react-redux';
import { NavigationScreenOptions, SafeAreaView } from 'react-navigation';
import {
  StyleSheet,
  Text,
  View,
  WebView,
  TextInput,
  TouchableOpacity,
  LayoutRectangle,
  ScrollView,
  Modal,
  Dimensions,
  Image,
  TextStyle,
  Switch,
  Animated,
  Easing,
  StyleProp,
  LayoutChangeEvent,
  KeyboardAvoidingView
} from 'react-native';
import { Icon } from '../../../components';

interface DockerImageInputProps {
  defaultValue?: string;
  onValueChange: (value: string) => void;
}

class DockerImageInput extends React.Component<DockerImageInputProps> {
  state = {
    status: 'nil'
  };
  input = React.createRef<TextInput>();
  handleChangeValue = (value: string) => {
    const { onValueChange } = this.props;
    this.setState({ value });
    if (value === '' || (value.includes(':') && !value.endsWith(':'))) {
      this.setState({ status: 'nil' });
    } else if (value.includes(':')) {
      this.setState({ status: 'tag' });
      const input = this.input.current;
    } else {
      this.setState({ status: 'repositorie' });
    }
    onValueChange && onValueChange(value);
  };
  render() {
    const { defaultValue } = this.props;
    return (
      <View style={{ flexDirection: 'row' }}>
        <TextInput
          ref={this.input}
          defaultValue={defaultValue}
          onChangeText={this.handleChangeValue}
          style={{ flex: 1 }}
          autoCapitalize="none"
          clearButtonMode="always"
          autoCorrect={false}
          blurOnSubmit={false}
          placeholder="e.g. image:tag"
        />
        <TouchableOpacity
          style={{ width: 24, height: 24, alignItems: 'center', justifyContent: 'center', marginRight: 10 }}
        >
          <Icon type="Ionicons" name="ios-apps" color="#4180EE" size={18} />
        </TouchableOpacity>
      </View>
    );
  }
}

export default DockerImageInput;


// repositorie | tags | nil
interface DockerImageProps {
    blocks: Block[];
    onBlockClick: (block: Block) => void;
    onValueChange: (value: string) => void;
  }
  
  class DockerImage extends React.Component<DockerImageProps> {
    static tools: Tool[] = ['Envs', 'Ports', 'Volumes', 'Links'];
    state = {
      status: 'nil'
    };
    imageInput: TextInput | undefined | null;
    handleChangeValue = (value: string) => {
      const { onValueChange } = this.props;
      this.setState({ value });
      if (value === '' || (value.includes(':') && !value.endsWith(':'))) {
        this.setState({ status: 'nil' });
      } else if (value.includes(':')) {
        this.setState({ status: 'tag' });
        const input = this.imageInput as TextInput;
      } else {
        this.setState({ status: 'repositorie' });
      }
      onValueChange && onValueChange(value);
    };
    renderRepositories(): any {
      const repositories = [];
      for (let i = 0; i < 100; i++) {
        repositories.push(i);
      }
      return (
        <View>
          <List type="radio-group">
            {repositories.map(i => (
              <Item key={`repositories-${i}`} size={86}>
                <ItemStart>
                  <Image
                    style={{ width: 40, height: 40 }}
                    resizeMode="contain"
                    source={{ uri: 'https://www.brandeps.com/logo-download/T/Tomcat-01.png' }}
                  />
                </ItemStart>
                <ItemBody>
                  <View>
                    <View style={{ height: 29, justifyContent: 'center' }}>
                      <Text style={{ fontSize: 14 }}>Tomcat</Text>
                    </View>
                    <View style={{ paddingRight: 5 }}>
                      <Text style={{ fontSize: 12, color: '#828282', lineHeight: 20, height: 41 }} numberOfLines={2}>
                        Node.js 是一个基于 Chrome JavaScript
                        运行时建立的平台，用于方便地搭建响应速度快、易于扩展的网络应用。 Node.js 使用事件驱动，非阻塞 I/O
                        DaoCloud 提供中文文档支持，用来帮助国内开发者更方便的使用 Docker 镜像。
                      </Text>
                    </View>
                  </View>
                </ItemBody>
              </Item>
            ))}
          </List>
        </View>
      );
    }
    renderTags = (tags: number[]) => {
      return (
        <View style={{ flexDirection: 'row', flex: 1 }}>
          <View style={{ width: 120, alignItems: 'center', marginBottom: 15 }}>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <View style={{ alignItems: 'center', justifyContent: 'center', height: 90 }}>
                <Image
                  style={{ width: 80, height: 80 }}
                  resizeMode="contain"
                  source={{ uri: 'https://www.brandeps.com/logo-download/T/Tomcat-01.png' }}
                />
              </View>
              <Text style={{ fontSize: 15 }}>Tomcat</Text>
              <View style={{ padding: 14 }}>
                <Text style={{ fontSize: 12, color: '#828282', lineHeight: 20 }} numberOfLines={11}>
                  {'      '}
                  Node.js 是一个基于 Chrome JavaScript 运行时建立的平台，用于方便地搭建响应速度快、易于扩展的网络应用。
                  Node.js 使用事件驱动，非阻塞 I/O DaoCloud 提供中文文档支持，用来帮助国内开发者更方便的使用 Docker 镜像。
                </Text>
              </View>
            </View>
            <View
              style={{
                width: 110,
                flexDirection: 'row',
                paddingVertical: 4,
                borderTopColor: '#c8c7cc',
                borderTopWidth: StyleSheet.hairlineWidth
              }}
            >
              <View style={{ height: 30, justifyContent: 'center', flex: 1 }}>
                <Text style={{ color: '#828282', textAlign: 'right', fontSize: 13 }}>查看详情</Text>
              </View>
              <TouchableOpacity style={{ width: 30, height: 30, alignItems: 'center', justifyContent: 'center' }}>
                <Icon type="FontAwesome5" name="arrow-circle-right" size={18} />
              </TouchableOpacity>
            </View>
          </View>
          <View
            style={{
              flex: 1,
              backgroundColor: '#F9FAFB'
            }}
          >
            <ScrollView>
              <List type="radio-group" style={{ backgroundColor: '#F9FAFB', marginBottom: 15 }} title="tags">
                {tags.map(i => (
                  <Item key={`tags-${i}`}>
                    <ItemBody>
                      <Text style={{ fontSize: 14, flex: 1, color: '#24262C' }}>6.11.2-onbuild</Text>
                      <View style={{ alignItems: 'flex-end', paddingRight: 10 }}>
                        <Text style={{ fontSize: 12, color: '#828282' }}>252.8 MB</Text>
                        <Text style={{ fontSize: 10, color: '#828282' }}>更新于 32分钟前</Text>
                      </View>
                    </ItemBody>
                  </Item>
                ))}
              </List>
            </ScrollView>
          </View>
        </View>
      );
    };
  
    render() {
      const { status } = this.state;
      // {features.some(f => f === '')}
      const tags = [];
      for (let i = 0; i < 100; i++) {
        tags.push(i);
      }
      /*this.handleNameChange*/
      return (
        <>
          <List style={{ marginTop: 13, marginBottom: 0 }} key="input-image">
            <Item>
              <Input placeholder="Name" />
            </Item>
            <Item>
              <Icon name="docker" color="#4180EE" size={22} />
              <ItemBody>
                <DockerImageInput onValueChange={this.props.onValueChange} />
              </ItemBody>
            </Item>
            {this.props.blocks.length && (
              <Item>
                <ItemStart>
                  <Icon type="MaterialIcons" name="playlist-add" color="#4180EE" size={20} />
                </ItemStart>
                <ItemBody>
                  <View
                    style={{
                      flexDirection: 'row',
                      borderBottomColor: '#c8c7cc'
                    }}
                  >
                    {this.props.blocks.map(text => (
                      <TouchableOpacity
                        onPress={this.handleClickBlock(text)}
                        key={`docker-features-${text}`}
                        style={{ height: 24, justifyContent: 'center', alignItems: 'flex-start', paddingRight: 30 }}
                      >
                        <Text style={{ color: '#4180EE', fontFamily: 'Aldrich-Regular', fontSize: 13 }}>{text}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ItemBody>
              </Item>
            )}
          </List>
          <DockerToolbar blocks={this.props.blocks} />
          {status !== 'nil' && (
            <View
              key="select-image"
              style={{
                position: 'absolute',
                backgroundColor: '#fff',
                top: 13 + 32 + 40,
                width: Dimensions.get('window').width,
                height: Dimensions.get('window').height - (13 + 32 + 40 + 90),
                zIndex: 100,
                borderTopColor: '#c8c7cc',
                borderTopWidth: StyleSheet.hairlineWidth
              }}
            >
              {status === 'tag' ? this.renderTags(tags) : this.renderRepositories()}
            </View>
          )}
        </>
      );
    }
  }
