import React from 'react';
import { connect } from 'react-redux';
import { NavigationScreenOptions, NavigationScreenProp, SafeAreaView } from 'react-navigation';
import {
  StyleSheet,
  View,
  WebView,
  TextInput,
  Dimensions,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
  Keyboard,
  EmitterSubscription,
  ScrollView,
  Animated,
  Easing,
  EasingFunction,
  WebViewMessageEventData,
  Clipboard,
  GestureResponderEvent,
  Text,
  TouchableOpacity
} from 'react-native';
// import { docco } from 'react-syntax-highlighter/styles/hljs';
import { Answers } from 'react-native-fabric';
import { Dispatch } from 'redux';
import { AppState } from '../..';
import { getSSHClient, getShellSupervisor } from '..';
import { Instance } from '../../cloud/type';
import { sleep, uuid, SafeArea } from '../../../utils';

import { IKeyboardResult, IKeyboardEvent } from '../Types';
import { evaluateKeyboardEvent } from '../utils/Keyboard';
import { Icon } from '../../../components';
import { Key, KeyEvent, keySounds } from '../components/Key';
import KeyTapTip from '../components/KeyTapTip';
import { C0 } from '../utils/EscapeSequences';
import { SSHClient } from '../SSHClient';
import Theme, { withTheme } from '../../../components/Theme';
import { SSHConnection } from '../type';
import SSHConnect from '../components/SSHConnect';

const keymaps = {
  Backspace: '\x7f',
  Enter: '\r', // Return/enter
  Tab: '\t',
  Escape: '\x1b',
  // Left, up, right, down arrows
  Left: '\x1b[D',
  Up: '\x1b[A',
  Right: '\x1b[C',
  Down: '\x1b[B',
  // F1-F12
  F1: '\x1bOP', // SS3 P
  F2: '\x1bOQ', // SS3 Q
  F3: '\x1bOR', // SS3 R
  F4: '\x1bOS', // SS3 S
  F5: '\x1b[15~', // CSI 1 5 ~
  F6: '\x1b[17~', // CSI 1 7 ~
  F7: '\x1b[18~', // CSI 1 8 ~
  F8: '\x1b[19~', // CSI 1 9 ~
  F9: '\x1b[20~', // CSI 2 0 ~
  F10: '\x1b[21~', // CSI 2 1 ~
  F11: '\x1b[23~', // CSI 2 3 ~
  F12: '\x1b[24~', // CSI 2 4 ~
  End: '\x1b[F', // SS3 F
  Home: '\x1b[H' // SS3 H
};

interface TerminalProps {
  navigation: NavigationScreenProp<any>;
  dispatch: Dispatch;
  client: SSHClient;
  node: Instance;
  theme: Theme;
}
interface TerminalState {
  anim: Animated.Value;
  termHeight: number;
  keyboardHeight: number;
  keyboard: 'system' | 'extension' | 'hidden';
  gesture: boolean;
}

function runEvaluateKeyboardEvent(
  partialEvent: {
    altKey?: boolean;
    ctrlKey?: boolean;
    shiftKey?: boolean;
    metaKey?: boolean;
    keyCode?: number;
    key?: string;
    type?: string;
  },
  partialOptions: {
    applicationCursorMode?: boolean;
    isMac?: boolean;
    macOptionIsMeta?: boolean;
  } = {}
): IKeyboardResult {
  const event = {
    altKey: partialEvent.altKey || false,
    ctrlKey: partialEvent.ctrlKey || false,
    shiftKey: partialEvent.shiftKey || false,
    metaKey: partialEvent.metaKey || false,
    keyCode: partialEvent.keyCode !== undefined ? partialEvent.keyCode : undefined,
    key: partialEvent.key || '',
    type: partialEvent.type || ''
  };
  const options = {
    applicationCursorMode: partialOptions.applicationCursorMode || false,
    isMac: partialOptions.isMac || false,
    macOptionIsMeta: partialOptions.macOptionIsMeta || false
  };
  return evaluateKeyboardEvent(
    event as IKeyboardEvent,
    options.applicationCursorMode,
    options.isMac,
    options.macOptionIsMeta
  );
}

