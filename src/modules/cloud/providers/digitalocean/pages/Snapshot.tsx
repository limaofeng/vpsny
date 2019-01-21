import {
  Icon,
  Input,
  Item,
  ItemBody,
  ItemDivider,
  Label,
  List,
  Note,
  SubmitButton,
  Theme,
  withTheme
} from '@components';
import { AppState } from '@modules';
import { getApi } from '@modules/cloud';
import { Snapshot } from '@modules/cloud/Agent';
import OSLogo from '@modules/cloud/components/OSLogo';
import { Instance } from '@modules/cloud/Provider';
import { format } from '@utils';
import moment = require('moment');
import React from 'react';
import { Alert, RefreshControl, StyleSheet, SwipeableFlatList, Text, TouchableOpacity, View } from 'react-native';
import firebase, { RNFirebase } from 'react-native-firebase';
import { NavigationScreenOptions, NavigationScreenProp, SafeAreaView } from 'react-navigation';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { DigitalOceanAgent } from '../DigitalOceanAgent';

interface SnapshotListProps {
  navigation: NavigationScreenProp<any>;
  refresh: () => Promise<any>;
  droplet: Instance;
  createSnapshot: (name: string) => Promise<string>;
  deleteSnapshot: (id: string) => Promise<void>;
  restoreSnapshot: (id: string) => Promise<void>;
  theme: Theme;
}

interface SnapshotListState {
  refreshing: boolean;
  value: string;
  snapshots: Snapshot[];
  name: string;
}

class SnapshotList extends React.Component<SnapshotListProps, SnapshotListState> {
  static navigationOptions: NavigationScreenOptions = {
    title: 'Snapshots',
    headerBackTitle: ' ',
    tabBarVisible: false
  };
  analytics?: RNFirebase.Analytics;
  submit = React.createRef<any>();
  constructor(props: SnapshotListProps) {
    super(props);
    this.state = {
      refreshing: false,
      value: '',
      name: `${props.droplet.name}-${Date.now()}`,
      snapshots: []
    };
  }
  componentDidMount() {
    this.handleRefresh();
    this.analytics = firebase.analytics();
    this.analytics.setCurrentScreen('BWG/Snapshot', 'BWG/Snapshot.tsx');
  }

  handleRefresh = async () => {
    try {
      const { refresh } = this.props;
      this.setState({ refreshing: true });
      const { snapshots } = await refresh();
      this.setState({ snapshots, refreshing: false });
    } catch (e) {
      this.setState({ refreshing: false });
    }
  };

  handleChange = async (value: any) => {
    this.setState({ value });
  };

  handleChangeName = (value: string) => {
    this.setState({ name: value });
  };

  handleSubmit = async () => {
    const { createSnapshot } = this.props;
    await createSnapshot(this.state.name);
    this.submit.current!.reset();
    this.setState({ name: `${this.props.droplet.name}-${Date.now()}` });
    Alert.alert('Snapshot creation in progress', `Snapshot takes some time, please wait a moment to refresh .`);
  };

  handleRestoreSnapshot = (item: Snapshot) => async () => {
    const { restoreSnapshot } = this.props;
    Alert.alert('Restore snapshot ?', `This action will overwrite all data on the VPS.`, [
      { text: 'Cancel' },
      {
        text: 'I agree',
        onPress: async () => {
          await restoreSnapshot(item.id);
          await this.handleRefresh();
        }
      }
    ]);
  };

  handleDeleteSnapshot = (item: Snapshot) => async () => {
    const { deleteSnapshot } = this.props;
    Alert.alert('Remove Snapshot ?', `Are you sure delete ${item.name}`, [
      { text: 'Cancel' },
      {
        text: 'Ok',
        onPress: async () => {
          await deleteSnapshot(item.id);
          await this.handleRefresh();
        }
      }
    ]);
  };

