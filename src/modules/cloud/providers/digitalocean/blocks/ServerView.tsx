import { Item, List, Note, Theme } from '@components';
import Basic from '@modules/cloud/components/Basic';
import Hardware from '@modules/cloud/components/Hardware';
import { Instance } from '@modules/cloud/Provider';
import { Component } from 'react';
import React from 'react';
import { NavigationScreenProp, withNavigation } from 'react-navigation';

import Networking from '../components/Networking';

interface ServerOverviewProps {
  navigation: NavigationScreenProp<any>;
  data: Instance;
  theme: Theme;
}

class ServerOverview extends Component<ServerOverviewProps> {
  handleReinstall = () => {
    const { navigation, data } = this.props;
    navigation.navigate('DROPLET_Reinstall', { value: data });
  };

  handleSnapshots = () => {
    const { navigation, data } = this.props;
    navigation.navigate('DROPLET_Snapshots', { value: data });
  };

  handleBackups = () => {
    const { navigation, data } = this.props;
    navigation.navigate('DROPLET_Backups', { value: data });
  };

  render() {
    const { data, theme } = this.props;
    return (
      <>
        <Basic theme={theme} data={data} />
        <Hardware theme={theme} data={data} />
        <Networking theme={theme} data={data} />
        <List visible={false}>
          <Item push onClick={this.handleSnapshots}>
            <Note>Snapshots</Note>
          </Item>
        </List>
        <List visible={false}>
          <Item push onClick={this.handleBackups}>
            <Note>Backups</Note>
          </Item>
        </List>
      </>
    );
  }
}

export default withNavigation(ServerOverview);
