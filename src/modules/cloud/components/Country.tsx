import { Svg, Icon } from '@components';
import React from 'react';
import { Image } from 'react-native';
import { IcoMoon } from '@utils';

const shorts: { [key: string]: string } = {
  Australia: 'au',
  Germany: 'de',
  France: 'fr',
  'United Kingdom': 'gb',
  Japan: 'jp',
  Netherlands: 'nl',
  Singapore: 'sg',
  'United States': 'us'
};

// const flags: { [key: string]: React.ReactElement<any> } = {
//   us: <Image style={{ height: 50, width: 100 }} resizeMode="contain" source={require('../assets/countrys/us.png')} />,
//   nl: <Image style={{ height: 50, width: 100 }} resizeMode="contain" source={require('../assets/countrys/nl.png')} />,
//   gb: <Image style={{ height: 50, width: 100 }} resizeMode="contain" source={require('../assets/countrys/gb.png')} />,
//   de: <Image style={{ height: 50, width: 100 }} resizeMode="contain" source={require('../assets/countrys/de.png')} />,
//   au: <Image style={{ height: 50, width: 100 }} resizeMode="contain" source={require('../assets/countrys/au.png')} />,
//   fr: <Image style={{ height: 50, width: 100 }} resizeMode="contain" source={require('../assets/countrys/fr.png')} />,
//   jp: <Image style={{ height: 50, width: 100 }} resizeMode="contain" source={require('../assets/countrys/jp.png')} />,
//   sg: <Image style={{ height: 50, width: 100 }} resizeMode="contain" source={require('../assets/countrys/sg.png')} />,
//   ca: <Image style={{ height: 50, width: 100 }} resizeMode="contain" source={require('../assets/countrys/sg.png')} />
// };

interface CountryProps {
  value: string;
  map?: boolean;
  flag?: boolean;
  size?: number;
  fill?: string;
}

const mappings: { [key: string]: string } = { gb: 'uk' };

export default class Country extends React.Component<CountryProps> {
  static defaultProps = {
    map: false,
    flag: true,
    size: 50
  };
  render() {
    const { size = 0, fill, value } = this.props;
    return this.props.map ? (
      <IcoMoon name={mappings[value] || value} size={size} color={fill} />
    ) : (
      <Image
        style={{ height: size, width: size / 2 }}
        resizeMode="contain"
        source={{ uri: `https://api.vpsny.app/flags/${value}.png`, cache: 'force-cache' }}
      />
    );
  }
}
