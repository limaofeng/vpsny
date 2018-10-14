import React from 'react';
import { StyleSheet, View } from 'react-native';
import Modal from 'react-native-modal';
import { Defs, LinearGradient, Stop } from 'react-native-svg';
import { Grid, LineChart, XAxis, YAxis } from 'react-native-svg-charts';
import { Icon, Item, ItemBody, ItemStart, Label, List, Note } from '../../../components';
import Theme, { withTheme } from '../../../components/Theme';
import { Instance } from '../../cloud/type';
import { format } from '../../../utils';

interface OverviewProps {
  tabLabel: string;
  data: Instance;
  theme?: Theme;
}

class Overview extends React.Component<OverviewProps> {
  state = {
    visible: false
  };
  render() {
    const { colors, fonts } = this.props.theme as Theme;
    const { data } = this.props;

    const chartData = [50, 10, 40, 95, -4, -24, 85, 91, 35, 53, -53, 24, 50, -20, -80];

    const axesSvg = { fontSize: 10, fill: 'grey' };
    const verticalContentInset = { top: 10, bottom: 10 };
    const xAxisHeight = 30;

    // const data = [50, 10, 40, 95, -4, -24, 85, 91, 35, 53, -53, 24, 50, -20, -80];

    const Gradient = () => (
      <Defs key={'gradient'}>
        <LinearGradient id={'gradient'} x1={'0'} y={'0%'} x2={'100%'} y2={'0%'}>
          <Stop offset={'0%'} stopColor={'rgb(134, 65, 244)'} />
          <Stop offset={'100%'} stopColor={'rgb(66, 194, 244)'} />
        </LinearGradient>
      </Defs>
    );
    const systemDisk = (data.disks || []).find(disk => disk.isSystemDisk);
    // onScroll={this.props.onScroll}
    return (
      <>
        <Modal
          style={styles.layout}
          onBackdropPress={() => {
            this.setState({ visible: false });
          }}
          backdropOpacity={0.2}
          isVisible={false}
        >
          <View style={[styles.container, { backgroundColor: colors.backgroundColorDeeper }]}>
            <List>
              <Item size={200}>
                <View style={{ height: 200, width: 300, padding: 20, flexDirection: 'row' }}>
                  <YAxis
                    data={chartData}
                    style={{ marginBottom: xAxisHeight }}
                    contentInset={verticalContentInset}
                    svg={axesSvg}
                  />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <LineChart
                      style={{ height: 150 }}
                      animate
                      data={[50, 10, 40, 95, -4, -24, 85, 91, 35, 53, -53, 24, 50, -20, -80]}
                      contentInset={{ top: 20, bottom: 20 }}
                      // curve={ shape.curveNatural }
                      svg={{
                        strokeWidth: 2,
                        stroke: 'url(#gradient)'
                      }}
                    >
                      <Grid />
                      <Gradient />
                    </LineChart>
                    <XAxis
                      style={{ marginHorizontal: -10, height: xAxisHeight }}
                      data={chartData}
                      formatLabel={(value, index) => index}
                      contentInset={{ left: 10, right: 10 }}
                      svg={axesSvg}
                    />
                  </View>
                </View>
              </Item>
            </List>
          </View>
        </Modal>
        <List style={{ marginTop: 10 }}>
          <Item size={80}>
            <ItemBody style={{ paddingLeft: 0 }}>
              <View style={{ flex: 1, flexDirection: 'column' }}>
                <List itemStyle={{ paddingLeft: 0 }} style={{ marginBottom: 0, backgroundColor: 'transparent' }}>
                  <Item
                    size={20}
                    bodyStyle={{ paddingVertical: 0, paddingLeft: 6, paddingRight: 15, borderBottomWidth: 0 }}
                  >
                    <Icon color={colors.minor} name="ubuntu" size={12} />
                    <Note style={fonts.subhead}>{data.os}</Note>
                    <Label style={[fonts.subhead, { textAlign: 'right', marginRight: 15 }]}>OS</Label>
                  </Item>
                  <Item
                    size={20}
                    bodyStyle={{ paddingVertical: 0, paddingLeft: 6, paddingRight: 15, borderBottomWidth: 0 }}
                  >
                    <Icon type="FontAwesome5" color={colors.minor} name="map-marked-alt" size={12} />
                    <Note style={fonts.subhead}>{data.location.title}</Note>
                    <Label style={[fonts.subhead, { textAlign: 'right', marginRight: 15 }]}>Location</Label>
                  </Item>
                  <Item
                    size={20}
                    bodyStyle={{ paddingVertical: 0, paddingLeft: 6, paddingRight: 15, borderBottomWidth: 0 }}
                  >
                    <Icon type="MaterialIcons" color={colors.minor} name="location-on" size={14} />
                    <Note style={fonts.subhead}>{data.hostname}</Note>
                    <Label style={[fonts.subhead, { textAlign: 'right', marginRight: 15 }]}>IP Address</Label>
                  </Item>
                </List>
              </View>
            </ItemBody>
          </Item>
        </List>

        <List visible={data.provider === 'vultr'}>
          <Item
            onClick={() => {
              this.setState({ visible: true });
            }}
            style={{ paddingLeft: 15, paddingRight: 15 }}
            bodyStyle={{ paddingLeft: 6 }}
          >
            <ItemStart style={{ width: 20 }}>
              <Icon type="FontAwesome" color={colors.minor} name="credit-card-alt" size={12} />
            </ItemStart>
            <ItemBody style={{ paddingLeft: 6 }}>
              <Note style={{ flex: 1 }}>
                ${data.pendingCharges.toFixed(2)} of ${data.costPerMonth.toFixed(2)} per month
              </Note>
              <Label style={[fonts.subhead, { textAlign: 'right', marginRight: 15 }]}>Charges</Label>
            </ItemBody>
          </Item>
        </List>

        <List>
          <Item size={80}>
            <ItemBody style={{ paddingLeft: 0 }}>
              <View style={{ flex: 1, flexDirection: 'column' }}>
                <List itemStyle={{ paddingLeft: 0 }} style={{ marginBottom: 0, backgroundColor: 'transparent' }}>
                  <Item
                    size={20}
                    bodyStyle={{ paddingVertical: 0, paddingLeft: 6, paddingRight: 15, borderBottomWidth: 0 }}
                  >
                    <Icon type="Feather" color={colors.minor} name="cpu" size={12} />
                    <Note style={fonts.subhead}>
                      {data.vcpu} vCPU {data.vcpu > 1 && 's'}
                    </Note>
                    <Label style={[fonts.subhead, { textAlign: 'right', marginRight: 15 }]}>CPU</Label>
                  </Item>
                  <Item
                    size={20}
                    bodyStyle={{ paddingVertical: 0, paddingLeft: 6, paddingRight: 15, borderBottomWidth: 0 }}
                  >
                    <Icon type="FontAwesome5" color={colors.minor} name="microchip" size={12} />
                    <Note style={fonts.subhead}>{data.ram}</Note>
                    <Label style={[fonts.subhead, { textAlign: 'right', marginRight: 15 }]}>RAM</Label>
                  </Item>
                  <Item
                    size={20}
                    bodyStyle={{ paddingVertical: 0, paddingLeft: 6, paddingRight: 15, borderBottomWidth: 0 }}
                  >
                    <Icon type="MaterialCommunityIcons" color={colors.minor} name="harddisk" size={14} />
                    <Note style={fonts.subhead}>{data.disk}</Note>
                    <Label style={[fonts.subhead, { textAlign: 'right', marginRight: 15 }]}>SSD</Label>
                  </Item>
                </List>
              </View>
            </ItemBody>
          </Item>
        </List>

        {data.provider === 'lightsail' && (
          <List>
            <Item push>
              <Note>Storage</Note>
            </Item>
            <Item size={90}>
              <ItemStart style={{ width: 70 }}>
                <Icon type="MaterialCommunityIcons" color={colors.minor} name="harddisk" size={50} />
              </ItemStart>
              <ItemBody style={{ paddingLeft: 0, borderBottomWidth: 0 }}>
                <View style={{ flex: 1, flexDirection: 'column' }}>
                  <List itemStyle={{ paddingLeft: 0 }} style={{ marginBottom: 0, backgroundColor: 'transparent' }}>
                    <Item
                      size={30}
                      bodyStyle={{ paddingVertical: 0, paddingLeft: 6, paddingRight: 15, borderBottomWidth: 0 }}
                    >
                      <Note style={fonts.callout}>System Disk</Note>
                    </Item>
                    <Item
                      size={20}
                      bodyStyle={{ paddingVertical: 0, paddingLeft: 6, paddingRight: 15, borderBottomWidth: 0 }}
                    >
                      <Note style={[fonts.subhead, { paddingRight: 0, fontWeight: 'bold' }]}>
                        {format.fileSize(systemDisk!.size, 'GB')}
                      </Note>
                      <Label style={[fonts.subhead, { marginRight: 0 }]}>, block storage disk</Label>
                      {/*<Label style={[fonts.subhead]}>, {systemDisk!.iops} IOPS</Label>*/}
                    </Item>
                    <Item
                      size={20}
                      bodyStyle={{ paddingVertical: 0, paddingLeft: 6, paddingRight: 15, borderBottomWidth: 0 }}
                    >
                      <Label style={[fonts.subhead, { width: 'auto', marginRight: 0 }]}>Disk path:</Label>
                      <Note style={[fonts.subhead, { fontWeight: 'bold' }]}> {systemDisk!.path}</Note>
                    </Item>
                  </List>
                </View>
              </ItemBody>
            </Item>
          </List>
        )}

        {data.provider === 'lightsail' && (
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
        )}

        <List visible={data.provider === 'vultr'}>
          <Item
            onClick={() => {
              this.setState({ visible: true });
            }}
            style={{ paddingLeft: 15, paddingRight: 15 }}
            bodyStyle={{ paddingLeft: 6 }}
          >
            <ItemStart style={{ width: 20 }}>
              <Icon type="FontAwesome5" color={colors.minor} name="exchange-alt" size={12} />
            </ItemStart>
            <ItemBody style={{ paddingLeft: 6 }}>
              <Note style={{ flex: 1 }}>
                {data.bandwidth.current.toFixed(2)} GB of {data.bandwidth.allowed.toFixed(2)} GB
              </Note>
              <Label style={[fonts.subhead, { textAlign: 'right', marginRight: 15 }]}>Bandwidth</Label>
            </ItemBody>
          </Item>
        </List>

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
                      <Label style={[fonts.subhead, { textAlign: 'right', marginRight: 15 }]}>Address</Label>
                    </Item>
                    <Item
                      size={20}
                      bodyStyle={{ paddingVertical: 0, paddingLeft: 6, paddingRight: 15, borderBottomWidth: 0 }}
                    >
                      <Icon type="MaterialCommunityIcons" color={colors.minor} name="transition-masked" size={14} />
                      <Note style={fonts.subhead}>{data.IPv4.netmask}</Note>
                      <Label style={[fonts.subhead, { textAlign: 'right', marginRight: 15 }]}>Netmask</Label>
                    </Item>
                    <Item
                      size={20}
                      bodyStyle={{ paddingVertical: 0, paddingLeft: 6, paddingRight: 15, borderBottomWidth: 0 }}
                    >
                      <Icon type="MaterialCommunityIcons" color={colors.minor} name="wall" size={14} />
                      <Note style={fonts.subhead}>{data.IPv4.gateway}</Note>
                      <Label style={[fonts.subhead, { textAlign: 'right', marginRight: 15 }]}>Gateway</Label>
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
                      <Label style={[fonts.subhead, { textAlign: 'right', marginRight: 15 }]}>Address</Label>
                    </Item>
                    <Item
                      size={20}
                      bodyStyle={{ paddingVertical: 0, paddingLeft: 6, paddingRight: 15, borderBottomWidth: 0 }}
                    >
                      <Icon type="MaterialCommunityIcons" color={colors.minor} name="transition-masked" size={14} />
                      <Note style={fonts.subhead}>{data.IPv6.networkSize}</Note>
                      <Label style={[fonts.subhead, { textAlign: 'right', marginRight: 15 }]}>Netmask</Label>
                    </Item>
                    <Item
                      size={20}
                      bodyStyle={{ paddingVertical: 0, paddingLeft: 6, paddingRight: 15, borderBottomWidth: 0 }}
                    >
                      <Icon type="MaterialCommunityIcons" color={colors.minor} name="access-point-network" size={14} />
                      <Note style={fonts.subhead}>{data.IPv6.network}</Note>
                      <Label style={[fonts.subhead, { textAlign: 'right', marginRight: 15 }]}>Network</Label>
                    </Item>
                  </List>
                </View>
              </ItemBody>
            </Item>
          </List>
        )}

        <List visible={data.provider === 'lightsail'}>
          <Item push>
            <Note>Firewall</Note>
          </Item>
        </List>

        <List>
          <Item push>
            <Note>Snapshot</Note>
          </Item>
        </List>

        <List visible={data.provider === 'lightsail'}>
          <Item push>
            <Note>History</Note>
          </Item>
        </List>

        <List visible={data.provider === 'vultr'}>
          <Item push>
            <Note>Backups</Note>
          </Item>
        </List>
        <List visible={data.provider === 'vultr'}>
          <Item push>
            <Note>DDOS</Note>
          </Item>
        </List>
      </>
    );
  }
}

const styles = StyleSheet.create({
  layout: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: 80
  },
  container: {
    width: 320,
    borderRadius: 10,
    padding: 10
  }
});

export default withTheme(Overview);
