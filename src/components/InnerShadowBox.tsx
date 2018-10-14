import React from 'react';

import { StyleSheet, Animated, StyleProp, ViewStyle } from 'react-native';

interface InnerShadowBoxProps {
  children?: any;
  style?: StyleProp<ViewStyle>;
}

export default function InnerShadowBox({ children, style }: InnerShadowBoxProps) {
  return <Animated.View style={[styles.container, style]}>{children}</Animated.View>;
}

const styles = StyleSheet.create({
  container: {
    marginTop: -5,
    marginBottom: -5,
    backgroundColor: 'transparent',
    borderColor: 'white',
    borderTopWidth: 5,
    borderBottomWidth: 5,
    overflow: 'hidden',
    shadowColor: 'black',
    shadowRadius: 10,
    shadowOpacity: 0.3
  }
});
