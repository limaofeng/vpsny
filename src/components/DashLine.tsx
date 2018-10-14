import React, { Component } from 'react';
import { Text, View, StyleSheet } from 'react-native';

interface DashLineProps {
  width: number;
  backgroundColor: string;
}

export default class DashLine extends Component<DashLineProps> {
  render() {
    const len = this.props.width / 6;
    const arr = [];
    for (let i = 0; i < len; i++) {
      arr.push(i);
    }
    return (
      <View style={[styles.dashLine, { width: this.props.width }]}>
        {arr.map((item, index) => {
          return (
            <Text style={[styles.dashItem, { backgroundColor: this.props.backgroundColor }]} key={'dash' + index}>
              {' '}
            </Text>
          );
        })}
      </View>
    );
  }
}
const styles = StyleSheet.create({
  dashLine: {
    flexDirection: 'row'
  },
  dashItem: {
    height: StyleSheet.hairlineWidth,
    width: 4,
    marginRight: 2,
    flex: 1
  }
});
