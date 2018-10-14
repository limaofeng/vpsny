import React from 'react';
import PropTypes from 'prop-types';
import { View, Text, StyleSheet, TouchableOpacity, Touchable } from 'react-native';
import { Icon } from './Item';

export default class CheckBox extends React.Component {
  static propTypes = {
    label: PropTypes.string.isRequired,
    onChange: PropTypes.func
  };
  static defaultProps = {
    onChange: () => {}
  };
  state = {
    checked: false
  };
  handleChange = () => {
    const { checked } = this.state;
    const { onChange } = this.props;
    this.setState({ checked: !checked });
    onChange(!checked);
  };
  render() {
    const { checked } = this.state;
    const { label } = this.props;
    return (
      <View style={[styles.container, { flexDirection: 'row', alignItems: 'center' }]}>
        <Icon size={28} onPress={this.handleChange} name={checked ? 'checked' : 'unchecked'} color={colors.primary} />
        <TouchableOpacity style={{ flex: 1 }} onPress={this.handleChange}>
          <Text style={[styles.label]}>{label}</Text>
        </TouchableOpacity>
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
    fontSize: 13,
    letterSpacing: -0.21,
    textAlign: 'left',
    color: '#8c8c8c'
  }
});
