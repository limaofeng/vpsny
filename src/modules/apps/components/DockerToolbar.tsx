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
import { Icon, Item, ItemStart, ItemBody, List } from '../../../components';

export type Tool =
  | 'Ports'
  | 'Links'
  | 'Command'
  | 'Volumes'
  | 'Network'
  | 'Env'
  | 'Labels'
  | 'Restart policy'
  | 'Runtime & Resources'
  | 'Capabilities'
  | 'Nginx & SSL';

interface DockerToolbarProps {
  tools: Tool[];
  onClick: (value: Tool) => void;
}

class DockerToolbar extends React.Component<DockerToolbarProps> {
  handleClick = (value: Tool) => () => {
    this.props.onClick(value);
  };
  render() {
    const { tools } = this.props;
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row', flex: 1 }}>
        {tools.map(tool => (
          <TouchableOpacity
            onPress={this.handleClick(tool)}
            key={`docker-features-${tool}`}
            style={{ height: 24, justifyContent: 'center', alignItems: 'flex-start', paddingRight: 30 }}
          >
            <Text style={{ color: '#4180EE', fontFamily: 'Aldrich-Regular', fontSize: 13 }}>{tool}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  }
}

export default DockerToolbar;
