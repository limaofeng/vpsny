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
import { Icon, Item, ItemStart, ItemBody, List, ItemDivider } from '../../../components';
import { uuid } from '../../../utils';

export type Tool = 'Envs' | 'Ports' | 'Volumes' | 'Links' | 'Nginx & SSL';

interface MultiInputProps {
  visible?: boolean;
  title?: string;
  values: any[];
  onValueChange: (values: any[]) => void;
  renderItem: (
    data: any,
    actions: {
      handleRemove: () => void;
      handleValueChange: (property: string) => (value: string) => void;
    }
  ) => React.ReactElement<any>;
}

interface MultiInputState {
  values: any[];
}

class MultiInput extends React.Component<MultiInputProps, MultiInputState> {
  static defaultProps = {
    visible: true
  };
  constructor(props: MultiInputProps) {
    super(props);
    this.state = { values: props.values ? props.values.map(v => ({ ...v, uuid: uuid() })) : [] };
  }
  handleRemove = (index: number) => () => {
    const { values } = this.state;
    if (!values.length) {
      return;
    }
    values.splice(index, 1);
    this.setState({ values });
    this.triggerChange(values);
  };
  handleValueChange = (i: number) => (name: string) => (value: string) => {
    const { values } = this.state;
    values[i][name] = value;
    this.setState({ values });
    this.triggerChange(values);
  };
  handleNew = () => {
    const { values } = this.state;
    values.push({ uuid: uuid() });
    this.setState({ values });
    this.triggerChange(values);
  };
  triggerChange = (values: any[]) => {
    this.props.onValueChange(values.map(({ uuid, ...item }) => item));
  };
  render() {
    const { title, renderItem, visible } = this.props;
    const { values } = this.state;
    if (!visible) {
      return [];
    }
    return (
      <List>
        <ItemDivider title={title}>
          {/*
          <TouchableOpacity style={{ height: 32, width: 44, alignItems: 'center', justifyContent: 'center' }}>
            <Icon type="Ionicons" name="ios-help-circle-outline" color="#4180EE" size={20} />
          </TouchableOpacity>
          */}
          <TouchableOpacity
            onPress={this.handleNew}
            style={{ height: 32, width: 44, alignItems: 'center', justifyContent: 'center' }}
          >
            <Icon type="Ionicons" name="ios-add" color="#E74628" size={20} />
          </TouchableOpacity>
        </ItemDivider>
        {values.map((value, i) =>
          React.cloneElement(
            renderItem(value, {
              handleRemove: this.handleRemove(i),
              handleValueChange: this.handleValueChange(i)
            }),
            {
              key: value.uuid
            }
          )
        )}
      </List>
    );
  }
}

export default MultiInput;
