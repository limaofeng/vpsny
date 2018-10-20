import React from 'react';
import { Alert, StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import Spinner from 'react-native-spinkit';

import { sleep } from '../utils';
import { Icon } from './Item';
import Theme, { withTheme } from './Theme';

interface SubmitButtonProps {
  testID?: string;
  title: string;
  submittingText?: string;
  doneText?: string;
  buttonStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
  onSubmit?: () => Promise<void>;
  reentrant?: boolean;
  disabled?: boolean;
  theme?: Theme;
}

interface SubmitButtonState {
  submitting: boolean;
  submittingText: string;
  disabled: boolean;
  done: boolean;
}

export class SubmitButton extends React.Component<SubmitButtonProps, SubmitButtonState> {
  static defaultProps = {
    onSubmit: async () => {
      await sleep(5000);
    },
    reentrant: false,
    submittingText: 'Saving',
    doneText: 'Done'
  };
  constructor(props: SubmitButtonProps) {
    super(props);
    this.state = {
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
      await onSubmit();
      this.setState({ submitting: false, done: true });
    } catch (error) {
      const { response } = error;
      if (response && response.status === 412) {
        error.message = response.data;
      }
      console.warn(error.message);
      this.setState({ submitting: false, done: false });
      Alert.alert('Error', error.message);
    }
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
    const { title, doneText, style, buttonStyle, reentrant, testID } = this.props;
    const { submitting, done, submittingText, disabled } = this.state;
    return (
      <TouchableOpacity
        // disabled={submitting || (!reentrant && done)}
        onPress={this.handleSubmit}
        testID={testID}
        accessibilityTraits="button"
        style={[styles.container, { backgroundColor: disabled ? colors.trivial : colors.primary }, style]}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Spinner
            isVisible={submitting}
            style={{ marginRight: 10 }}
            size={21}
            type="Arc"
            color={colors.backgroundColorDeeper}
          />
          {done && (
            <Icon
              type="Ionicons"
              name="md-checkmark"
              size={21}
              color={colors.backgroundColorDeeper}
              style={{ marginRight: 10 }}
            />
          )}
          <Text style={[styles.title, { color: colors.backgroundColorDeeper }, fonts.callout, buttonStyle]}>
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
