import * as React from 'react';
import SvgUri, { SvgUriProps } from '../utils/react-native-svg-uri';

export default class Svg extends React.Component<SvgUriProps> {
  render() {
    return <SvgUri {...this.props} />;
  }
}
