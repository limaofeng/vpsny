import React from 'react';

import { Icon } from '../../../components';
import Theme, { withTheme } from '../../../components/Theme';

export function getLogoName(os?: string) {
  if (!os) {
    return 'linux';
  }
  return os.split(/[ |-]/g)[0];
}

interface OSLogoProps {
  size: number;
  name: string;
  theme?: Theme;
}
// <Image source={getSystemLogo(data.os)} resizeMode="contain" style={{ height: 50, width: 50 }} />
class OSLogo extends React.Component<OSLogoProps> {
  render() {
    const { colors } = this.props.theme as Theme;
    const { size, name } = this.props;
    return <Icon name={getLogoName(name.toLowerCase())} size={size} color={colors.primary} />;
  }
}

export default withTheme(OSLogo, false);
