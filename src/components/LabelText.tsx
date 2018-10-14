import React from 'react';
import PropTypes from 'prop-types';
import { View, Text, StyleSheet } from 'react-native';


export default class CheckBox extends React.Component {
  static propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired
  };
  render() {
    const { label, value } = this.props;
    return (
      <View style={styles.container}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.text}>{value}</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    height: 44,
    paddingVertical: 8,
    borderBottomColor: '#c8c7cc',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center'
  },
  label: {
    fontFamily: 'Raleway',
    fontSize: 14,
    textAlign: 'left',
    color: '#979797',
    paddingVertical: 8,
    width: 80
  },
  text: {
    fontFamily: 'Raleway',
    fontSize: 12,
    textAlign: 'left',
    color: '#363b40'
  }
});
