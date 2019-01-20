import { Component } from 'react';
import React from 'react';
import Bandwidth from '@modules/cloud/components/Bandwidth';
import Basic from '@modules/cloud/components/Basic';
import { Instance } from '@modules/cloud/Provider';
import { Theme, List, Item, Note } from '@components';
import { withNavigation, NavigationScreenProp } from 'react-navigation';
import Usage from '@modules/cloud/components/Usage';
import Hardware from '@modules/cloud/components/Hardware';

interface ServerOverviewProps {
  navigation: NavigationScreenProp<any>;
  data: Instance;
  theme: Theme;
}

class ServerOverview extends Component<ServerOverviewProps> {
  handleReinstall = () => {
    const { navigation, data } = this.props;
    navigation.navigate('BWG_Reinstall', { value: data });
  };

  handleMigration = () => {
    const { navigation, data } = this.props;
    navigation.navigate('BWG_Migration', { value: data });
  };

  handleSnapshots = () => {
    const { navigation, data } = this.props;
    navigation.navigate('BWG_Snapshot', { value: data });
  };

  handleBackups = () => {
    const { navigation, data } = this.props;
    navigation.navigate('BWG_Backup', { value: data });
  };

  render() {
    const { data, theme } = this.props;
    return (
      <>
        <Usage theme={theme} data={data} />
        <Basic theme={theme} data={data} />
        <Hardware theme={theme} data={data} />
        <Bandwidth theme={theme} data={data} />
        <List>
          <Item push onClick={this.handleReinstall}>
            <Note>Install new OS</Note>
          </Item>
        </List>
        <List>
          <Item push onClick={this.handleMigration}>
            <Note>Migration</Note>
          </Item>
        </List>
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
