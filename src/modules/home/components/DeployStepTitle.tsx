import React from 'react';
import { View, StyleSheet, Text } from 'react-native';

interface DeployStepTitleProps {
  step: string;
  title: string;
}

export class DeployStepTitle extends React.Component<DeployStepTitleProps> {
  render() {
    const { step, title } = this.props;
    return (
      <View style={[styles.container]}>
        <Text style={styles.step}>{step}</Text>
        <Text style={styles.title}>{title}</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    height: 50,
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12.5
  },
  step: {
    width: 25,
    height: 25,
    borderRadius: 12.5,
    borderWidth: 1.5,
    borderColor: '#d2d8dc',
    color: '#8a9399',
    fontFamily: 'Raleway-SemiBold',
    fontSize: 18,
    textAlign: 'center'
  },
  title: {
    flex: 1,
    fontFamily: 'Raleway',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: -0.43,
    paddingLeft: 15,
    paddingVertical: 2,
    color: '#363b40'
  }
});
