import React from 'react';
import {
  PanResponder,
  PanResponderInstance,
  View,
  Dimensions,
  Animated,
  TouchableWithoutFeedback,
  StyleSheet,
  StyleProp,
  ViewStyle
} from 'react-native';
import firebase, { RNFirebase } from 'react-native-firebase';

type WindowDimensions = { width: number; height: number };

type Event = {
  nativeEvent: {
    layout: {
      width: number;
      height: number;
    };
  };
};

type State = {
  width: number;
  height: number;
  openOffsetMenuPercentage: number;
  openMenuOffset: number;
  hiddenMenuOffsetPercentage: number;
  hiddenMenuOffset: number;
  left: Animated.Value;
  moving: boolean;
};

const deviceScreen: WindowDimensions = Dimensions.get('window');
const barrierForward: number = deviceScreen.width / 4;

function shouldOpenMenu(dx: number): boolean {
  return dx > barrierForward;
}

interface SideMenuProps {
  edgeHitWidth: number;
  toleranceX: number;
  toleranceY: number;
  menuPosition: 'left' | 'right';
  onChange: (open: boolean) => void;
  onMove?: (value: number) => void;
  children: any;
  menu: any;
  openMenuOffset: number;
  hiddenMenuOffset: number;
  animationStyle?: (value: Animated.Value) => StyleProp<ViewStyle>;
  disableGestures?: () => void | boolean;
  animationFunction?: (prop: Animated.Value, value: number) => Animated.CompositeAnimation;
  onAnimationComplete?: () => void;
  onSliding?: (value: number) => void;
  onStartShouldSetResponderCapture?: () => void;
  isOpen: boolean;
  bounceBackOnOverdraw: boolean;
  autoClosing: boolean;
}

interface SideMenuState {}

export default class SideMenu extends React.Component<SideMenuProps, SideMenuState> {
  state: State;
  prevLeft: number;
  isOpen: boolean;

  static defaultProps = {
    toleranceY: 10,
    toleranceX: 10,
    edgeHitWidth: 60,
    children: null,
    menu: null,
    openMenuOffset: deviceScreen.width * (2 / 3),
    disableGestures: false,
    menuPosition: 'left',
    hiddenMenuOffset: 0,
    onMove: () => {},
    onChange: () => {},
    onSliding: () => {},
    animationStyle: (value: number) => ({
      transform: [
        {
          translateX: value
        }
      ]
    }),
    animationFunction: (prop: Animated.Value, value: number) => {
      return Animated.spring(prop, {
        toValue: value,
        friction: 8
      });
    },
    onAnimationComplete: () => {},
    isOpen: false,
    bounceBackOnOverdraw: true,
    autoClosing: true
  };
  responder: PanResponderInstance;
  analytics?: RNFirebase.Analytics;
  onMoveShouldSetPanResponder: any;
  onPanResponderMove: any;
  onPanResponderRelease: any;
  onPanResponderTerminate: any;
  constructor(props: SideMenuProps) {
    super(props);

    this.prevLeft = 0;
    this.isOpen = !!props.isOpen;

    const initialMenuPositionMultiplier = props.menuPosition === 'right' ? -1 : 1;
    const openOffsetMenuPercentage = props.openMenuOffset / deviceScreen.width;
    const hiddenMenuOffsetPercentage = props.hiddenMenuOffset / deviceScreen.width;
    const left: Animated.Value = new Animated.Value(
      props.isOpen ? props.openMenuOffset * initialMenuPositionMultiplier : props.hiddenMenuOffset
    );

    this.onMoveShouldSetPanResponder = this.handleMoveShouldSetPanResponder.bind(this);
    this.onPanResponderMove = this.handlePanResponderMove.bind(this);
    this.onPanResponderRelease = this.handlePanResponderEnd.bind(this);
    this.onPanResponderTerminate = this.handlePanResponderEnd.bind(this);

    this.responder = PanResponder.create({
      // onStartShouldSetPanResponderCapture: this.handleStartShouldSetResponderCapture,
      onMoveShouldSetPanResponder: this.onMoveShouldSetPanResponder,
      onPanResponderMove: this.onPanResponderMove,
      onPanResponderRelease: this.onPanResponderRelease,
      onPanResponderTerminationRequest: () => {
        console.log('onPanResponderTerminationRequest');
        return true;
      },
      onPanResponderTerminate: this.onPanResponderTerminate
    });

    this.state = {
      width: deviceScreen.width,
      height: deviceScreen.height,
      openOffsetMenuPercentage,
      openMenuOffset: deviceScreen.width * openOffsetMenuPercentage,
      hiddenMenuOffsetPercentage,
      hiddenMenuOffset: deviceScreen.width * hiddenMenuOffsetPercentage,
      left,
      moving: false
    };

    this.state.left.addListener(({ value }) =>
      this.props.onSliding!(
        Math.abs((value - this.state.hiddenMenuOffset) / (this.state.openMenuOffset - this.state.hiddenMenuOffset))
      )
    );
  }

  componentWillReceiveProps(props: SideMenuProps): void {
    if (
      typeof props.isOpen !== 'undefined' &&
      this.isOpen !== props.isOpen &&
      (props.autoClosing || this.isOpen === false)
    ) {
      this.openMenu(props.isOpen);
    }
  }

  componentDidMount() {
    this.analytics = firebase.analytics();
    this.analytics.setCurrentScreen('Sidebar', 'SideMenu.tsx');
  }

