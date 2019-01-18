import React from 'react';
import { Animated, Easing, Text, View } from 'react-native';
import { ProgressCircle } from 'react-native-svg-charts';

interface DonutProps {
  value: number;
  summary: string;
  title: string;
  size?: number;
}

interface DonutState {
  value: number;
  animated: Animated.Value;
}

export default class Donut extends React.PureComponent<DonutProps, DonutState> {
  constructor(props: DonutProps) {
    super(props);
    this.state = {
      value: 0,
      animated: new Animated.Value(0)
    };
  }

  // static getDerivedStateFromProps(props: DonutProps, state: DonutState) {
  //   if (state.value !== props.value) {
  //     return { value: props.value };
  //   }
  // }

  componentDidMount() {
    const { animated } = this.state;
    animated.addListener(({ value }) => {
      this.setState({ value: Math.min(value, 1) });
    });
    // this.move(this.props.value);
  }

  componentWillReceiveProps(nextProps: DonutProps) {
    if (nextProps.value !== this.props.value) {
      this.move(nextProps.value);
    }
  }

  move = async (value: number) => {
    const { animated } = this.state;
    animated.stopAnimation();
    Animated.timing(animated, {
      toValue: value,
      delay: 5,
      duration: 300,
      easing: Easing.bezier(0.165, 0.84, 0.44, 1)
    }).start();
  };
  render() {
    const { title, summary } = this.props;
    const size = this.props.size || 60;
    console.log(this.props);
    return (
      <View style={{ flex: 1, alignItems: 'center' }}>
        <View style={{ height: size, width: size, alignItems: 'center' }}>
          <ProgressCircle
            style={{ height: size, width: size }}
            progress={this.state.value}
            progressColor={'#04E577'}
            startAngle={-Math.PI * 0.8}
            endAngle={Math.PI * 0.8}
            strokeWidth={5.5}
          />
          <Text style={{ top: -(size / 2) - 6, fontSize: 12, color: '#919192' }}>{summary}</Text>
        </View>
        <Text style={{ fontSize: 12, color: '#919192', marginTop: 5 }}>{title}</Text>
      </View>
    );
  }
}
