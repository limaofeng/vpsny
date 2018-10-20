import React from 'react';
import { View } from 'react-native';

import Theme, { withTheme } from './Theme';
import { SafeArea } from '@utils';

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
    const { children, isVisible = true, backgroundColor = colors.backgroundColorDeeper } = this.props;
    const height = this.props.height || 60;
    return isVisible ? (
      <View
        style={[
          {
            paddingBottom: Math.max(0, SafeArea.bottom - 10),
            height: height + Math.max(6, SafeArea.bottom - 10),
            backgroundColor
          }
        ]}
      >
        <View
          style={[
            {
              height: height,
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