const dimensions = (() => {
  const data = {
    header: { height: 28 }, // 顶部安全区 44
    toolbar: { height: 46 } // 底部安全区 34
  };
  return {
    ...data,
    term: {
      // 内容区域高度
      height:
        Dimensions.get('window').height - SafeArea.top - SafeArea.bottom - data.header.height - data.toolbar.height
    }
  };
})();

type MessageType = 'input' | 'receipt' | 'resize' | 'handshake';

class Terminal extends React.Component<TerminalProps, TerminalState> {
  static navigationOptions = ({ navigation }: TerminalProps): NavigationScreenOptions => {
    return {
      header: null
    };
  };
  input = React.createRef<TextInput>();
  xterm = React.createRef<WebView>();
  keyboardWillShowListener?: EmitterSubscription;
  keyboardWillHideListener?: EmitterSubscription;
  listeners = new Map<
    string,
    {
      resolve: (value?: {} | PromiseLike<{}> | undefined) => void;
      reject: (reason?: any) => void;
    }
  >();
  arrows = React.createRef<Key>();
  altKey = React.createRef<Key>();
  ctrlKey = React.createRef<Key>();
  shiftKey = React.createRef<Key>();
  metaKey = React.createRef<Key>();
  keyTip = React.createRef<KeyTapTip>();
  gestureHandlers: {
    onStartShouldSetResponder: () => boolean;
    onMoveShouldSetResponder: () => boolean;
    onResponderGrant: (e: GestureResponderEvent) => void;
    onResponderMove: (e: GestureResponderEvent) => void;
    onResponderRelease: () => void;
    onTouchEnd: () => void;
  };
  offset: { x: number; y: number } = { x: 0, y: 0 };
  arrow?: 'left' | 'right' | 'up' | 'down';
  timer: NodeJS.Timer | undefined;
  constructor(props: TerminalProps) {
    super(props);
    this.state = {
      termHeight: dimensions.term.height,
      keyboardHeight: 291,
      keyboard: 'system',
      anim: new Animated.Value(0),
      gesture: false
    };
    const arrows = {
      left: {
        tip: 'arrow-left-bold',
        key: keymaps.Left
      },
      right: {
        tip: 'arrow-right-bold',
        key: keymaps.Right
      },
      up: {
        tip: 'arrow-up-bold',
        key: keymaps.Up
      },
      down: {
        tip: 'arrow-down-bold',
        key: keymaps.Down
      }
    };
    this.gestureHandlers = {
      onStartShouldSetResponder: () => this.isGesture(),
      onMoveShouldSetResponder: () => this.isGesture(),
      onResponderGrant: (e: GestureResponderEvent) => {
        this.offset = {
          x: e.nativeEvent.locationX,
          y: e.nativeEvent.locationY
        };
        console.log('grant', e.nativeEvent);
      },
      onResponderMove: async (e: GestureResponderEvent) => {
        if (this.arrow) {
          return;
        }
        const offset = {
          x: e.nativeEvent.locationX,
          y: e.nativeEvent.locationY
        };
        if (Math.abs(this.offset.y - offset.y) > 40) {
          this.arrow = this.offset.y > offset.y ? 'up' : 'down';
        } else if (Math.abs(this.offset.x - offset.x) > 50) {
          this.arrow = this.offset.x > offset.x ? 'left' : 'right';
        }
        const { keyboard, termHeight } = this.state;
        if (this.arrow) {
          const exec = () => {
            if (this.arrow) {
              const tap = this.keyTip.current as KeyTapTip;
              tap.tip({
                type: 'icon',
                name: arrows[this.arrow].tip,
                frameHeight: keyboard === 'hidden' ? dimensions.term.height : termHeight
              });
              this.handleSpecialKey(arrows[this.arrow].key);
            } else {
              clearInterval(timer);
            }
          };
          exec();
          await sleep(200);
          const timer = setInterval(exec, 200);
          this.timer = timer;
        }
      },
      onResponderRelease: () => {
        this.timer && clearInterval(this.timer);
        this.arrow = undefined;
      },
      onTouchEnd: () => {
        const timer = setTimeout(() => {
          clearTimeout(timer);
          this.timer && clearInterval(this.timer);
          this.arrow = undefined;
        }, 200);
      }
    };
  }

