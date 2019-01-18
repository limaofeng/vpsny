import { Icon, Item, ItemBody, Label, List, Note, Theme, ItemStart } from '@components';
import React, { Component } from 'react';
import { View } from 'react-native';
import { Instance } from '@modules/cloud/type';
import { format } from '@utils';

interface StorageProps {
  theme: Theme;
  data: Instance;
}

export default class Storage extends Component<StorageProps> {
  render() {
    const { colors, fonts } = this.props.theme;
    const { data } = this.props;
    const systemDisk = (data.disks || []).find(disk => disk.isSystemDisk);
    return (
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
    );
  }
}
