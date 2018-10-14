import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, StyleProp, TextStyle } from 'react-native';
import Modal from 'react-native-modal';

import Theme, { withTheme } from './Theme';
import { Icon } from './Item';
import { sleep } from '../utils';
import SubmitButton from './SubmitButton';
import { resolve } from 'dns';

interface OperationConfirmProps {
  theme?: Theme;
  title?: string;
  message?: string;
  titleStyle?: StyleProp<TextStyle>;
  messageStyle?: StyleProp<TextStyle>;
  okText?: string;
  cancelText?: string;
}

type Action = 'ok' | 'cancel';
interface OperationConfirmState {
  level: 'info' | 'warn';
  visible: boolean;
  title?: string;
  message?: string;
  action?: Action;
  loading: boolean;
  loadingText?: string;
  okText: string;
  cancelText: string;
  onSave?: () => Promise<void>;
}

export interface Options {
  okText?: string;
  onSave?: () => Promise<void>;
  cancelText?: string;
  loadingText?: string;
  additions?: React.ReactElement<any>;
}

export class OperationConfirm extends React.Component<OperationConfirmProps, OperationConfirmState> {
  static init = {
    visible: false,
    title: '',
    message: '',
    okText: 'Save',
    cancelText: 'Cancel',
    action: undefined,
    loading: false,
    loadingText: undefined,
  };
  additions?: React.ReactElement<any>;
  timer?: NodeJS.Timer;
  constructor(props: OperationConfirmProps) {
    super(props);
    this.state = { ...OperationConfirm.init, level: 'info' };
  }

  info = async (title?: string, message?: string, options?: Options): Promise<Action> => {
    return this.open('info', title, message, options);
  };

  warn = async (title?: string, message?: string, options?: Options): Promise<Action> => {
    return this.open('warn', title, message, options);
  };

  open = async (
    level: 'info' | 'warn' = 'info',
    title?: string,
    message?: string,
    options?: Options
  ): Promise<Action> => {
    if (options) {
      const { additions, ...exts } = options;
      this.additions = additions;
      this.setState({
        ...OperationConfirm.init,
        level,
        title,
        message,
        ...exts,
        visible: true
      });
    } else {
      this.additions = undefined;
      this.setState({ ...OperationConfirm.init, title, message, visible: true });
    }
    return await new Promise<Action>(resolve => {
      this.timer = setInterval(() => {
        if (this.state.visible) {
          this.timer && clearInterval(this.timer);
          resolve(this.state.action);
        }
      }, 200);
    });
  };

  close = async () => {
    this.setState({ visible: false });
  };

  componentWillUnmount() {
    this.timer && clearTimeout(this.timer);
  }

  private handleOk = async () => {
    const { onSave } = this.state;
    this.setState({ action: 'ok' });
    onSave && await onSave();
    this.close();
  };

  private handleCancel = () => {
    this.setState({ action: 'cancel' });
    this.close();
  };

  render() {
    const { colors, fonts } = this.props.theme as Theme;
    const { visible, cancelText, loadingText, level, okText } = this.state;
    const { title, message, titleStyle, messageStyle } = this.props;
    const primaryColor = level === 'warn' ? colors.colorful.red : colors.primary;
    return (
      <Modal backdropOpacity={0.2} isVisible={visible}>
        <View style={styles.layout}>
          <View style={[styles.container, { backgroundColor: colors.backgroundColorDeeper }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
              <Icon
                type={level === 'warn' ? 'MaterialCommunityIcons' : 'MaterialIcons'}
                name={level === 'warn' ? 'alert-circle-outline' : 'info-outline'}
                color={primaryColor}
                size={18}
              />
              <Text
                style={[
                  styles.title,
                  {
                    color: primaryColor
                  },
                  titleStyle,
                  fonts.title
                ]}
              >
                {this.state.title || title}
              </Text>
            </View>
            {this.additions}
            <Text
              style={[
                styles.message,
                {
                  color: colors.secondary
                },
                messageStyle,
                fonts.headline
              ]}
            >
              {this.state.message || message}
            </Text>
            <View style={{ marginTop: 5 }}>
              <SubmitButton
                style={{ marginTop: 10, backgroundColor: primaryColor }}
                onSubmit={this.handleOk}
                title={okText}
                submittingText={loadingText as string}
              />
              <TouchableOpacity onPress={this.handleCancel} style={{ marginTop: 10 }}>
                <View
                  style={[
                    styles.cancelBut,
                    {
                      backgroundColor: colors.backgroundColor
                    }
                  ]}
                >
                  <Text style={[{ color: colors.secondary }, fonts.callout]}>
                    {this.state.cancelText || cancelText}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  layout: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  container: {
    width: 300,
    borderRadius: 8,
    marginHorizontal: 30,
    padding: 16
  },
  title: {
    fontWeight: 'bold',
    paddingLeft: 5
  },
  message: {
    marginTop: 5
  },
  cancelOk: {
    height: 40,
    borderRadius: 2,
    justifyContent: 'center',
    alignItems: 'center'
  },
  cancelBut: {
    height: 40,
    borderRadius: 2,
    justifyContent: 'center',
    alignItems: 'center'
  }
});

export default withTheme(OperationConfirm);
