import { Icon, Item, ItemBody, Label, List, Note, Theme, ItemStart } from '@components';
import React, { Component } from 'react';
import { View } from 'react-native';

import { Instance } from '../Provider';

interface BandwidthProps {
  theme: Theme;
  data: Instance;
}

export default class Bandwidth extends Component<BandwidthProps> {
  render() {
    const { colors, fonts } = this.props.theme;
    const { data } = this.props;
    return (
      <List>
        <Item
          onClick={() => {
            this.setState({ visible: true });
          }}
          style={{ paddingLeft: 15, paddingRight: 0 }}
          size={data.bandwidth.resets ? 50 : 'normal'}
        >
          <ItemStart style={{ width: 20 }}>
            <Icon type="FontAwesome5" color={colors.minor} name="exchange-alt" size={12} />
          </ItemStart>
          <ItemBody style={{ paddingLeft: 6, paddingRight: 15 }}>
            {data.bandwidth.resets ? (
              <View style={{ flex: 1, flexDirection: 'column' }}>
                <Note>
                  {data.bandwidth.current.toFixed(2)} GB of {data.bandwidth.allowed} GB
                </Note>
                <Label style={[{ width: '100%', marginTop: 2 }, fonts.subhead]}>Resets: {data.bandwidth.resets}</Label>
              </View>
            ) : (
              <Note style={{ flex: 1 }}>
                {data.bandwidth.current.toFixed(2)} GB of {data.bandwidth.allowed} GB
              </Note>
            )}
            <Label style={[fonts.subhead, { textAlign: 'right' }]}>Bandwidth</Label>
          </ItemBody>
        </Item>
      </List>
    );
  }
}
