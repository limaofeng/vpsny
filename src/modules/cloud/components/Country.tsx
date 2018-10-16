import { Svg } from '@components';
import React from 'react';
import { Image } from 'react-native';

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

const flags: { [key: string]: React.ReactElement<any> } = {
  us: <Image style={{ height: 50, width: 100 }} resizeMode="contain" source={require('../assets/countrys/us.png')} />,
  nl: <Image style={{ height: 50, width: 100 }} resizeMode="contain" source={require('../assets/countrys/nl.png')} />,
  gb: <Image style={{ height: 50, width: 100 }} resizeMode="contain" source={require('../assets/countrys/gb.png')} />,
  de: <Image style={{ height: 50, width: 100 }} resizeMode="contain" source={require('../assets/countrys/de.png')} />,
  au: <Image style={{ height: 50, width: 100 }} resizeMode="contain" source={require('../assets/countrys/au.png')} />,
  fr: <Image style={{ height: 50, width: 100 }} resizeMode="contain" source={require('../assets/countrys/fr.png')} />,
  jp: <Image style={{ height: 50, width: 100 }} resizeMode="contain" source={require('../assets/countrys/jp.png')} />,
  sg: <Image style={{ height: 50, width: 100 }} resizeMode="contain" source={require('../assets/countrys/sg.png')} />
};

const maps: { [key: string]: React.ReactElement<any> } = {
  us: <Svg height={50} source={require('../assets/maps/us.svg')} fill="#8D9397" />,
  nl: <Svg height={50} source={require('../assets/maps/nl.svg')} fill="#8D9397" />,
  gb: <Svg height={50} source={require('../assets/maps/gb.svg')} fill="#8D9397" />,
  de: <Svg height={50} source={require('../assets/maps/de.svg')} fill="#8D9397" />,
  au: <Svg height={50} source={require('../assets/maps/au.svg')} fill="#8D9397" />,
  fr: <Svg height={50} source={require('../assets/maps/fr.svg')} fill="#8D9397" />,
  jp: <Svg height={50} source={require('../assets/maps/jp.svg')} fill="#8D9397" />,
  sg: <Svg height={50} source={require('../assets/maps/sg.svg')} fill="#8D9397" />
};

interface CountryProps {
  value: string;
  map?: boolean;
  flag?: boolean;
  size?: number;
  fill?: string;
}

export default class Country extends React.Component<CountryProps> {
  static defaultProps = {
    map: false,
    flag: true,
    size: 50
  };
  render() {
    const { size = 0, fill } = this.props;
    return this.props.map
      ? React.cloneElement(maps[shorts[this.props.value]], {
          height: size,
          width: size * 2,
          fill
        })
      : React.cloneElement(flags[shorts[this.props.value]], {
          style: {
            height: size,
            width: size * 2
          }
        });
  }
}
