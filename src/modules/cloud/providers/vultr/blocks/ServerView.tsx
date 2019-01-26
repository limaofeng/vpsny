import { Item, Label, List, Note, Theme } from '@components';
import Bandwidth from '@modules/cloud/components/Bandwidth';
import Basic from '@modules/cloud/components/Basic';
import Charges from '@modules/cloud/components/Charges';
import Hardware from '@modules/cloud/components/Hardware';
import { Instance } from '@modules/cloud/Provider';
import React from 'react';
import { NavigationScreenProp, withNavigation } from 'react-navigation';

import FieldInput from '../components/FieldInput';
import Network from '../components/Network';
import { getApi } from '@modules/cloud';
import { VultrAgent } from '../VultrAgent';
import { Dispatch } from 'redux';
import { AppState } from '@modules';
import { connect } from 'react-redux';

interface ServerOverviewProps {
  navigation: NavigationScreenProp<any>;
  data: Instance;
  theme: Theme;
  label: (value: string) => Promise<void>;
  tag: (value: string) => Promise<void>;
}

class ServerOverview extends React.PureComponent<ServerOverviewProps> {
  handleReinstall = () => {
    const { navigation, data } = this.props;
    navigation.navigate('VULTR_Reinstall', { value: data });
  };

  handleSnapshots = () => {
    const { navigation, data } = this.props;
    navigation.navigate('VULTR_Snapshot', { value: data });
  };

  handleBackups = () => {
    const { navigation, data } = this.props;
    navigation.navigate('VULTR_Backup', { value: data });
  };

  handleChangeLable = async (value: string) => {
    this.props.label(value);
  };

  handleChangeTag = async (value: string) => {
    this.props.tag(value);
  };

  render() {
    const { data, theme } = this.props;
    return (
      <>
        <List>
          <Item bodyStyle={{ paddingRight: 15 }}>
            <Label>Label</Label>
            <FieldInput value={data.name === 'Cloud Instance' ? '' : data.name} theme={theme} onChangeValue={this.handleChangeLable} />
          </Item>
          <Item bodyStyle={{ paddingRight: 15 }}>
            <Label>Tag</Label>
            <FieldInput value={data.tag!} theme={theme} onChangeValue={this.handleChangeTag} />
          </Item>
        </List>
        <Basic theme={theme} data={data} />
        <Hardware theme={theme} data={data} />
        <Charges theme={theme} data={data} />
        <Bandwidth theme={theme} data={data} />
        <Network theme={theme} data={data} />
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

const mapStateToProps = ({ database: { blueprints } }: AppState, { navigation }: ServerOverviewProps) => {
  return {};
};

const mapDispatchToProps = (dispatch: Dispatch, { navigation, data }: ServerOverviewProps) => {
  const api = getApi(data.account) as VultrAgent;
  return {
    async label(value: string) {
      await api.instance.label(data.id, value);
      const instance = await api.instance.get(data.id);
      dispatch({ type: 'cloud/instance', payload: { operate: 'update', instance: instance } });
    },
    async tag(value: string) {
      await api.instance.tag(data.id, value);
      const instance = await api.instance.get(data.id);
      dispatch({ type: 'cloud/instance', payload: { operate: 'update', instance: instance } });
    }
  };
};

export default withNavigation(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(ServerOverview)
);
