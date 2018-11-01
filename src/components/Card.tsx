import React from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Dimensions,
  Image,
  StyleProp,
  ViewStyle
} from 'react-native';
import Theme, { withTheme } from './Theme';

interface CardProps {
  theme?: Theme;
  width?: number;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}

class Card extends React.Component<CardProps> {
  static defaultProps = {
    width: Dimensions.get('window').width - 20
  };
  render() {
    const { colors } = this.props.theme as Theme;
    const { children, width, style } = this.props;
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.backgroundColor,
            width,
            shadowColor: colors.trivial
          },
          style
        ]}
      >
        <View
          style={{
            overflow: 'hidden',
            backgroundColor: colors.backgroundColorDeeper,
            borderRadius: 4
          }}
        >
          {this.props.onPress ? (
            <TouchableOpacity activeOpacity={0.8} onPress={this.props.onPress}>
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
