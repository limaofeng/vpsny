import { Item, List, Note, Theme } from '@components';
import Bandwidth from '@modules/cloud/components/Bandwidth';
import Basic from '@modules/cloud/components/Basic';
import { Instance } from '@modules/cloud/Provider';
import { Component } from 'react';
import React from 'react';
import { NavigationScreenProp, withNavigation } from 'react-navigation';
import Charges from '@modules/cloud/components/Charges';
import Hardware from '@modules/cloud/components/Hardware';

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
        <Hardware theme={theme} data={data}/>
        <Charges theme={theme} data={data} />
        <Bandwidth theme={theme} data={data} />
        <List>
          <Item push onClick={this.handleSnapshots}>
            <Note>Snapshots</Note>
          </Item>
        </List>
        <List>
          <Item push onClick={this.handleBackups}>
            <Note>Backups</Note>
          </Item>
        </List>
      </>
    );
  }
}

export default withNavigation(ServerOverview);
