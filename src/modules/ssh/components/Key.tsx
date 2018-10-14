import React from 'react';
import { View, StyleSheet, Text, NativeModules } from 'react-native';
import Sound from 'react-native-sound';
const { RNAudio } = NativeModules;

Sound.setCategory('Playback', false);

const loadSound = (name: string): Sound => {
  const whoosh = new Sound(name, '/System/Library/Audio/UISounds', error => {
    if (error) {
      console.log('failed to load the sound', error);
      return;
    }
    console.log('duration in seconds: ' + whoosh.getDuration() + 'number of channels: ' + whoosh.getNumberOfChannels());
  });
  const handler = {
    get: function(target: any, name: string) {
      if (name === 'play') {
        return () => {
          RNAudio.getSystemVolume().then((volume: number) => {
            whoosh.setVolume(0.1 / (volume / 1));
            target[name]();
          });
        };
      }
      return target[name];
    }
  };
  return new Proxy(whoosh, handler);
};

export const keySounds = {
  click: loadSound('key_press_click.caf'),
  modifier: loadSound('key_press_modifier.caf'),
  delete: loadSound('key_press_delete.caf')
};

import { Icon } from '../../../components';
import { IconProps } from '../../../components/Item';
import DoubleTap from '../../../components/DoubleTap';
import { color } from '../../../utils/format';
import { sleep } from '../../../utils';

const defalutColor = '#FFFFFF';
const actionColor = '#A9AEBB';
const holdColor = '#126CB7';
const activeColor = '#2091F6';
const keyColor = '#000000';

export type KeyEvent = {
  type: 'click' | 'double-click';
  value: any;
  active: boolean;
  keep: boolean;
  target: Key;
};

interface KeyProps {
  /**
   * 按键文字
   */
  text?: string;
  /**
   * 按键图标
   *
   * @type {IconProps}
   * @memberof KeyProps
   */
  icon?: IconProps;
  /**
   * 设置背景色
   *  默认为 #FFFFFF
   *
   * @type {string}
   * @memberof KeyProps
   */
  backgroundColor?: '#FFFFFF' | '#A9AEBB';
  /**
   * 激活状态，只有 keep == true 该配置才有意义
   *
   * @type {boolean}
   * @memberof KeyProps
   */
  active?: boolean;
  /**
   *
   * 按键音效
   * @type {('click' | 'delete' | 'modifier')}
   * @memberof KeyProps
   */
  audio?: 'click' | 'delete' | 'modifier';
  /**
   * 按键设置后不会立即弹起，如果设置该属性需要调用 xxx 方法，恢复状态
   */
  keep?: boolean;
  /**
   * 点击事件
   */
  onClick?: (event: KeyEvent) => void;
  /**
   * 事件会回调该值
   *
   * @type {*}
   * @memberof KeyProps
   */
  value?: any;
}

interface KeyState {
  backgroundColor: string;
  active: boolean;
  color: string;
  hold: boolean;
}

export class Key extends React.Component<KeyProps, KeyState> {
  static defaultProps = {
    backgroundColor: defalutColor
  };
  lastTap: number = -1;
  constructor(props: KeyProps) {
    super(props);
    const { active } = props;
    const backgroundColor = this.getBackgroundColor(props);
    this.state = {
      backgroundColor,
      active: !!active,
      color: this.getColor(backgroundColor),
      hold: false
    };
  }

  getBackgroundColor(props: KeyProps, reverse: boolean = false) {
    const { active, keep, backgroundColor: originalColor = defalutColor } = props;
    let backgroundColor = keep ? ((reverse ? !active : active) ? activeColor : originalColor) : originalColor;
    if (reverse) {
      if (!keep) {
        backgroundColor = backgroundColor === actionColor ? defalutColor : backgroundColor;
      }
    }
    return backgroundColor;
  }

  getColor(backgroundColor: string): any {
    if ([defalutColor, actionColor].some(color => color === backgroundColor)) {
      return keyColor;
    }
    return defalutColor;
  }

  handleDoubleTap = () => {
    this.handleClick('double-click');
  };

  handleTap = () => {
    this.handleClick('click');
  };

  hold = async () => {
    this.setState({ hold: true });
    await sleep(100);
    this.setState({ backgroundColor: holdColor, color: this.getColor(holdColor) });
  };

  get active(): boolean {
    return this.state.active;
  }

  reset = () => {
    const { hold } = this.state;
    if (hold) {
      return;
    }
    const backgroundColor = this.props.backgroundColor || defalutColor;
    this.setState({
      backgroundColor,
      active: false,
      color: this.getColor(backgroundColor)
    });
  };

  handleClick = async (type: 'click' | 'double-click') => {
    const { onClick, value, keep, backgroundColor: originalBackgroundColor = defalutColor } = this.props;
    const { active: preactive } = this.state;
    const active = type === 'double-click' ? true : !preactive;
    const backgroundColor = this.getBackgroundColor({ active, keep, backgroundColor: originalBackgroundColor });
    this.setState({
      active: active
    });
    onClick &&
      onClick({
        type,
        value,
        keep: !!keep,
        active,
        target: this
      });
    await sleep(50);
    if (keep) {
      if (this.hold && type === 'double-click') {
        return;
      }
      this.setState({
        active: active,
        backgroundColor: backgroundColor,
        color: this.getColor(backgroundColor)
      });
    } else {
      this.setState({ backgroundColor });
    }
  };

  handlePressIn = () => {
    const { audio } = this.props;
    const now = Date.now();
    if (!(this.lastTap && now - this.lastTap < 300)) {
      this.lastTap = now;
      const backgroundColor = this.getBackgroundColor(
        { backgroundColor: this.props.backgroundColor, keep: this.props.keep, active: this.state.active },
        true
      );
      this.setState({
        backgroundColor,
        color: this.getColor(backgroundColor)
      });
    }
    if (audio) {
      keySounds[audio].play();
    }
  };

  render() {
    const { text, icon } = this.props;
    const { backgroundColor, color } = this.state;
    let key;
    if (text) {
      key = <Text style={{ color, fontWeight: '500' }}>{text}</Text>;
    } else if (icon) {
      key = <Icon type={icon.type} name={icon.name} color={color} size={icon.size || 19} />;
    }
    return (
      <View style={[styles.container]}>
        <DoubleTap onTapStart={this.handlePressIn} onTap={this.handleTap} onDoubleTap={this.handleDoubleTap}>
          <View style={[styles.inner, { backgroundColor }]}>{key}</View>
        </DoubleTap>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    height: 34,
    width: 36,
    overflow: 'hidden',
    marginHorizontal: 2.5,
    alignItems: 'center',
    justifyContent: 'flex-start',
    borderTopEndRadius: 5,
    borderTopStartRadius: 5,
    borderBottomEndRadius: 5,
    borderBottomStartRadius: 5
  },
  inner: {
    width: 35.7,
    height: 32.5,
    backgroundColor: '#FFFFFF',
    borderRadius: 4.5,
    shadowColor: '#87898F',
    shadowOffset: { width: 0, height: 1.2 },
    shadowOpacity: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }
});