  handleSpecialKey = (key: string) => {
    keySounds.click.play();
    this.handleEvaluateKeyboardEvent(key);
  };

  componentDidMount() {
    this.keyboardWillShowListener = Keyboard.addListener('keyboardWillShow', this.keyboardShow);
    this.keyboardWillHideListener = Keyboard.addListener('keyboardWillHide', this.keyboardHide);
  }
  componentWillUnmount() {
    this.closeShell();
    this.keyboardWillShowListener && this.keyboardWillShowListener.remove();
    this.keyboardWillHideListener && this.keyboardWillHideListener.remove();
    Answers.logContentView('Close Terminal', 'Terminal', this.props.client.target);
  }
  keyboardShow = async (e: any) => {
    const end = e.endCoordinates;
    const keyboardHeight = end.height;
    this.setState({
      termHeight: dimensions.term.height - keyboardHeight + SafeArea.bottom,
      keyboardHeight: keyboardHeight
    });
    const Easings: any = Easing;
    this.toolbar(1, e.duration, Easings[e.easing]);
  };

  keyboardHide = async (e: any) => {
    const { keyboard } = this.state;
    const end = e.endCoordinates;
    const keyboardHeight = end.height;
    if (keyboard === 'system') {
      this.setState({
        termHeight: dimensions.term.height,
        keyboardHeight: keyboardHeight
      });
      const Easings: any = Easing;
      this.toolbar(0, e.duration, Easings[e.easing]);
    } else {
      this.setState({
        keyboardHeight: 291
      });
    }
  };

  toolbar = async (
    value: number,
    duration: number = 250,
    easing: EasingFunction = Easing.bezier(0.17, 0.59, 0.4, 0.77)
  ) => {
    const { anim, keyboardHeight } = this.state;
    if (value) {
      await this.resizeTerm(dimensions.term.height - keyboardHeight + SafeArea.bottom, true);
    } else {
      await this.resizeTerm(dimensions.term.height);
    }
    anim.stopAnimation();
    Animated.timing(anim, {
      toValue: value,
      duration,
      easing
    }).start(() => {
      if (value === 0) {
        this.setState({ termHeight: dimensions.term.height, keyboardHeight: 0, keyboard: 'hidden' });
      }
    });
  };

  togglekeyboard = async () => {
    const input = this.input.current as TextInput;
    this.setState({ keyboard: 'system' });
    if (input.isFocused()) {
      input.blur();
    } else {
      input.focus();
    }
  };

  toggleExtendedKeyboard = async () => {
    const { anim } = this.state;
    const value = (anim as any)._value;
    const input = this.input.current as TextInput;
    // 已显示主键盘
    if (value) {
      if (input.isFocused()) {
        // 设置键盘类型为扩展
        this.setState({ keyboard: 'extension' });
        input.blur(); // 隐藏主键盘
      } else {
        this.setState({ keyboard: 'system' });
        input.focus();
      }
    } else {
      this.setState({ keyboard: 'extension' });
      this.toolbar(1);
    }
  };

  resizeTerm = async (height: number, scrollToBottom: boolean = false) => {
    const { client } = this.props;
    const { cols, rows } = await this.sendMessage('resize', { height, scrollToBottom });
    client.resizeShell(cols, rows);
  };

  handshake = async () => {
    const { cols, rows } = await this.sendMessage('handshake');
    await this.startShell(cols, rows);
    this.togglekeyboard();
    Answers.logContentView('Open Terminal', 'Terminal', this.props.client.target);
  };

