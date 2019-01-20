import React from 'react';
import { StyleProp, StyleSheet, Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import Spinner from 'react-native-spinkit';

import { sleep } from '../utils';
import { Icon } from './Item';
import Theme, { withTheme } from './Theme';

interface SubmitButtonProps {
  testID?: string;
  title: string;
  submittingText?: string;
  doneText?: string;
  buttonStyle?: StyleProp<TextStyle>;
  style?: StyleProp<ViewStyle>;
  spinnerSize?: number;
  onSubmit?: () => Promise<void>;
  reentrant?: boolean;
  disabled?: boolean;
  disabledStyle?: {
    buttonStyle?: StyleProp<TextStyle>;
    style?: StyleProp<ViewStyle>;
  };
  theme?: Theme;
}

interface SubmitButtonState {
  title: string;
  submitting: boolean;
  submittingText: string;
  disabled: boolean;
  done: boolean;
}

export class SubmitButton extends React.Component<SubmitButtonProps, SubmitButtonState> {
  static defaultProps = {
    onSubmit: async (button?: SubmitButton) => {
      await sleep(5000);
    },
    reentrant: false,
    submittingText: 'Saving',
    doneText: 'Done',
    disabledStyle: {
      style: {},
      buttonStyle: {}
    }
  };
  constructor(props: SubmitButtonProps) {
    super(props);
    this.state = {
      title: props.title,
      submitting: false,
      disabled: !!props.disabled,
      done: false,
      submittingText: props.submittingText || SubmitButton.defaultProps.submittingText
    };
  }
  handleSubmit = async () => {
    const { onSubmit = SubmitButton.defaultProps.onSubmit } = this.props;
    this.setState({ submitting: true });
    try {
      await onSubmit(this);
      this.setState({ submitting: false, done: true });
    } catch (error) {
      const { response } = error;
      if (response && response.status === 412) {
        error.message = response.data;
      }
      console.warn(error.message);
      this.setState({ submitting: false, done: false });
      // Alert.alert('Error', error.message);
    }
  };
  update = (state: SubmitButtonState) => {
    this.setState({ ...state });
  };
  submittingText = (text: string) => {
    this.setState({ submittingText: text });
  };
  disable = () => {
    this.setState({ disabled: true });
  };
  enable = () => {
    this.setState({ disabled: false });
  };
  render() {
    const { colors, fonts } = this.props.theme as Theme;
    const { doneText, style, buttonStyle, spinnerSize, disabledStyle, testID } = this.props;
    const { submitting, done, submittingText, disabled, title } = this.state;
    return (
      <TouchableOpacity
        disabled={disabled}
        onPress={this.handleSubmit}
        testID={testID}
        accessibilityTraits="button"
        style={[
          styles.container,
          { backgroundColor: disabled ? colors.trivial : colors.primary },
          style,
          disabled ? disabledStyle!.style : {}
        ]}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Spinner
            isVisible={submitting}
            style={{ marginRight: 10 }}
            size={spinnerSize || 21}
            type="Arc"
            color={colors.backgroundColorDeeper}
          />
          {done && (
            <Icon
              type="Ionicons"
              name="md-checkmark"
              size={spinnerSize || 21}
              color={colors.backgroundColorDeeper}
              style={{ marginRight: 10 }}
            />
          )}
          <Text
            style={[
              styles.title,
              { color: colors.backgroundColorDeeper },
              fonts.callout,
              buttonStyle,
              disabled ? disabledStyle!.buttonStyle : {}
            ]}
          >
            {submitting ? submittingText : done ? doneText : title}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    height: 40,
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 2
  },
  title: {
    textAlign: 'center',
    fontWeight: 'bold'
  }
});

export default withTheme(SubmitButton);
