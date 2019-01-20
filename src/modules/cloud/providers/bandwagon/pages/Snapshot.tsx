import { HeaderRight, Icon, Input, Item, ItemBody, Label, Note, SubmitButton, Theme, withTheme } from '@components';
import { AppState } from '@modules';
import { getApi } from '@modules/cloud';
import { Snapshot } from '@modules/cloud/Agent';
import BandwagonHostAgent from '@modules/cloud/agents/BandwagonHostAgent';
import OSLogo from '@modules/cloud/components/OSLogo';
import { Instance } from '@modules/cloud/Provider';
import { format, SafeArea } from '@utils';
import React from 'react';
import {
  Alert,
  Dimensions,
  RefreshControl,
  StyleSheet,
  SwipeableFlatList,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import firebase, { RNFirebase } from 'react-native-firebase';
import Dialog, { DialogContent, DialogTitle, SlideAnimation } from 'react-native-popup-dialog';
import { NavigationScreenOptions, NavigationScreenProp, SafeAreaView } from 'react-navigation';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { defaultTheme } from '../../../../../components/Theme';
import Message from '../../../../../utils/Message';

interface SnapshotListProps {
  navigation: NavigationScreenProp<any>;
  refresh: () => Promise<any>;
  instance: Instance;
  createSnapshot: (name: string) => Promise<string>;
  deleteSnapshot: (id: string) => Promise<void>;
  restoreSnapshot: (id: string) => Promise<void>;
  stickySnapshot: (id: string, sticky: boolean) => Promise<void>;
  theme: Theme;
}

interface SnapshotListState {
  refreshing: boolean;
  value: string;
  snapshots: Snapshot[];
  visible: boolean;
  name: string;
}

class SnapshotList extends React.Component<SnapshotListProps, SnapshotListState> {
  static headerRight = React.createRef<any>();
  static handleClickHeaderRight: any;
  static navigationOptions: NavigationScreenOptions = {
    title: 'Snapshots',
    headerBackTitle: ' ',
    tabBarVisible: false,
    headerRight: (
      <HeaderRight
        onClick={() => {
          SnapshotList.handleClickHeaderRight();
        }}
        ref={SnapshotList.headerRight}
      >
        <Icon type="Ionicons" name="ios-add" size={26} color={defaultTheme.colors.primary} />
      </HeaderRight>
    )
  };
  analytics?: RNFirebase.Analytics;
  constructor(props: SnapshotListProps) {
    super(props);
    this.state = {
      refreshing: false,
      visible: false,
      value: '',
      name: '',
      snapshots: []
    };
    SnapshotList.handleClickHeaderRight = this.handleOpenDialog;
  }
  componentDidMount() {
    this.handleRefresh();
    this.analytics = firebase.analytics();
    this.analytics.setCurrentScreen('BWG/Snapshot', 'BWG/Snapshot.tsx');
  }

  handleOpenDialog = () => {
    this.setState({ visible: true, name: '' });
  };

  handleGoToBindHost = () => {
    const { navigation } = this.props;
    navigation.navigate('Deploy');
  };

  handleRefresh = async () => {
    const { refresh } = this.props;
    this.setState({ refreshing: true });
    const { snapshots } = await refresh();
    this.setState({ snapshots, refreshing: false });
  };

  handleChange = async (value: any) => {
    this.setState({ value });
  };

  handleChangeName = (value: string) => {
    this.setState({ name: value });
  };

  handleCloseDialog = () => {
    this.setState({ visible: false });
  };

  handleSubmit = async () => {
    const { createSnapshot } = this.props;
    const email = await createSnapshot(this.state.name);
    this.handleCloseDialog();
    Alert.alert(
      'Snapshot creation in progress',
      `Once created, an email notification will be sent to the following address: ${email}.`
    );
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

  handleStickySnapshot = (item: Snapshot) => async () => {
    const { stickySnapshot } = this.props;
    await stickySnapshot(item.id, !item.sticky);
    if (!item.sticky) {
      Message.success('Snapshot has been successfully set sticky. Automatic expiration set to never expire.');
    } else {
      Message.success('Snapshot has been successfully set not sticky. Automatic expiration has been enabled.');
    }
    await this.handleRefresh();
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
    const { colors, fonts } = this.props.theme as Theme;
    const { refreshing, snapshots } = this.state;

    return (
      <SafeAreaView style={[styles.container, {}]} forceInset={{ bottom: 'never' }}>
        <SwipeableFlatList
          data={snapshots}
          bounceFirstRowOnMount={true}
          maxSwipeDistance={240}
          renderItem={this.renderItem}
          renderQuickActions={this.renderQuickActions}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={this.handleRefresh} tintColor={colors.minor} />
          }
        />
        <Dialog
          height={180}
          dialogStyle={{ top: SafeArea.top + 45 }}
          containerStyle={{ justifyContent: 'flex-start' }}
          visible={this.state.visible}
          onTouchOutside={() => {
            this.setState({ visible: false });
          }}
          overlayBackgroundColor={colors.trivial}
          dialogAnimation={new SlideAnimation({ slideFrom: 'top' })}
          dialogTitle={<DialogTitle title="Create new snapshot" hasTitleBar={false} align="left" />}
        >
          <DialogContent style={{ flex: 1 }}>
            <View style={{ width: Dimensions.get('window').width - 60, flex: 1 }}>
              <Input style={[fonts.title]} onValueChange={this.handleChangeName} placeholder="short description" />
            </View>
            <SubmitButton
              style={{ marginTop: 10, backgroundColor: colors.primary }}
              onSubmit={this.handleSubmit}
              title="Create snapshot"
              submittingText="Creating snapshot"
            />
          </DialogContent>
        </Dialog>
      </SafeAreaView>
    );
  }

  renderItem = ({ item, index }: { item: Snapshot; index: number }) => {
    const { colors, fonts } = this.props.theme as Theme;
    return (
      <Item size={120} key={item.md5} last={index === this.state.snapshots.length - 1} value={item}>
        <ItemBody style={{ paddingRight: 15, paddingVertical: 10 }}>
          <View style={{ flex: 1 }}>
            <View style={{ position: 'absolute', right: 12, bottom: 5 }}>
              <OSLogo name={item.os} size={45} />
            </View>
            <View style={{ height: 35, flexDirection: 'row', alignItems: 'center' }}>
              <Text style={[fonts.title, { flex: 1 }]}>{item.name}</Text>
              <Text
                style={[
                  { color: colors.secondary },
                  item.sticky ? fonts.footnote : fonts.subhead,
                  item.sticky ? { color: colors.colorful.green, fontWeight: 'bold' } : {}
                ]}
              >
                {item.sticky ? (
                  <>Sticky, never expires</>
                ) : (
                  <>Expires in {parseInt(String(item.expires / 60 / 60 / 24))} days</>
                )}
              </Text>
            </View>
            <View style={{ height: 20, justifyContent: 'center' }}>
              <Label style={{ width: 'auto' }}>{item.os}</Label>
            </View>
            <View style={{ height: 20, justifyContent: 'center' }}>
              <Label style={{ width: 'auto' }}>
                size: {format.fileSize(item.size, 'MB')}, uncompressed: {format.fileSize(item.uncompressed, 'MB')}
              </Label>
            </View>
            <View style={{ height: 20, justifyContent: 'center' }}>
              <Note style={[fonts.footnote]}>MD5: {item.md5}</Note>
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
          style={[styles.actionButton, { backgroundColor: colors.colorful.green }]}
          onPress={this.handleRestoreSnapshot(item)}
        >
          <Icon type="MaterialIcons" name="restore" color={colors.backgroundColorDeeper} size={24} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.colorful.orange }]}
          onPress={this.handleStickySnapshot(item)}
        >
          <Icon
            type="Ionicons"
            name={item.sticky ? 'ios-unlock' : 'ios-lock'}
            color={colors.backgroundColorDeeper}
            size={24}
          />
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
    height: 120,
    justifyContent: 'center'
  }
});

const mapStateToProps = (state: AppState, { navigation }: SnapshotListProps) => {
  return {};
};

const mapDispatchToProps = (dispatch: Dispatch, { navigation }: SnapshotListProps) => {
  const value = navigation.getParam('value') as Instance;
  const api = getApi(value.account) as BandwagonHostAgent;
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
    async stickySnapshot(id: string, sticky: boolean) {
      await api.snapshot.sticky(id, sticky);
    },
    instance: value
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withTheme(SnapshotList, false));
