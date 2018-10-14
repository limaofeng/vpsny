import React from 'react';
import Theme, { withTheme } from './Theme';
import { TouchableOpacity } from 'react-native';
import { Icon } from './Item';

interface HeaderLeftCloseProps {
  theme?: Theme;
  onPress?: () => void;
}

class HeaderLeftClose extends React.Component<HeaderLeftCloseProps> {
  render() {
    const { colors, fonts } = this.props.theme as Theme;
    return (
      <TouchableOpacity
        onPress={this.props.onPress}
        style={{ width: 44, height: 44, justifyContent: 'center', alignItems: 'center', marginLeft: 10 }}
      >
        <Icon type="Ionicons" name="md-close" size={28} color={colors.primary} />
      </TouchableOpacity>
    );
  }
}

export default withTheme(HeaderLeftClose);
