import { Item, ItemBody, List, Theme } from '@components';
import Donut from '@modules/home/components/Donut';
import { format, sleep } from '@utils';
import React, { Component } from 'react';
import { View } from 'react-native';

import { Instance } from '../Provider';

interface RAMUsageProps {
  theme: Theme;
  data: Instance;
}

interface RAMUsageState {
  ram: number;
  swap: number;
  disk: number;
  net: number;
}

export default class RAMUsage extends Component<RAMUsageProps, RAMUsageState> {
  state = { ram: 0, swap: 0, disk: 0, net: 0 };
  async componentDidMount() {
    const { data } = this.props;
    await sleep(300);
    this.setState({
      ram: data.ram.use! / data.ram.size,
      swap: data.swap!.use / data.swap!.size,
      disk: data.disk.use! / data.disk.size,
      net: data.bandwidth.current / data.bandwidth.allowed
    });
  }
  render() {
    const { data } = this.props;
    const { ram, swap, disk, net } = this.state;
    return (
      <List>
        <Item size={110} style={{ paddingRight: 8, paddingLeft: 8 }}>
          <ItemBody style={{ paddingRight: 0 }}>
            <View style={{ flex: 1, flexDirection: 'row' }}>
              <Donut
                value={ram}
                title="RAM"
                summary={format.fileSize(data.ram.use!, 'MB', { precision: 1, mode: 'short' }).toString()}
              />
              <Donut
                value={swap}
                title="SWAP"
                summary={format.fileSize(data.swap!.use, 'MB', { precision: 1, mode: 'short' }).toString()}
              />
              <Donut
                value={disk}
                title="Disk"
                summary={format.fileSize(data.disk.use!, 'GB', { precision: 1, mode: 'short' }).toString()}
              />
              <Donut
                value={net}
                title="Bandwidth"
                summary={format.fileSize(data.bandwidth.current!, 'GB', { precision: 1, mode: 'short' }).toString()}
              />
            </View>
          </ItemBody>
        </Item>
      </List>
    );
  }
}
