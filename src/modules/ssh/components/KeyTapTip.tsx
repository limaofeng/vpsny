import React from 'react';
import { Easing, StyleSheet, Text, Dimensions, Animated } from 'react-native';
import { Icon } from '../../../components';

interface KeyTapTipState {
  anim: Animated.Value;
  frameHeight: number;
  type: 'text' | 'icon';
  name: string;
  visible: boolean;
}

export default class KeyTapTip extends React.Component<any, KeyTapTipState> {
  constructor(props: any) {
    super(props);
    this.state = {
      anim: new Animated.Value(1),
      frameHeight: 0,
      type: 'icon',
      name: '',
      visible: false
    };
  }

  tip = ({ type, name, frameHeight }: { type: 'text' | 'icon'; name: string; frameHeight: number }) => {
    const { anim } = this.state;
    anim.setValue(1);
    anim.stopAnimation();
    this.setState({
      type,
      name,
      frameHeight,
      visible: true
    });
    Animated.timing(anim, {
      toValue: 0,
      duration: 450,
      easing: Easing.linear
    }).start(() => {
      this.setState({
        visible: false
      });
    });
  };

  render() {
    const { frameHeight, type, name, visible, anim } = this.state;
    const top = frameHeight / 2;
    if (!visible) {
      return [];
    }
    const content =
      type === 'text' ? (
        <Text>{name}</Text>
      ) : (
        <Icon type="MaterialCommunityIcons" name={name} color="#FFFFFF" size={23} />
      );
    return (
      <Animated.View
        style={[
          styles.container,
          {
            top,
            opacity: anim.interpolate({
              inputRange: [0, 0.2, 1],
              outputRange: [0, 1, 0]
            })
          }
        ]}
        zIndex={250}
      >
        {content}
      </Animated.View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    backgroundColor: 'rgba(96, 96, 96, 0.85)',
    marginLeft: -30,
    marginTop: -20,
    width: 60,
    height: 40,
    borderRadius: 18,
    left: Dimensions.get('window').width / 2
  },
  toolbar: {}
});
