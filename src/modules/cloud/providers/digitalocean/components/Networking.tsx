import { Icon, Item, ItemBody, Label, List, Note, Theme, ItemStart } from '@components';
import React, { Component } from 'react';
import { View } from 'react-native';
import { Instance } from '@modules/cloud/type';

interface NetworkingProps {
  theme: Theme;
  data: Instance;
}

export default class Networking extends Component<NetworkingProps> {
  render() {
    const { colors, fonts } = this.props.theme;
    const { data } = this.props;
    return (
      <List>
        <Item push>
          <Note>Networking</Note>
        </Item>
        <Item size={60}>
          <ItemBody style={{ paddingLeft: 0, borderBottomWidth: 0 }}>
            <View style={{ flex: 1, flexDirection: 'column' }}>
              <List itemStyle={{ paddingLeft: 0 }} style={{ marginBottom: 0, backgroundColor: 'transparent' }}>
                <Item
                  size={20}
                  bodyStyle={{ paddingVertical: 0, paddingLeft: 6, paddingRight: 15, borderBottomWidth: 0 }}
                >
                  <Icon type="MaterialIcons" color={colors.minor} name="public" size={14} />
                  <Note style={fonts.subhead}>{data.networking!.publicIpAddress}</Note>
                  <Label style={[fonts.subhead, { textAlign: 'right', marginRight: 15 }]}>
                    {data.networking!.isStaticIp ? 'Static IP' : '??'}
                  </Label>
                </Item>
                <Item
                  size={20}
                  bodyStyle={{ paddingVertical: 0, paddingLeft: 6, paddingRight: 15, borderBottomWidth: 0 }}
                >
                  <Icon type="MaterialIcons" color={colors.minor} name="location-on" size={14} />
                  <Note style={fonts.subhead}>{data.networking!.privateIpAddress}</Note>
                  <Label style={[fonts.subhead, { textAlign: 'right', marginRight: 15 }]}>Private IP</Label>
                </Item>
              </List>
            </View>
          </ItemBody>
        </Item>
      </List>
    );
  }
}
