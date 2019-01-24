import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle, StyleProp } from 'react-native';

import { Icon } from './Item';
import Theme, { withTheme } from './Theme';

interface CheckBoxProps {
  theme?: Theme;
  label?: string | React.ReactElement<any>;
  onChange?: (value: boolean) => void;
  color?: string;
  activeColor?: string;
  style?: StyleProp<ViewStyle>;
}

class CheckBox extends React.Component<CheckBoxProps> {
  static defaultProps = {
    onChange: () => {}
  };
  state = {
    checked: false
  };
  handleChange = () => {
    const { checked } = this.state;
    const { onChange } = this.props;
    this.setState({ checked: !checked });
    onChange!(!checked);
  };
  render() {
    const { colors, fonts } = this.props.theme as Theme;
    const { checked } = this.state;
    const { label, style, color = colors.minor, activeColor = colors.primary } = this.props;
    return (
      <View style={[styles.container, { flexDirection: 'row', alignItems: 'center' }, style]}>
        <Icon
          type="MaterialIcons"
          size={18}
          onPress={this.handleChange}
          name={checked ? 'check-box' : 'check-box-outline-blank'}
          color={checked ? activeColor : color}
        />
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={0.9} onPress={this.handleChange}>
          {typeof label === 'string' ? (
            <Text style={[fonts.footnote, { paddingLeft: 4, color: colors.secondary }]}>{label}</Text>
          ) : (
            label
          )}
        </TouchableOpacity>
      </View>
    );
  }
}

export default withTheme(CheckBox);

const styles = StyleSheet.create({
  container: {
    height: 40
  }
});
