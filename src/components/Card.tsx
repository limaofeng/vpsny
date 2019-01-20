import React from 'react';
import { Dimensions, StyleProp, StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';

import Theme, { withTheme } from './Theme';

interface CardProps {
  theme?: Theme;
  width?: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  onPress?: () => void;
}

class Card extends React.Component<CardProps> {
  static defaultProps = {
    width: Dimensions.get('window').width - 20
  };
  render() {
    const { colors } = this.props.theme as Theme;
    const { children, width, style, containerStyle, radius = 4 } = this.props;
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: 'transparent',
            width,
            shadowColor: colors.minor,
            shadowRadius: radius
          },
          style
        ]}
      >
        <View
          style={[
            {
              overflow: 'hidden',
              backgroundColor: colors.backgroundColorDeeper,
              borderRadius: radius
            },
            this.props.onPress ? {} : containerStyle
          ]}
        >
          {this.props.onPress ? (
            <TouchableOpacity style={[containerStyle]} activeOpacity={0.8} onPress={this.props.onPress}>
              {children}
            </TouchableOpacity>
          ) : (
            children
          )}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    shadowOffset: {
      width: 0,
      height: 0
    },
    shadowRadius: 4,
    shadowOpacity: 0.4,
    marginBottom: 10
  }
});

export default withTheme(Card);