  render() {
    const { colors } = this.props.theme as Theme;
    const { refreshing, snapshots, name } = this.state;

    return (
      <SafeAreaView style={[styles.container, {}]} forceInset={{ bottom: 'never' }}>
        <SwipeableFlatList
          data={snapshots}
          bounceFirstRowOnMount={true}
          maxSwipeDistance={80}
          ListHeaderComponent={
            <>
              <List style={{ marginTop: 13 }} title="Create new snapshot">
                <Item>
                  <Input defaultValue={name} placeholder="Enter snapshot name" />
                </Item>
                <Item testID="new-account" size={44} skip>
                  <SubmitButton
                    simple
                    ref={this.submit}
                    onSubmit={this.handleSubmit}
                    title="Create snapshot"
                    submittingText="Creating snapshot"
                  />
                </Item>
              </List>
              <ItemDivider>Snapshots</ItemDivider>
            </>
          }
          ListEmptyComponent={
            <Item>
              <Note> No Snapshots</Note>
            </Item>
          }
          renderItem={this.renderItem}
          renderQuickActions={this.renderQuickActions}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={this.handleRefresh} tintColor={colors.minor} />
          }
        />
      </SafeAreaView>
    );
  }

  renderItem = ({ item, index }: { item: Snapshot; index: number }) => {
    const { colors, fonts } = this.props.theme as Theme;
    return (
      <Item size={95} key={item.md5} last={index === this.state.snapshots.length - 1} value={item}>
        <ItemBody style={{ paddingRight: 15, paddingVertical: 10 }}>
          <View style={{ flex: 1 }}>
            <View style={{ position: 'absolute', right: 12, bottom: 5 }}>
              <OSLogo name={item.os} size={45} />
              {/*<Label style={{ width: 'auto' }}>{item.os}</Label>*/}
            </View>
            <View style={{ height: 35, flexDirection: 'row', alignItems: 'center' }}>
              <Text numberOfLines={1} ellipsizeMode="tail" style={[fonts.callout, { flex: 3, color: colors.major }]}>
                {item.name}
              </Text>
              <View style={{ flex: 1 }} />
            </View>
            <View style={{ height: 20, justifyContent: 'center' }}>
              <Label style={{ width: 'auto' }}>
                Size: {format.fileSize(item.size, 'MB')}, Regions:{' '}
                {item.regions.map((region: string) => region.toUpperCase()).join(',')}
              </Label>
            </View>
            <View style={{ height: 20, justifyContent: 'center' }}>
              <Note style={[fonts.footnote]}>Created: {moment(item.createdAt).fromNow()}</Note>
            </View>
          </View>
        </ItemBody>
      </Item>
    );
  };
  renderQuickActions = ({ item }: { item: Snapshot }) => {
    const { colors } = this.props.theme as Theme;
    return (
      <View style={[styles.actionsContainer, {}]}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.colorful.red }]}
          onPress={this.handleDeleteSnapshot(item)}
        >
          <Icon type="MaterialIcons" name="delete" color={colors.backgroundColorDeeper} size={24} />
        </TouchableOpacity>
      </View>
    );
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F1F2'
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#F6F6F6'
  },
  rowIcon: {
    width: 64,
    height: 64,
    marginRight: 20
  },
  rowData: {
    flex: 1
  },
  rowDataText: {
    fontSize: 24
  },
  actionsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  actionButton: {
    padding: 10,
    width: 80,
    height: 95,
    justifyContent: 'center'
  }
});

const mapStateToProps = (state: AppState, { navigation }: SnapshotListProps) => {
  return {};
};

const mapDispatchToProps = (dispatch: Dispatch, { navigation }: SnapshotListProps) => {
  const value = navigation.getParam('value') as Instance;
  const api = getApi(value.account) as DigitalOceanAgent;
  return {
    async refresh() {
      const data = await api.snapshot.list(value.id);
      return { snapshots: data };
    },
    async createSnapshot(name: string) {
      const data = await api.snapshot.create(value.id, name);
      return data as string;
    },
    async deleteSnapshot(id: string) {
      await api.snapshot.delete(id);
    },
    async restoreSnapshot(id: string) {
      await api.snapshot.restore(id);
    },
    droplet: value
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withTheme(SnapshotList, false));
