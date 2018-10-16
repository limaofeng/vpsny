import React from 'react';
import { View } from 'react-native';

import Theme, { withTheme } from './Theme';

interface BottomRegionProps {
  theme?: Theme;
  height?: number;
  isVisible?: boolean;
  backgroundColor?: string;
}

class BottomRegion extends React.Component<BottomRegionProps> {
  static defaultProps = {
    height: 60,
    isVisible: true
  };
  render() {
    const { colors } = this.props.theme!;
    const { height = 60, children, isVisible = true, backgroundColor = colors.backgroundColor } = this.props;
    return isVisible ? (
      <View
        style={[
          {
            marginBottom: -35,
            height: height + 35,
            backgroundColor
          }
        ]}
      >
        <View
          style={[
            {
              height: height + 10,
              backgroundColor,
              shadowColor: 'rgba(0, 0, 0, 0.04)',
              shadowOffset: {
                width: 0,
                height: -2
              },
              shadowRadius: 6,
              shadowOpacity: 1,
              justifyContent: 'center',
              alignItems: 'center'
            }
          ]}
        >
          {children}
        </View>
      </View>
    ) : (
      []
    );
  }
}

export default withTheme(BottomRegion);
