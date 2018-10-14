import React from 'react';
import PropTypes from 'prop-types';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { isEqual } from 'lodash';

import { Icon } from '../utils/fonts';

export default class LabelTextInput extends React.Component {
  static propTypes = {
    label: PropTypes.string,
    keyboardType: PropTypes.string,
    maxLength: PropTypes.number,
    placeholder: PropTypes.string,
    inputStyle: PropTypes.any,
    value: PropTypes.string,
    onChange: PropTypes.func
  };
  static defaultProps = {
    label: '',
    value: null,
    keyboardType: null,
    maxLength: null,
    placeholder: null,
    inputStyle: {},
    onChange: () => {}
  };
  constructor(props) {
    super(props);
    this.state = {
      value: props.value
    };
  }
  shouldComponentUpdate(nextProps) {
    return !isEqual(nextProps, this.props);
  }
  handleClean = () => {
    this.setState({ value: '' });
  };
  handleChangeText = value => {
    const { onChange } = this.props;
    this.setState({ value });
    onChange(value);
  };
  render() {
    const { label, keyboardType, maxLength, placeholder, inputStyle } = this.props;
    const { value } = this.state;
    return (
      <View style={[styles.container, { flexDirection: 'row', alignItems: 'center' }]}>
        <Text style={[styles.label, { paddingVertical: 8, paddingLeft: 3, position: 'absolute' }]}>{label}</Text>
        <TextInput
          value={value}
          keyboardType={keyboardType}
          maxLength={maxLength}
          onChangeText={this.handleChangeText}
          placeholder={placeholder}
          style={[styles.input, inputStyle]}
          underlineColorAndroid="transparent"
        />
        {!!value && (
          <TouchableOpacity onPress={this.handleClean} style={{ padding: 6 }}>
            <Icon name="close" color="#979797" />
          </TouchableOpacity>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    height: 44,
    paddingVertical: 8,
    borderBottomColor: '#c8c7cc',
    borderBottomWidth: StyleSheet.hairlineWidth
  },
  label: {
    fontFamily: 'Raleway',
    fontSize: 14,
    textAlign: 'left',
    color: '#979797',
    width: 80
  },
  input: {
    opacity: 0.8,
    fontFamily: 'Raleway',
    fontSize: 12,
    color: '#363b40',
    flex: 1,
    paddingTop: 6,
    paddingLeft: 80
  }
});
