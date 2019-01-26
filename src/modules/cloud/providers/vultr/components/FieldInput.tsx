import { Icon, Input, Note, Theme } from '@components';
import React, { Component } from 'react';
import { TouchableOpacity, View } from 'react-native';

interface FieldInputProps {
  theme: Theme;
  value: string;
  onChangeValue: (value: string) => Promise<void>;
}

type Mode = 'view' | 'edit';

interface FieldInputState {
  mode: Mode;
  value: string;
  defaultValue: string;
}

export default class FieldInput extends Component<FieldInputProps, FieldInputState> {
  constructor(props: FieldInputProps) {
    super(props);
    this.state = {
      mode: 'view',
      value: props.value,
      defaultValue: props.value
    };
  }

  handleChangeEdit = () => {
    this.setState({
      mode: 'edit'
    });
  };

  handleSave = async () => {
    await this.props.onChangeValue(this.state.value);
    this.setState({ defaultValue: this.state.value, mode: 'view' });
  };

  handleBack = () => {
    this.setState({
      mode: 'view'
    });
  };

  handleChangeValue = (value: string) => {
    this.setState({ value });
  };

  render() {
    const { colors } = this.props.theme;
    const { mode, value, defaultValue } = this.state;
    if (mode === 'view') {
      return (
        <TouchableOpacity style={{ flex: 1 }} onPress={this.handleChangeEdit}>
          <Note style={{ color: colors.primary }}>{defaultValue || '[Click here to set]'}</Note>
        </TouchableOpacity>
      );
    }
    return (
      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
        <Input
          onValueChange={this.handleChangeValue}
          autoFocus={true}
          style={{ flex: 1 }}
          clearButtonMode="never"
          defaultValue={value}
        />
        <TouchableOpacity onPress={this.handleSave}>
          <Icon type="Ionicons" size={28} style={{ width: 40 }} name="ios-checkmark" color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={this.handleBack}>
          <Icon type="Ionicons" size={28} style={{ width: 40 }} name="ios-close" color={colors.colorful.red} />
        </TouchableOpacity>
      </View>
    );
  }
}
