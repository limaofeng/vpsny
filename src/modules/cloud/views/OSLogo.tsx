import React from 'react';
import { Image } from 'react-native';
import { Icon } from '../../../components';
import Theme, { withTheme } from '../../../components/Theme';

const images = {
  centos: require('../assets/os/centos.png'),
  coreos: require('../assets/os/coreos.png'),
  debian: require('../assets/os/debian.png'),
  fedora: require('../assets/os/fedora.png'),
  freebsd: require('../assets/os/freebsd.png'),
  openbsd: require('../assets/os/openbsd.png'),
  ubuntu: require('../assets/os/ubuntu.png')
};

export function getLogoName(os?: string) {
  if (!os) {
    return 'linux';
  }
  for (const name of Object.keys(images)) {
    if (os.includes(name)) {
      return name;
    }
  }
  return 'linux';
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
