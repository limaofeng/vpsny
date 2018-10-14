interface CircularProps {
    value: number;
    summary: string;
    title: string;
  }
  
  interface CircularState {
    progress: number;
    animated: Animated.Value;
  }
  
  class Circular extends React.Component<CircularProps, CircularState> {
    constructor(props: CircularProps) {
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
  
    componentWillReceiveProps(nextProps: CircularProps) {
      this.move(nextProps.value / 100);
    }
  
    move = async (value: number) => {
      const { animated } = this.state;
      await sleep(1000);
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
      //  transform: [{ rotate: '180deg' }]
      return (
        <View style={{ flex: 1, alignItems: 'center' }}>
          <View style={{ height: 60, width: 60, alignItems: 'center' }}>
            <ProgressCircle
              style={{ height: 60, width: 60 }}
              progress={this.state.progress}
              progressColor={'#04E577'}
              startAngle={-Math.PI * 0.8}
              endAngle={Math.PI * 0.8}
              strokeWidth={5.5}
            />
            <Text style={{ top: -(60 / 2) - 6, fontSize: 12, color: '#919192' }}>{summary}</Text>
          </View>
          <Text style={{ fontSize: 12, color: '#919192', marginTop: 5 }}>{title}</Text>
        </View>
      );
    }
  }