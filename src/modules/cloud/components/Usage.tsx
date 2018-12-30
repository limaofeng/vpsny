import { Item, ItemBody, List, Theme } from '@components';
import Donut from '@modules/home/components/Donut';
import { format } from '@utils';
import React, { Component } from 'react';
import { View } from 'react-native';

import { Instance } from '../Provider';

interface RAMUsageProps {
  theme: Theme;
  data: Instance;
}

export default class RAMUsage extends Component<RAMUsageProps> {
  render() {
    const { data } = this.props;
    return (
      <List>
        <Item size={110} style={{ paddingRight: 8, paddingLeft: 8 }}>
          <ItemBody style={{paddingRight: 0}}>
            <View style={{ flex: 1, flexDirection: 'row' }}>
              <Donut
                value={(data.ram.use! / data.ram.size) * 100}
                title="RAM"
                summary={format.fileSize(data.ram.use!, 'MB', { precision: 1, mode: 'short' }).toString()}
              />
              <Donut
                value={(data.swap!.use / data.swap!.size) * 100}
                title="SWAP"
                summary={format.fileSize(data.swap!.use, 'MB', { precision: 1, mode: 'short' }).toString()}
              />
              <Donut
                value={(data.disk.use! / data.disk.size) * 100}
                title="Disk"
                summary={format.fileSize(data.disk.use!, 'GB', { precision: 1, mode: 'short' }).toString()}
              />
              <Donut
                value={(data.bandwidth.current / data.bandwidth.allowed) * 100}
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
