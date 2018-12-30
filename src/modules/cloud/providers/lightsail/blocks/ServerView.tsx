import { Item, List, Note, Theme } from '@components';
import Bandwidth from '@modules/cloud/components/Bandwidth';
import Basic from '@modules/cloud/components/Basic';
import { Instance } from '@modules/cloud/Provider';
import { Component } from 'react';
import React from 'react';
import { NavigationScreenProp, withNavigation } from 'react-navigation';

import Storage from '../components/Storage';
import Networking from '../components/Networking';

interface ServerOverviewProps {
  navigation: NavigationScreenProp<any>;
  data: Instance;
  theme: Theme;
}

class ServerOverview extends Component<ServerOverviewProps> {

  handleFirewall = () => {
    const { navigation, data } = this.props;
    navigation.navigate('Lightsail_Firewall', { value: data });
  };

  handleSnapshots = () => {
    const { navigation, data } = this.props;
    navigation.navigate('Lightsail_Snapshots', { value: data });
  };

  handleHistory = () => {
    const { navigation, data } = this.props;
    navigation.navigate('Lightsail_History', { value: data });
  };

  render() {
    const { data, theme } = this.props;
    return (
      <>
        <Basic theme={theme} data={data} />
        <Bandwidth theme={theme} data={data} />
        <Storage theme={theme} data={data} />
        <Networking theme={theme} data={data} />
        <List>
          <Item push onClick={this.handleSnapshots}>
            <Note>Snapshots</Note>
          </Item>
        </List>
        <List>
        <Item push onClick={this.handleHistory}>
          <Note>History</Note>
        </Item>
      </List>
      </>
    );
  }
}

export default withNavigation(ServerOverview);
