import React from 'react';
import { TouchableOpacity, Animated, Easing } from 'react-native';

interface SpinnerProps {
  loading?: boolean;
  onClick?: () => void;
  clockwise?: boolean;
}
interface SpinnerState {
  animated: Animated.Value;
  loading: boolean;
}

export default class Spinner extends React.Component<SpinnerProps, SpinnerState> {
  static defaultProps = {
    clockwise: true
  };
  constructor(props: SpinnerProps) {
    super(props);
    this.state = {
      animated: new Animated.Value(0),
      loading: !!props.loading
    };
  }

  shouldComponentUpdate() {
    return false;
  }

  componentWillMount() {
    if (this.state.loading) {
      this.reloading();
    }
  }

  componentWillReceiveProps(nextProps: SpinnerProps) {
    if (this.state.loading !== nextProps.loading) {
      this.setState({ loading: !!nextProps.loading });
      !!nextProps.loading && this.reloading();
    }
  }

  handleClick = async () => {
    if (!this.props.onClick || this.state.loading) {
      return;
    }
    this.props.onClick();
  };

  reloading = () => {
    const { animated } = this.state;
    animated.stopAnimation();
    Animated.timing(animated, {
      toValue: 360 * 500,
      duration: 200 * 500,
      easing: Easing.linear
    }).start(() => {
      animated.setValue(0);
      if (this.state.loading) {
        // this.reloading();
      }
    });
  };

  render() {
    const { clockwise, onClick } = this.props;
    const { animated } = this.state;
    const body = (
      <Animated.View
        style={{
          transform: [
            {
              rotate: animated.interpolate({
                inputRange: [0, 360],
                outputRange: clockwise ? ['0deg', '060deg'] : ['360deg', '0deg']
              })
            }
          ]
        }}
      >
        {this.props.children}
      </Animated.View>
    );
    if (!onClick) {
      return body;
    }
    return (
      <TouchableOpacity
        style={{
          width: 30,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 5
        }}
        onPress={this.handleClick}
      >
        {body}
      </TouchableOpacity>
    );
  }
}
