import { Icon, Item, ItemBody, Label, List, Note, Theme } from '@components';
import { Instance } from '@modules/cloud/type';
import React, { Component } from 'react';
import { View } from 'react-native';

interface NetworkProps {
  theme: Theme;
  data: Instance;
}

export default class Network extends Component<NetworkProps> {
  render() {
    const { colors, fonts } = this.props.theme;
    const { data } = this.props;
    return (
      <>
        {data.IPv4 && (
          <List>
            <Item push>
              <Note>Public IPv4 Network</Note>
            </Item>
            <Item size={80}>
              <ItemBody style={{ paddingLeft: 0, borderBottomWidth: 0 }}>
                <View style={{ flex: 1, flexDirection: 'column' }}>
                  <List itemStyle={{ paddingLeft: 0 }} style={{ marginBottom: 0, backgroundColor: 'transparent' }}>
                    <Item
                      size={20}
                      bodyStyle={{ paddingVertical: 0, paddingLeft: 6, paddingRight: 15, borderBottomWidth: 0 }}
                    >
                      <Icon type="MaterialIcons" color={colors.minor} name="location-on" size={14} />
                      <Note style={fonts.subhead}>{data.IPv4.ip}</Note>
                      <Label style={[fonts.subhead, { textAlign: 'right' }]}>Address</Label>
                    </Item>
                    <Item
                      size={20}
                      bodyStyle={{ paddingVertical: 0, paddingLeft: 6, paddingRight: 15, borderBottomWidth: 0 }}
                    >
                      <Icon type="MaterialCommunityIcons" color={colors.minor} name="transition-masked" size={14} />
                      <Note style={fonts.subhead}>{data.IPv4.netmask}</Note>
                      <Label style={[fonts.subhead, { textAlign: 'right' }]}>Netmask</Label>
                    </Item>
                    <Item
                      size={20}
                      bodyStyle={{ paddingVertical: 0, paddingLeft: 6, paddingRight: 15, borderBottomWidth: 0 }}
                    >
                      <Icon type="MaterialCommunityIcons" color={colors.minor} name="wall" size={14} />
                      <Note style={fonts.subhead}>{data.IPv4.gateway}</Note>
                      <Label style={[fonts.subhead, { textAlign: 'right' }]}>Gateway</Label>
                    </Item>
                  </List>
                </View>
              </ItemBody>
            </Item>
          </List>
        )}

        {data.IPv6 && (
          <List>
            <Item>
              <Note>Public IPv6 Network</Note>
            </Item>
            <Item size={80}>
              <ItemBody style={{ paddingLeft: 0 }}>
                <View style={{ flex: 1, flexDirection: 'column' }}>
                  <List itemStyle={{ paddingLeft: 0 }} style={{ marginBottom: 0, backgroundColor: 'transparent' }}>
                    <Item
                      size={20}
                      bodyStyle={{ paddingVertical: 0, paddingLeft: 6, paddingRight: 15, borderBottomWidth: 0 }}
                    >
                      <Icon type="MaterialIcons" color={colors.minor} name="location-on" size={14} />
                      <Note style={fonts.subhead}>{data.IPv6.ip}</Note>
                      <Label style={[fonts.subhead, { textAlign: 'right' }]}>Address</Label>
                    </Item>
                    <Item
                      size={20}
                      bodyStyle={{ paddingVertical: 0, paddingLeft: 6, paddingRight: 15, borderBottomWidth: 0 }}
                    >
                      <Icon type="MaterialCommunityIcons" color={colors.minor} name="transition-masked" size={14} />
                      <Note style={fonts.subhead}>{data.IPv6.networkSize}</Note>
                      <Label style={[fonts.subhead, { textAlign: 'right' }]}>Netmask</Label>
                    </Item>
                    <Item
                      size={20}
                      bodyStyle={{ paddingVertical: 0, paddingLeft: 6, paddingRight: 15, borderBottomWidth: 0 }}
                    >
                      <Icon type="MaterialCommunityIcons" color={colors.minor} name="access-point-network" size={14} />
                      <Note style={fonts.subhead}>{data.IPv6.network}</Note>
                      <Label style={[fonts.subhead, { textAlign: 'right' }]}>Network</Label>
                    </Item>
                  </List>
                </View>
              </ItemBody>
            </Item>
          </List>
        )}
      </>
    );
  }
}