  handleShell = async (event: 'output' | 'close', body: string) => {
    // TODO: \u0007 退格及方向键无效时的字符，可以使用它匹配一些效果
    if (event === 'close') {
      await this.sendMessage('input', '\nShell Close');
    } else {
      await this.sendMessage('input', body);
    }
  };

  async startShell(cols: number, rows: number) {
    const { client } = this.props;
    await client.connect();
    await client.authenticate();
    client.on('Shell', this.handleShell);
    await client.startShell('xterm');
    await client.resizeShell(cols, rows);
  }

  closeShell() {
    const { client } = this.props;
    client.closeShell();
  }

  async writeToShell(key: string) {
    const { client } = this.props;
    await client.writeToShell(key);
  }

  sendMessage = async (type: MessageType, payload?: any): Promise<any> => {
    const xterm = this.xterm.current as WebView;
    const id = uuid();
    const wait = new Promise((resolve, reject) => {
      this.listeners.set(id, {
        resolve,
        reject
      });
    });
    xterm.postMessage(JSON.stringify({ id, type, payload }));
    return wait;
  };

  handleMessage = (event: NativeSyntheticEvent<WebViewMessageEventData>) => {
    if (event.nativeEvent.data === '[object Object]') {
      return;
    }
    try {
      const { type, id, payload } = JSON.parse(event.nativeEvent.data);
      switch (type) {
        case 'receipt':
          const listener = this.listeners.get(id);
          this.listeners.delete(id);
          if (listener) {
            listener.resolve(payload);
          } else {
            console.warn(payload);
          }
          break;
        case 'copy':
          Clipboard.setString(payload);
          break;
        default:
          console.log(type, payload);
      }
    } catch (e) {
      console.warn(e, event.nativeEvent.data);
    }
  };

  handleOpenKeyboard = () => {
    const input = this.input.current as TextInput;
    input.focus();
  };

  handleGesture = (event: KeyEvent) => {
    this.setState({ gesture: event.active });
  };

  handleWrite = async (e: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
    const keys: any = keymaps;
    this.handleEvaluateKeyboardEvent(keys[e.nativeEvent.key] || e.nativeEvent.key);
  };

  handlePasteFromClipboard = async () => {
    const text = await Clipboard.getString();
    if (text) {
      await this.writeToShell(text);
    }
  };

  handleKeepKey = async (event: KeyEvent) => {
    if (event.type === 'double-click' && event.active) {
      event.target.hold();
    }
  };

  handleKey = async (event: KeyEvent) => {
    await this.writeToShell(event.value);
  };

  handleWriteEnter = () => {
    this.handleEvaluateKeyboardEvent(keymaps.Enter);
  };

  handleEvaluateKeyboardEvent = async (key: string) => {
    const _altKey = this.altKey.current as Key;
    const _ctrlKey = this.ctrlKey.current as Key;
    // TODO: 暂不支持 shiftKey 与 metaKey
    // const shiftKey = (this.shiftKey.current as Key).active;
    // const metaKey = (this.metaKey.current as Key).active;
    const altKey = _altKey.active;
    const ctrlKey = _ctrlKey.active;
    const shiftKey = false;
    const metaKey = false;
    if (altKey || ctrlKey || shiftKey || metaKey) {
      const result = runEvaluateKeyboardEvent({ altKey, ctrlKey, shiftKey, metaKey, keyCode: key.charCodeAt(0), key });
      if (!(result && result.key)) {
        console.warn(key, key.charCodeAt(0), result && JSON.stringify(result.key));
        return;
      }
      key = result.key;
      altKey && _altKey.reset();
      ctrlKey && _ctrlKey.reset();
    }
    await this.writeToShell(key);
  };

  isGesture() {
    const { gesture, keyboard } = this.state;
    return gesture && keyboard !== 'hidden';
  }

