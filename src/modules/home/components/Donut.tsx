import React from 'react';
import { Animated, Easing, Text, View } from 'react-native';
import { ProgressCircle } from 'react-native-svg-charts';
import { sleep } from '@utils';

interface DonutProps {
  value: number;
  summary: string;
  title: string;
  size?: number;
}

interface DonutState {
  progress: number;
  animated: Animated.Value;
}

export default class Donut extends React.Component<DonutProps, DonutState> {
  constructor(props: DonutProps) {
    super(props);
    this.state = {
      progress: 0,
      animated: new Animated.Value(0)
    };
  }

  componentDidMount() {
    const { animated } = this.state;
    animated.addListener(({ value }) => {
      this.setState({ progress: Math.min(value, 1) });
    });
    this.move(this.props.value / 100);
  }

  componentWillReceiveProps(nextProps: DonutProps) {
    this.move(nextProps.value / 100);
  }

  move = async (value: number) => {
    const { animated } = this.state;
    await sleep(250);
    animated.stopAnimation();
    Animated.timing(animated, {
      toValue: value,
      delay: 300,
      duration: 500,
      easing: Easing.linear
    }).start();
  };

  render() {
    const { title, summary } = this.props;
    const size = this.props.size || 60;
    return (
      <View style={{ flex: 1, alignItems: 'center' }}>
        <View style={{ height: size, width: size, alignItems: 'center' }}>
          <ProgressCircle
            style={{ height: size, width: size }}
            progress={this.state.progress}
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
