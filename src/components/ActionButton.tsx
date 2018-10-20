import React, { Component } from 'react';
import { Animated, LayoutChangeEvent, StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';

export const shadowStyle = {
  shadowOpacity: 0.35,
  shadowOffset: {
    width: 0,
    height: 5
  },
  shadowColor: '#000',
  shadowRadius: 3,
  elevation: 5
};

interface ActionButtonItemProps {
  angle?: number;
  radius?: number;
  title?: string;
  buttonColor?: string;
  onPress?: () => void;
  startDegree?: number;
  endDegree?: number;
  anim?: Animated.Value;
  size?: number;
  testID?: string;
  activeOpacity?: number;
}

export class ActionButtonItem extends Component<ActionButtonItemProps> {
  static defaultProps = {
    onPress: () => {},
    startDegree: 0,
    endDegree: 720
  };
  state = {
    width: 0
  };
  handleLayout = (e: LayoutChangeEvent) => {
    if (!this.state.width) {
      this.setState({ width: e.nativeEvent.layout.width });
    }
  };
  render() {
    const { anim, radius, angle } = this.props;
    const offsetX = radius! * Math.cos(angle!);
    const offsetY = radius! * Math.sin(angle!);
    return (
      <View>
        <Animated.View
          style={[
            {
              opacity: anim!,
              width: this.props.size,
              height: this.props.size,
              transform: [
                {
                  translateY: anim!.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, offsetY]
                  })
                },
                {
                  translateX: anim!.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, offsetX]
                  })
                },
                {
                  rotate: anim!.interpolate({
                    inputRange: [0, 1],
                    outputRange: [`${this.props.startDegree}deg`, `${this.props.endDegree}deg`]
                  })
                },
                {
                  scale: anim!.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 1]
                  })
                }
              ]
            }
          ]}
        >
          <TouchableOpacity
            style={{ flex: 1 }}
            testID={this.props.testID}
            accessibilityTraits="button"
            activeOpacity={this.props.activeOpacity || 0.85}
            onPress={this.props.onPress}
          >
            <View
              style={[
                styles.actionButton,
                {
                  width: this.props.size,
                  height: this.props.size,
                  borderRadius: this.props.size! / 2,
                  backgroundColor: this.props.buttonColor
                }
              ]}
            >
              {this.props.children}
            </View>
          </TouchableOpacity>
        </Animated.View>
        {this.props.title && (
          <Animated.View
            onLayout={this.handleLayout}
            style={{
              top: +8,
              left: -(this.state.width + 10 || 0),
              opacity: anim!,
              backgroundColor: '#fff',
              position: 'absolute',
              paddingVertical: 5,
              paddingHorizontal: 10,
              shadowOpacity: 0.3,
              shadowOffset: {
                width: 0,
                height: 1
              },
              transform: [
                {
                  translateY: anim!.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, offsetY]
                  })
                },
                {
                  translateX: anim!.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, offsetX]
                  })
                }
              ],
              shadowColor: '#444',
              justifyContent: 'center',
              borderRadius: 3
            }}
          >
            <Text style={{ fontSize: 13, color: '#3B3F42' }}>{this.props.title}</Text>
          </Animated.View>
        )}
      </View>
    );
  }
}

const alignMap = {
  center: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    startDegree: 180,
    endDegree: 360
  },

  left: {
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
    startDegree: 270,
    endDegree: 360
  },

  right: {
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    startDegree: 180,
    endDegree: 270
  }
};

interface ActionButtonProps {
  testID?: string;
  active?: boolean;
  bgColor?: string;
  buttonColor?: string;
  buttonTextColor?: string;
  btnOutRange?: string;
  size?: number;
  itemSize?: number;
  autoInactive?: boolean;
  onPress?: () => void;
  onOverlayPress?: () => void;
  backdrop?: boolean | any;
  startDegree?: number;
  endDegree?: number;
  radius?: number;
  position?: 'left' | 'center' | 'right';
  overlayStyle?: StyleProp<ViewStyle>;
  actionStyle?: StyleProp<ViewStyle>;
  outRangeScale?: number;
  btnOutRangeTxt?: string;
  degrees?: number;
  icon?: any;
}

interface ActionButtonState {
  active: boolean;
  anim: Animated.Value;
}

export default class ActionButton extends Component<ActionButtonProps, ActionButtonState> {
  timeout?: NodeJS.Timer;
  static Item = ActionButtonItem;
  static defaultProps = {
    active: false,
    bgColor: 'transparent',
    buttonColor: 'rgba(0,0,0,1)',
    buttonTextColor: 'rgba(255,255,255,1)',
    position: 'center',
    outRangeScale: 1,
    autoInactive: true,
    onPress: () => {},
    onOverlayPress: () => {},
    backdrop: false,
    degrees: 135,
    size: 63,
    itemSize: 36,
    radius: 100,
    btnOutRange: 'rgba(0,0,0,1)',
    btnOutRangeTxt: 'rgba(255,255,255,1)',
    overlayStyle: {}
  };
  constructor(props: ActionButtonProps) {
    super(props);
    this.state = {
      active: !!props.active,
      anim: new Animated.Value(props.active ? 1 : 0)
    };
  }

