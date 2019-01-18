import { Icon, Item, ItemBody, Label, List, Note, Theme } from '@components';
import { Instance } from '@modules/cloud/type';
import React, { Component } from 'react';
import { View } from 'react-native';

interface NetworkingProps {
  theme: Theme;
  data: Instance;
}

export default class Networking extends Component<NetworkingProps> {
  formatIPv6(ipv6: string) {
    return ipv6
      .split(':')
      .map(section => section.replace(/^[0]+/g, ''))
      .join(':')
      .replace(/[:]{2,}/g, '::');
  }

  render() {
    const { colors, fonts } = this.props.theme;
    const { data } = this.props;
    const publicNetwork = data.networks!.IPv4!.find(ip => ip.type === 'public')!;
    const privateNetwork = data.networks!.IPv4!.find(ip => ip.type === 'private');
    const publicIPv6Network = data.networks!.IPv6!.find(ip => ip.type === 'public')!;
    return (
      <>
        <List>
          <Item push>
            <Note>Public network</Note>
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
                    <Note style={fonts.subhead}>{publicNetwork.ip}</Note>
                    <Label style={[fonts.subhead, { textAlign: 'right' }]}>IP ADDRESS</Label>
                  </Item>
                  <Item
                    size={20}
                    bodyStyle={{ paddingVertical: 0, paddingLeft: 6, paddingRight: 15, borderBottomWidth: 0 }}
                  >
                    <Icon type="MaterialCommunityIcons" color={colors.minor} name="wall" size={14} />
                    <Note style={fonts.subhead}>{publicNetwork.gateway}</Note>
                    <Label style={[fonts.subhead, { textAlign: 'right' }]}>GATEWAY</Label>
                  </Item>
                  <Item
                    size={20}
                    bodyStyle={{ paddingVertical: 0, paddingLeft: 6, paddingRight: 15, borderBottomWidth: 0 }}
                  >
                    <Icon type="MaterialCommunityIcons" color={colors.minor} name="transition-masked" size={14} />
                    <Note style={fonts.subhead}>{publicNetwork.netmask}</Note>
                    <Label style={[fonts.subhead, { textAlign: 'right' }]}>NETMASK</Label>
                  </Item>
                </List>
              </View>
            </ItemBody>
          </Item>
        </List>
        {privateNetwork && (
          <List>
            <Item push>
              <Note>Private network</Note>
            </Item>
            <Item size={60}>
              <ItemBody style={{ paddingLeft: 0, borderBottomWidth: 0 }}>
                <View style={{ flex: 1, flexDirection: 'column' }}>
                  <List itemStyle={{ paddingLeft: 0 }} style={{ marginBottom: 0, backgroundColor: 'transparent' }}>
                    <Item
                      size={20}
                      bodyStyle={{ paddingVertical: 0, paddingLeft: 6, paddingRight: 15, borderBottomWidth: 0 }}
                    >
                      <Icon type="MaterialIcons" color={colors.minor} name="location-on" size={14} />
                      <Note style={fonts.subhead}>{privateNetwork.ip}</Note>
                      <Label style={[fonts.subhead, { textAlign: 'right' }]}>PRIVATE IP</Label>
                    </Item>
                    <Item
                      size={20}
                      bodyStyle={{ paddingVertical: 0, paddingLeft: 6, paddingRight: 15, borderBottomWidth: 0 }}
                    >
                      <Icon type="MaterialCommunityIcons" color={colors.minor} name="transition-masked" size={14} />
                      <Note style={fonts.subhead}>{privateNetwork.netmask}</Note>
                      <Label style={[fonts.subhead, { textAlign: 'right' }]}>NETMASK</Label>
                    </Item>
                  </List>
                </View>
              </ItemBody>
            </Item>
          </List>
        )}
        <List>
          <Item>
            <Note>Public IPv6 network</Note>
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
                    <Note style={fonts.subhead}>{this.formatIPv6(publicIPv6Network.ip)}</Note>
                    <Label style={[fonts.subhead, { textAlign: 'right' }]}>IPV6 ADDRESS</Label>
                  </Item>
                  <Item
                    size={20}
                    bodyStyle={{ paddingVertical: 0, paddingLeft: 6, paddingRight: 15, borderBottomWidth: 0 }}
                  >
                    <Icon type="MaterialCommunityIcons" color={colors.minor} name="transition-masked" size={14} />
                    <Note style={fonts.subhead}>{this.formatIPv6(publicIPv6Network.gateway)}</Note>
                    <Label style={[fonts.subhead, { textAlign: 'right' }]}>IPV6 GATEWAY</Label>
                  </Item>
                  <Item
                    size={20}
                    bodyStyle={{ paddingVertical: 0, paddingLeft: 6, paddingRight: 15, borderBottomWidth: 0 }}
                  >
                    <Icon type="MaterialCommunityIcons" color={colors.minor} name="access-point-network" size={14} />
                    <Note style={fonts.subhead}>{publicIPv6Network.netmask}</Note>
                    <Label style={[fonts.subhead, { textAlign: 'right' }]}>NETMASK</Label>
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