  onLayoutChange = (e: Event) => {
    const { width, height } = e.nativeEvent.layout;
    const openMenuOffset = width * this.state.openOffsetMenuPercentage;
    const hiddenMenuOffset = width * this.state.hiddenMenuOffsetPercentage;
    this.setState({ width, height, openMenuOffset, hiddenMenuOffset });
  };

  /**
   * Get content view. This view will be rendered over menu
   * @return {React.Component}
   */
  getContentView() {
    let overlay = null;
    if (this.isOpen || this.state.moving) {
      overlay = (
        <TouchableWithoutFeedback onPress={() => this.openMenu(false)}>
          <Animated.View
            style={[
              styles.overlay,
              {
                backgroundColor: this.state.left.interpolate({
                  inputRange: [0, this.props.openMenuOffset * 0.7, this.props.openMenuOffset],
                  outputRange: ['rgba(167, 168, 172, 0)', 'rgba(167, 168, 172, 0.1)', 'rgba(167, 168, 172, 0.4)']
                })
              }
            ]}
          />
        </TouchableWithoutFeedback>
      );
    }

    const { width, height } = this.state;
    // const ref = sideMenu => (this.sideMenu = sideMenu);
    const style = [styles.frontView, { width, height } /*, this.props.animationStyle(this.state.left)*/];

    return (
      <Animated.View style={style}>
        {this.props.children}
        {overlay}
      </Animated.View>
    );
  }

  moveLeft(offset: number) {
    const newOffset = this.menuPositionMultiplier() * offset;

    this.analytics!.logEvent('Sidebar_' + ((newOffset === 0) ? 'close' : 'open'));
    this.props.animationFunction!(this.state.left, newOffset).start(this.props.onAnimationComplete);

    this.prevLeft = newOffset;
  }

  menuPositionMultiplier(): -1 | 1 {
    return this.props.menuPosition === 'right' ? -1 : 1;
  }

  handlePanResponderMove(e: Object, gestureState: Object) {
    if (this.state.left.__getValue() * this.menuPositionMultiplier() >= 0) {
      let newLeft = this.prevLeft + gestureState.dx;

      if (!this.props.bounceBackOnOverdraw && Math.abs(newLeft) > this.state.openMenuOffset) {
        newLeft = this.menuPositionMultiplier() * this.state.openMenuOffset;
      }

      if (newLeft <= this.state.openMenuOffset) {
        if (!this.state.moving) {
          this.setState({ moving: true });
        }
        this.props.onMove!(newLeft);
        this.state.left.setValue(newLeft);
      }
    }
  }

  handlePanResponderEnd(e: Object, gestureState: Object) {
    const offsetLeft = this.menuPositionMultiplier() * (this.state.left.__getValue() + gestureState.dx);
    this.openMenu(shouldOpenMenu(offsetLeft));
    this.setState({ moving: false });
  }

  handleMoveShouldSetPanResponder(e: any, gestureState: any): boolean {
    if (this.gesturesAreEnabled()) {
      const x = Math.round(Math.abs(gestureState.dx));
      const y = Math.round(Math.abs(gestureState.dy));

      const touchMoved = x > this.props.toleranceX && y < this.props.toleranceY;

      if (this.isOpen) {
        return touchMoved;
      }

      const withinEdgeHitWidth =
        this.props.menuPosition === 'right'
          ? gestureState.moveX > deviceScreen.width - this.props.edgeHitWidth
          : gestureState.moveX < this.props.edgeHitWidth;

      const swipingToOpen = this.menuPositionMultiplier() * gestureState.dx > 0;
      return withinEdgeHitWidth && touchMoved && swipingToOpen;
    }

    return false;
  }

  openMenu(isOpen: boolean): void {
    const { hiddenMenuOffset, openMenuOffset } = this.state;
    this.moveLeft(isOpen ? openMenuOffset : hiddenMenuOffset);
    this.isOpen = isOpen;

    this.forceUpdate();
    this.props.onChange(isOpen);
  }

  gesturesAreEnabled(): boolean {
    const { disableGestures } = this.props;

    if (typeof disableGestures === 'function') {
      return !disableGestures();
    }

    return !disableGestures;
  }

  render() {
    const boundryStyle =
      this.props.menuPosition === 'right'
        ? { left: this.state.width - this.state.openMenuOffset }
        : { right: this.state.width - this.state.openMenuOffset };
    // boundryStyle
    const menu = (
      <View style={[styles.menu, { width: this.props.openMenuOffset }]}>
        {this.props.menu}
      </View>
    );

    const animationStyle = this.props.animationStyle!(this.state.left);

    // const left = this.state.mleft;
    return (
      <Animated.View
        {...this.responder.panHandlers}
        style={[styles.container, { flexDirection: 'row', left: -this.props.openMenuOffset }, animationStyle]}
        onLayout={this.onLayoutChange}
      >
        {menu}
        {this.getContentView()}
      </Animated.View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    // position: 'absolute',
    // top: 0,
    // left: 0,
    // bottom: 0,
    // right: 0,
    // justifyContent: 'center'
    flex: 1
  },
  menu: {
    // position: 'absolute',
    // top: 0,
    // left: 0,
    // bottom: 0,
    // right: 0
  },
  frontView: {
    // flex: 1,
    // position: 'absolute',
    // left: 0,
    // top: 0,
    // backgroundColor: 'transparent',
    // overflow: 'hidden'
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    backgroundColor: 'transparent'
  }
});