  componentWillUnmount() {
    this.timeout && clearTimeout(this.timeout);
  }

  getActionButtonStyle() {
    return [styles.actionBarItem, this.getButtonSize()];
  }

  getActionContainerStyle(): StyleProp<ViewStyle> | any {
    const { alignItems, justifyContent } = alignMap[this.props.position!];
    return [
      styles.overlay,
      styles.actionContainer,
      {
        alignItems,
        justifyContent
      }
    ];
  }
  getActionsStyle() {
    return [this.getButtonSize()];
  }

  getButtonSize() {
    return {
      width: this.props.size,
      height: this.props.size
    };
  }

  animateButton() {
    if (this.state.active) {
      this.reset();
      return;
    }
    Animated.spring(this.state.anim, {
      toValue: 1
      //   duration: 250
    }).start();

    this.setState({ active: true });
  }

  reset() {
    Animated.spring(this.state.anim, {
      toValue: 0
      // duration: 250
    }).start(() => {
      this.setState({});
    });

    setTimeout(() => {
      this.setState({ active: false });
    }, 250);
  }

  handlePress = () => {
    this.props.onPress!();
    if (this.props.children) {
      this.animateButton();
    }
  };

  renderButton() {
    return (
      <View style={[this.getActionButtonStyle(), this.props.actionStyle]}>
        <TouchableOpacity
          accessibilityTraits="button"
          testID={this.props.testID}
          activeOpacity={0.85}
          onPress={this.handlePress}
        >
          <Animated.View
            style={[
              styles.btn,
              {
                width: this.props.size,
                height: this.props.size,
                borderRadius: this.props.size! / 2,
                backgroundColor: this.state.anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [this.props.buttonColor!, this.props.btnOutRange!]
                }),
                transform: [
                  {
                    scale: this.state.anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, this.props.outRangeScale!]
                    })
                  },
                  {
                    rotate: this.state.anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', this.props.degrees! + 'deg']
                    })
                  }
                ]
              }
            ]}
          >
            {this.renderButtonIcon()}
          </Animated.View>
        </TouchableOpacity>
      </View>
    );
  }

  renderButtonIcon() {
    if (this.props.icon) {
      return this.props.icon;
    }

    return (
      <Animated.Text
        style={[
          styles.btnText,
          {
            color: this.state.anim.interpolate({
              inputRange: [0, 1],
              outputRange: [this.props.buttonTextColor!, this.props.btnOutRangeTxt!]
            })
          }
        ]}
      >
        +
      </Animated.Text>
    );
  }

  renderActions() {
    if (!this.state.active) return null;
    const startDegree = this.props.startDegree || alignMap[this.props.position!].startDegree;
    const endDegree = this.props.endDegree || alignMap[this.props.position!].endDegree;
    const startRadian = (startDegree * Math.PI) / 180;
    const endRadian = (endDegree * Math.PI) / 180;

    const childrenCount = React.Children.count(this.props.children);
    let offset = 0;
    if (childrenCount !== 1) {
      offset = (endRadian - startRadian) / (childrenCount - 1);
    }

    return React.Children.map(this.props.children, (button, index) => {
      return (
        <View pointerEvents="box-none" style={[this.getActionContainerStyle()]}>
          <ActionButtonItem
            key={index}
            position={this.props.position}
            anim={this.state.anim}
            size={this.props.itemSize}
            radius={this.props.radius}
            angle={startRadian + index * offset}
            btnColor={this.props.btnOutRange}
            {...button.props}
            onPress={() => {
              if (this.props.autoInactive) {
                this.timeout = setTimeout(() => {
                  this.reset();
                }, 200);
              }
              button.props.onPress();
            }}
          />
        </View>
      );
    });
  }

  render() {
    let backdrop;
    if (this.state.active) {
      backdrop = (
        <TouchableOpacity
          activeOpacity={1}
          style={[styles.overlay, this.props.overlayStyle]}
          onPress={() => {
            this.reset();
            this.props.onOverlayPress!();
          }}
        >
          <Animated.View
            style={{
              backgroundColor: this.props.bgColor,
              opacity: this.state.anim,
              flex: 1
            }}
          >
            {this.props.backdrop}
          </Animated.View>
        </TouchableOpacity>
      );
    }
    return (
      <View pointerEvents="box-none" style={[styles.overlay, this.props.overlayStyle]}>
        {backdrop}

        {this.props.children && this.renderActions()}
        <View pointerEvents="box-none" style={this.getActionContainerStyle()}>
          {this.renderButton()}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
    backgroundColor: 'transparent'
  },
  actionContainer: {
    flexDirection: 'column',
    padding: 10
  },
  actionBarItem: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent'
  },
  btn: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowOpacity: 0.3,
    shadowOffset: {
      width: 0,
      height: 1
    },
    shadowColor: '#444',
    shadowRadius: 1
  },
  btnText: {
    marginTop: -4,
    fontSize: 24,
    backgroundColor: 'transparent',
    position: 'relative'
  },
  actionButton: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    paddingTop: 2,
    shadowOpacity: 0.3,
    shadowOffset: {
      width: 0,
      height: 1
    },
    shadowColor: '#444',
    shadowRadius: 1,
    backgroundColor: 'red',
    position: 'absolute'
  }
});
