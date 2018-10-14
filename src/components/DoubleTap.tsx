import React from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Vibration,
  GestureResponderEvent,
  TouchableOpacityProps
} from 'react-native';

interface DoubleTapProps {
  delay?: number;
  activeOpacity?: number;
  onTapStart?: () => void;
  onTap?: () => void;
  onTapEnd?: () => void;
  onDoubleTap?: () => void;
}

export default class DoubleTap extends React.Component<DoubleTapProps> {
  static defaultProps = {
    delay: 300,
    activeOpacity: 1,
    onTap: () => null,
    onDoubleTap: () => null
  };
  lastTap: number = -1;
  tapStartTimer?: NodeJS.Timer;
  timer?: NodeJS.Timer;
  gestureHandlers: {
    onStartShouldSetResponder: () => boolean;
    onMoveShouldSetResponder: () => boolean;
    onResponderGrant: (e: GestureResponderEvent) => void;
    onResponderMove: (e: GestureResponderEvent) => void;
    onResponderRelease: () => void;
    onTouchEnd: () => void;
  };
  locationX: number = 0;
  status = 'init'; // init -> in
  constructor(props: DoubleTapProps) {
    super(props);
    const { onTapStart, onTapEnd } = props;
    this.gestureHandlers = {
      onStartShouldSetResponder: () => true,
      onMoveShouldSetResponder: () => true,
      onResponderGrant: (e: GestureResponderEvent) => {
        this.tapStartTimer = setTimeout(() => {
          this.tapStartTimer && clearTimeout(this.tapStartTimer);
          onTapStart && onTapStart();
          this.status = 'in';
        }, 200);
        this.locationX = e.nativeEvent.locationX;
      },
      onResponderMove: (e: GestureResponderEvent) => {
        if (Math.abs(this.locationX - e.nativeEvent.locationX) > 10) {
          this.tapStartTimer && clearTimeout(this.tapStartTimer);
        }
      },
      onResponderRelease: () => {
        if (this.status === 'init') {
          this.tapStartTimer && clearTimeout(this.tapStartTimer);
          onTapStart && onTapStart();
        }
        this.handleDoubleTap();
      },
      onTouchEnd: () => {
        this.status = 'init';
        onTapEnd && onTapEnd();
      }
    };
  }

  handleDoubleTap = () => {
    const { delay = 300, onDoubleTap, onTap } = this.props;
    const now = Date.now();
    this.timer && clearTimeout(this.timer);
    if (this.lastTap && now - this.lastTap < delay) {
      onDoubleTap && onDoubleTap();
    } else {
      this.lastTap = now;
      // this.timer = setTimeout(() => {
        // this.timer && clearTimeout(this.timer);
        onTap && onTap();
      // }, delay);
    }
  };

  componentWillUnmount() {
    this.timer && clearTimeout(this.timer);
    this.tapStartTimer && clearTimeout(this.tapStartTimer);
  }

  render() {
    return <View {...this.gestureHandlers}>{this.props.children}</View>;
  }
}