  render() {
    return (
      <SafeAreaView style={styles.container} forceInset={{ bottom: 'never', top: 'never' }}>
        {/*<SSHConnect id={node.id} />*/}
        <Animated.View
          style={{
            height: this.state.anim.interpolate({
              inputRange: [0, 1],
              outputRange: [dimensions.term.height, this.state.termHeight]
            }),
            width: '100%'
          }}
          pointerEvents={this.isGesture() ? 'box-only' : 'auto'}
          {...this.gestureHandlers}
        >
          <KeyTapTip ref={this.keyTip} />
          <WebView
            style={{
              flex: 1
            }}
            source={require('../assets/xterm.html')}
            ref={this.xterm}
            bounces={false}
            onMessage={this.handleMessage}
            onLoadEnd={this.handshake}
          />
        </Animated.View>
        <View
          style={[
            styles.toolbar,
            {
              paddingLeft: 3,
              paddingTop: 7,
              paddingBottom: 4,
              marginRight: 2,
              flexDirection: 'row',
              backgroundColor: '#D1D3D9',
              zIndex: 100
            }
          ]}
        >
          {/*
          <Key
            icon={{ type: 'MaterialCommunityIcons', name: 'code-braces' }}
            audio="modifier"
            backgroundColor="#A9AEBB"
          />*/}
          <Key
            ref={this.arrows}
            icon={{ type: 'MaterialCommunityIcons', name: 'gesture-tap' }}
            audio="modifier"
            backgroundColor="#A9AEBB"
            onClick={this.handleGesture}
            active={this.state.gesture}
            keep
          />
          <ScrollView
            keyboardShouldPersistTaps={'always'}
            style={{ flexDirection: 'row' }}
            showsHorizontalScrollIndicator={false}
            horizontal
            alwaysBounceHorizontal
          >
            <Key
              icon={{ type: 'FontAwesome', name: 'paste', size: 16 }}
              audio="modifier"
              onClick={this.handlePasteFromClipboard}
            />
            <Key ref={this.ctrlKey} text="ctrl" audio="click" keep value="ctrl" onClick={this.handleKeepKey} />
            <Key ref={this.altKey} text="alt" audio="click" keep value="alt" onClick={this.handleKeepKey} />
            <Key text="tab" audio="click" value={C0.HT} onClick={this.handleKey} />
            <Key text="esc" audio="click" value={C0.ESC} onClick={this.handleKey} />
            <Key text="-" audio="click" value="-" onClick={this.handleKey} />
            <Key text="/" audio="click" value="/" onClick={this.handleKey} />
          </ScrollView>
          <Key
            icon={{ type: 'FontAwesome', name: 'keyboard-o' }}
            audio="modifier"
            backgroundColor="#A9AEBB"
            onClick={this.togglekeyboard}
          />
          {/*
          <Key
            icon={{ type: 'Ionicons', name: 'ios-more' }}
            audio="modifier"
            backgroundColor="#A9AEBB"
            onClick={this.toggleExtendedKeyboard}
          />
          */}
        </View>
        <View style={{ top: -40, zIndex: 0 }}>
          <TextInput
            opacity={0}
            clearTextOnFocus
            style={{
              position: 'absolute',
              width: '100%',
              height: 40,
              backgroundColor: 'green'
            }}
            onSubmitEditing={this.handleWriteEnter}
            autoCapitalize="none"
            autoCorrect={false}
            blurOnSubmit={false}
            onKeyPress={this.handleWrite}
            ref={this.input}
          />
        </View>
        <Animated.View
          style={{
            width: '100%',
            height: this.state.anim.interpolate({
              inputRange: [0, 1],
              outputRange: [SafeArea.bottom, this.state.keyboardHeight]
            }),
            backgroundColor: '#D1D3D9'
          }}
        />
        {/*
        <Animated.View
          style={{
            width: '100%',
            // height: 291,
            top: 0,
            transform: [
              {
                translateY: this.state.anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, this.state.keyboardHeight]
                })
              }
            ],
            backgroundColor: 'red'
          }}
        />
        */}
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  toolbar: {
    height: dimensions.toolbar.height
  }
});

interface TerminalWrapProps {
  navigation: NavigationScreenProp<any>;
  dispatch: Dispatch;
  client: SSHClient;
  node: Instance;
  connection: SSHConnection;
  theme: Theme;
}
interface TerminalWrapState {
  status: 'unauthorized' | 'available' | 'edit';
  title: string;
}
class TerminalWrap extends React.Component<TerminalWrapProps, TerminalWrapState> {
  static navigationOptions = ({ navigation }: TerminalWrapProps): NavigationScreenOptions => {
    return {
      header: null
    };
  };
  client?: SSHClient;
  constructor(props: TerminalWrapProps) {
    super(props);
    const { connection } = props;
    this.state = { status: connection.status === 'available' ? 'available' : 'unauthorized', title: 'Connecting' };
    const supervisor = getShellSupervisor();
    if (connection.status === 'available') {
      const client = supervisor.getShell(connection) as SSHClient;
      this.client = client;
      let timer: NodeJS.Timer;
      const updateTitle = async () => {
        clearTimeout(timer);
        if (await client.isAuthorized()) {
          this.setState({ title: client.target });
          return;
        } else if (!(await client.isConnected())) {
          this.setState({ title: 'Connecting' });
        } else {
          this.setState({ title: 'Authenticating' });
        }
        timer = setTimeout(updateTitle, 500);
      };
      setTimeout(updateTitle, 500);
    }
  }
  handleClose = () => {
    const { navigation } = this.props;
    if (this.state.status !== 'edit') {
      navigation.pop();
    }
  };

