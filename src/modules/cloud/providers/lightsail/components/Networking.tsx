import { Icon, Item, ItemBody, Label, List, Note, Theme, ItemStart } from '@components';
import React, { Component } from 'react';
import { View } from 'react-native';
import { Instance, FirewallPortRule } from '@modules/cloud/type';

interface NetworkingProps {
  theme: Theme;
  data: Instance;
}

function getApplication(rule: FirewallPortRule) {
  switch (rule.fromPort) {
    case 22:
      return 'SSH';
    case 80:
      return 'HTTP';
    case 443:
      return 'HTTPS';
    default:
      return 'Custom';
  }
}

export default class Networking extends Component<NetworkingProps> {
  render() {
    const { colors, fonts } = this.props.theme;
    const { data } = this.props;
    return (
      <>
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
                      {data.networking!.isStaticIp ? 'Static IP' : 'Dynamic IP'}
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

        <List>
          <Item push>
            <Note>Firewall</Note>
          </Item>
          <Item size="auto">
            <ItemBody style={{ paddingLeft: 0, borderBottomWidth: 0 }}>
              <View style={{ flex: 1, flexDirection: 'column' }}>
                <List itemStyle={{ paddingLeft: 0 }} style={{ marginBottom: 0, backgroundColor: 'transparent' }}>
                  {data.networking!.firewall.map(rule => (
                    <Item
                      size={20}
                      bodyStyle={{ paddingVertical: 0, paddingLeft: 6, paddingRight: 15, borderBottomWidth: 0 }}
                    >
                      <Label style={[fonts.subhead, { textAlign: 'left', marginRight: 15, color: colors.major }]}>
                        {getApplication(rule)}
                      </Label>
                      <Note style={[fonts.subhead, { flex: 1, textAlign: 'center' }]}>{rule.protocol.toUpperCase()}</Note>
                      <Note style={[fonts.subhead, { textAlign: 'right' }]}>{rule.fromPort}</Note>
                    </Item>
                  ))}
                </List>
              </View>
            </ItemBody>
          </Item>
        </List>
      </>
    );
  }
}
