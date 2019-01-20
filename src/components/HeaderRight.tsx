import React from 'react';
import { Text, TouchableOpacity } from 'react-native';

import Theme, { withTheme } from './Theme';

interface HeaderRightProps {
  title?: string;
  theme?: Theme;
  visible?: boolean;
  onClick?: () => void;
}

interface HeaderRightState {
  visible: boolean;
}

class HeaderRight extends React.Component<HeaderRightProps, HeaderRightState> {
  static defaultProps = {
    visible: true
  };
  constructor(props: HeaderRightProps) {
    super(props);
    this.state = { visible: !!props.visible };
  }
  show() {
    this.setState({ visible: true });
  }
  hide() {
    this.setState({ visible: false });
  }
  render() {
    const { colors, fonts } = this.props.theme as Theme;
    const { title, onClick, children } = this.props;
    const { visible } = this.state;
    if (visible) {
      return (
        <TouchableOpacity style={{ height: 30, marginRight: 15, justifyContent: 'center', alignItems: 'center' }} onPress={onClick}>
          {title ? <Text style={[{ color: colors.primary }, fonts.callout]}>{title}</Text> : children}
        </TouchableOpacity>
      );
    }
    return [];
  }
}

export default withTheme(HeaderRight);
