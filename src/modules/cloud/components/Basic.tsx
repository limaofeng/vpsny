import { Icon, Item, ItemBody, Label, List, Note, Theme } from '@components';
import React, { Component } from 'react';
import { View } from 'react-native';

import { Instance } from '../Provider';

interface BasicProps {
  theme: Theme;
  data: Instance;
}

export default class Basic extends Component<BasicProps> {
  render() {
    const { colors, fonts } = this.props.theme;
    const { data } = this.props;
    const swap = data.swap ? (
      <Item size={20} bodyStyle={{ paddingVertical: 0, paddingLeft: 6, paddingRight: 15, borderBottomWidth: 0 }}>
        <Icon type="MaterialCommunityIcons" color={colors.minor} name="swap-horizontal-variant" size={14} />
        <Note style={fonts.subhead}>
          {data.swap.size.toFixed(0)} MB
        </Note>
        <Label style={[fonts.subhead, { textAlign: 'right' }]}>SWAP</Label>
      </Item>
    ) : (
      undefined
    );
    return (
      <>
        <List>
          <Item size={80}>
            <ItemBody style={{ paddingLeft: 0, paddingRight: 0 }}>
              <View style={{ flex: 1, flexDirection: 'column' }}>
                <List itemStyle={{ paddingLeft: 0 }} style={{ marginBottom: 0, backgroundColor: 'transparent' }}>
                  <Item
                    size={20}
                    bodyStyle={{ paddingVertical: 0, paddingLeft: 6, paddingRight: 15, borderBottomWidth: 0 }}
                  >
                    <Icon color={colors.minor} name="ubuntu" size={12} />
                    <Note style={fonts.subhead}>{data.os}</Note>
                    <Label style={[fonts.subhead, { textAlign: 'right' }]}>OS</Label>
                  </Item>
                  <Item
                    size={20}
                    bodyStyle={{ paddingVertical: 0, paddingLeft: 6, paddingRight: 15, borderBottomWidth: 0 }}
                  >
                    <Icon type="FontAwesome5" color={colors.minor} name="map-marked-alt" size={12} />
                    <Note style={fonts.subhead}>{data.location.title}</Note>
                    <Label style={[fonts.subhead, { textAlign: 'right'}]}>Location</Label>
                  </Item>
                  <Item
                    size={20}
                    bodyStyle={{ paddingVertical: 0, paddingLeft: 6, paddingRight: 15, borderBottomWidth: 0 }}
                  >
                    <Icon type="MaterialIcons" color={colors.minor} name="location-on" size={14} />
                    <Note style={fonts.subhead}>{data.publicIP}</Note>
                    <Label style={[fonts.subhead, { textAlign: 'right'}]}>IP Address</Label>
                  </Item>
                </List>
              </View>
            </ItemBody>
          </Item>
        </List>
        <List>
          <Item size={80 + (swap ? 20 : 0)}>
            <ItemBody style={{ paddingLeft: 0, paddingRight: 0 }}>
              <View style={{ flex: 1, flexDirection: 'column' }}>
                <List itemStyle={{ paddingLeft: 0 }} style={{ marginBottom: 0, backgroundColor: 'transparent' }}>
                  <Item
                    size={20}
                    bodyStyle={{ paddingVertical: 0, paddingLeft: 6, paddingRight: 15, borderBottomWidth: 0 }}
                  >
                    <Icon type="Feather" color={colors.minor} name="cpu" size={12} />
                    <Note style={fonts.subhead}>
                      {data.vcpu} vCPU
                      {data.vcpu > 1 && 's'}
                    </Note>
                    <Label style={[fonts.subhead, { textAlign: 'right' }]}>CPU</Label>
                  </Item>
                  <Item
                    size={20}
                    bodyStyle={{ paddingVertical: 0, paddingLeft: 6, paddingRight: 15, borderBottomWidth: 0 }}
                  >
                    <Icon type="FontAwesome5" color={colors.minor} name="microchip" size={12} />
                    <Note style={fonts.subhead}>
                      {data.ram.size} MB
                    </Note>
                    <Label style={[fonts.subhead, { textAlign: 'right' }]}>RAM</Label>
                  </Item>
                  {swap}
                  <Item
                    size={20}
                    bodyStyle={{ paddingVertical: 0, paddingLeft: 6, paddingRight: 15, borderBottomWidth: 0 }}
                  >
                    <Icon type="MaterialCommunityIcons" color={colors.minor} name="harddisk" size={14} />
                    <Note style={fonts.subhead}>
                      {data.disk.size} GB
                    </Note>
                    <Label style={[fonts.subhead, { textAlign: 'right' }]}>{data.disk.type}</Label>
                  </Item>
                </List>
              </View>
            </ItemBody>
          </Item>
        </List>
      </>
    );
  }
}