  handleSettings = () => {
    this.setState({ status: 'edit' });
  };
  handleConnection = (client: SSHClient) => {
    this.setState({ status: 'available' });
    this.client = client;
  };
  render() {
    const { status, title } = this.state;
    const body =
      status === 'available' ? (
        <Terminal {...this.props} client={this.client as SSHClient} />
      ) : (
        <SSHConnect onSuccess={this.handleConnection} {...this.props} />
      );
    const { colors, fonts } = this.props.theme;
    return (
      <View style={styles.container}>
        <View
          style={{
            height: dimensions.header.height + SafeArea.top,
            paddingTop: 38,
            paddingHorizontal: 15,
            alignItems: 'center',
            width: '100%',
            flexDirection: 'row',
            backgroundColor: colors.backgroundColorDeeper,
            borderBottomColor: colors.secondary,
            borderBottomWidth: StyleSheet.hairlineWidth
          }}
        >
          <TouchableOpacity
            onPress={this.handleClose}
            style={{ width: 30, height: 30, justifyContent: 'center', alignItems: 'center' }}
          >
            <Icon type="MaterialCommunityIcons" name="close" color={colors.major} size={23} />
          </TouchableOpacity>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={[{ color: colors.major }, fonts.callout]}>{title}</Text>
          </View>
          <TouchableOpacity
            onPress={this.handleSettings}
            style={{ width: 30, height: 30, justifyContent: 'center', alignItems: 'center' }}
          >
            <Icon type="MaterialCommunityIcons" name="settings" color={colors.major} size={23} />
          </TouchableOpacity>
        </View>
        {body}
      </View>
    );
  }
}

const callbacks: any[] = [];
const mapStateToProps = ({ ssh: { connections } }: AppState, { navigation }: TerminalProps) => {
  const value = navigation.getParam('value') as Instance;
  return {
    connection: connections.find(con => con.id === value.id) as SSHConnection,
    node: value,
    on: (event: 'SSHClient', callback: (client: SSHClient) => void) => {
      callbacks.push(callback);
    }
  };
};

const mapDispatchToProps = (dispatch: Dispatch, { navigation }: TerminalProps) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withTheme(TerminalWrap, false));
