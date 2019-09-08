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
  OperationConfirm,
  OperationConfirmType,
  Theme,
  withTheme
} from '@components';
import { ReduxState } from '@modules';
import { getApi } from '@modules/cloud';
import { Snapshot } from '@modules/cloud/Agent';
import OSLogo from '@modules/cloud/components/OSLogo';
import { Instance } from '@modules/cloud/Provider';
import { format, sleep } from '@utils';
import moment = require('moment');
import React from 'react';
import { Alert, RefreshControl, StyleSheet, SwipeableFlatList, Text, TouchableOpacity, View } from 'react-native';
import { NavigationScreenOptions, NavigationScreenProp, SafeAreaView } from 'react-navigation';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { VultrAgent } from '../VultrAgent';
import { IBlueprint } from '@modules/database/type';
import { getObjectInformation } from '../../utils';
import Message from '../../../../../utils/Message';

interface SnapshotListProps {
  navigation: NavigationScreenProp<any>;
  refresh: () => Promise<any>;
  server: Instance;
  getBlueprint: (snapshot: Snapshot) => IBlueprint;
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
  confirm = React.createRef<OperationConfirmType>();
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
      name: `${props.server.name}-${Date.now()}`,
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
    await this.confirm.current!.open(
      'info',
      'Create Snapshot ?',
      'Stored snapshots are currently free - pricing subject to change.',
      {
        okText: 'Create Snapshot',
        loadingText: 'Creating snapshot',
        onSave: async () => {
          await createSnapshot(this.state.name);
          this.setState({ name: `${this.props.server.name}-${Date.now()}` });
          await this.handleRefresh();
          Message.success('Snapshot in progress');
        }
      }
    );
  };

  handleRestoreSnapshot = (item: Snapshot) => async () => {
    const { restoreSnapshot } = this.props;
    await this.confirm.current!.open(
      'warn',
      'Restore Snapshot?',
      'Are you sure you want to restore this snapshot? Any data currently on this machine will be overwritten.',
      {
        additions: getObjectInformation('Snapshot', item.name, this.props.theme),
        doubleConfirmText: 'Yes, restore snapshot on this server.',
        okText: 'Restore Snapshot',
        loadingText: 'Storing Snapshot',
        onSave: async () => {
          await restoreSnapshot(item.id);
          this.handleRefresh();
        }
      }
    );
  };

  handleDeleteSnapshot = (item: Snapshot) => async () => {
    const { deleteSnapshot } = this.props;
    await this.confirm.current!.open(
      'info',
      'Delete Snapshot?',
      'Are you sure you want to delete this snapshot? This operation cannot be undone.',
      {
        additions: getObjectInformation('Snapshot', item.name, this.props.theme),
        okText: 'Delete Snapshot',
        loadingText: 'Deleting Snapshot',
        onSave: async () => {
          await deleteSnapshot(item.id);
          this.handleRefresh();
        }
      }
    );
  };

  render() {
    const { colors, fonts } = this.props.theme as Theme;
    const { refreshing, snapshots, name } = this.state;

    return (
      <SafeAreaView style={[styles.container, {}]} forceInset={{ bottom: 'never' }}>
        <OperationConfirm ref={this.confirm} />
        <SwipeableFlatList
          data={snapshots}
          bounceFirstRowOnMount={true}
          maxSwipeDistance={({ item }: { item: Snapshot }) => {
            return item.status === 'pending' ? 0 : 160;
          }}
          ListHeaderComponent={
            <>
              <List style={{ marginTop: 13 }} title="Create new snapshot">
                <Item>
                  <Input defaultValue={name} placeholder="Enter snapshot name" />
                </Item>
                <Item testID="createSnapshot" size={44} skip>
                  <TouchableOpacity
                    testID="createSnapshot"
                    onPress={this.handleSubmit}
                    style={{ alignItems: 'center', flex: 1 }}
                  >
                    <Note style={[fonts.callout, { color: colors.primary }]}>Create snapshot</Note>
                  </TouchableOpacity>
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
    const { getBlueprint } = this.props;
    const statusColor = item.status === 'pending' ? colors.colorful.geraldine : colors.colorful.green;
    return (
      <Item size={85} key={item.md5} last={index === this.state.snapshots.length - 1} value={item}>
        <ItemBody style={{ paddingRight: 15, paddingVertical: 10 }}>
          <View style={{ flex: 1 }}>
            <View style={{ position: 'absolute', right: 12, bottom: 5 }}>
              <OSLogo name={getBlueprint(item).family} size={45} />
              {/*<Label style={{ width: 'auto' }}>{item.os}</Label>*/}
            </View>
            <View style={{ height: 25, flexDirection: 'row', alignItems: 'center' }}>
              <Icon type="FontAwesome" name="circle" color={statusColor} size={10} />
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={[fonts.callout, { paddingLeft: 5, flex: 1, color: colors.major }]}
              >
                {item.name}
              </Text>
            </View>
            <View style={{ height: 20, alignItems: 'center', flexDirection: 'row' }}>
              <Label style={{ width: 'auto', marginRight: 3 }}>Size: {format.fileSize(item.size, 'MB')},</Label>
              <Label style={{ width: 'auto' }}>
                Status:
                <Note style={[{ color: statusColor }, fonts.subhead]}>
                  {' '}
                  {item.status === 'pending' ? 'snapshot in progress' : 'Available'}
                </Note>
              </Label>
            </View>
            <View style={{ height: 20, justifyContent: 'center' }}>
              <Note style={[fonts.footnote]}>Created: {moment(item.createdAt).format('YYYY-MM-DD HH:mm:ss')}</Note>
            </View>
          </View>
        </ItemBody>
      </Item>
    );
  };
  renderQuickActions = ({ item }: { item: Snapshot }) => {
    const { colors } = this.props.theme as Theme;
    if (item.status === 'pending') {
      return <></>;
    }
    return (
      <View style={[styles.actionsContainer, {}]}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.colorful.green }]}
          onPress={this.handleRestoreSnapshot(item)}
        >
          <Icon type="MaterialIcons" name="restore" color={colors.backgroundColorDeeper} size={24} />
        </TouchableOpacity>
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
    height: 85,
    justifyContent: 'center'
  }
});

const mapStateToProps = ({ database: { blueprints } }: ReduxState, { navigation }: SnapshotListProps) => {
  const blueprintForVultr = blueprints.filter(blueprint => blueprint.provider === 'vultr');
  return {
    getBlueprint(item: Snapshot) {
      return blueprintForVultr.find(blueprint => {
        return item.os == blueprint.id;
      });
    }
  };
};

const mapDispatchToProps = (dispatch: Dispatch, { navigation }: SnapshotListProps) => {
  const value = navigation.getParam('value') as Instance;
  const api = getApi(value.account) as VultrAgent;
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
      await api.snapshot.restore(value.id, id);
    },
    server: value
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withTheme(SnapshotList, false));
