import {
  Icon,
  Item,
  ItemBody,
  Label,
  List,
  Note,
  OperationConfirm,
  OperationConfirmType,
  Select,
  SubmitButton,
  Theme,
  withTheme
} from '@components';
import { ReduxState } from '@modules';
import { getApi } from '@modules/cloud';
import { Backup } from '@modules/cloud/Agent';
import { Instance } from '@modules/cloud/Provider';
import { format } from '@utils';
import moment = require('moment');
import React from 'react';
import { RefreshControl, StyleSheet, SwipeableFlatList, Text, TouchableOpacity, View } from 'react-native';
import { NavigationScreenOptions, NavigationScreenProp, SafeAreaView } from 'react-navigation';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import Bluebird from 'bluebird';

import Message from '../../../../../utils/Message';
import { getObjectInformation } from '../../utils';
import { BackupSchedule, VultrAgent } from '../VultrAgent';

interface BackupListProps {
  navigation: NavigationScreenProp<any>;
  refresh: () => Promise<any>;
  enableBackups: () => Promise<void>;
  disableBackups: () => Promise<void>;
  restoreBackup: (backup: string) => Promise<void>;
  getBackupSchedule: () => Promise<BackupSchedule>;
  setBackupSchedule: (schedule: BackupSchedule) => Promise<void>;
  instance: Instance;
  theme: Theme;
}

interface BackupListState {
  instance: Instance;
  refreshing: boolean;
  value: string;
  backups: Backup[];
  schedule?: BackupSchedule;
  visible: boolean;
  name: string;
}

class BackupList extends React.PureComponent<BackupListProps, BackupListState> {
  static navigationOptions: NavigationScreenOptions = {
    title: 'Backups',
    headerBackTitle: ' ',
    tabBarVisible: false
  };
  confirm = React.createRef<OperationConfirmType>();
  submit = React.createRef<any>();
  analytics?: RNFirebase.Analytics;
  constructor(props: BackupListProps) {
    super(props);
    this.state = {
      instance: props.instance,
      refreshing: false,
      visible: false,
      value: '',
      name: '',
      backups: []
    };
  }
  componentDidMount() {
    this.handleRefresh();
    this.analytics = firebase.analytics();
    this.analytics.setCurrentScreen('BWG/Backup', 'BWG/Backup.tsx');
  }

  handleRefresh = async () => {
    try {
      const { refresh } = this.props;
      this.setState({ refreshing: true });
      const { instance, backups, schedule } = await refresh();
      debugger;
      this.setState({ instance, backups, schedule, refreshing: false });
    } catch (e) {
      console.warn(e);
      this.setState({ refreshing: false });
    }
  };

  handleChangeSchedule = (name: string) => (value: string) => {
    const { schedule } = this.state;
    const newSchedule: any = { ...schedule, [name]: value };
    this.setState({ schedule: newSchedule });
  };

  handleUpdateSchedule = async () => {
    const { setBackupSchedule } = this.props;
    await setBackupSchedule(this.state.schedule!);
    Message.success('Automatic backup schedule updated.');
    this.submit.current!.reset();
    this.handleRefresh();
  };

  handleRestoreBackup = (item: Backup) => async () => {
    const { restoreBackup } = this.props;
    const { instance } = this.state;
    await this.confirm.current!.open(
      'warn',
      'Restore Backup?',
      'Are you sure you want to restore this backup? Any data currently on your machine will be overwritten',
      {
        additions: getObjectInformation('Server', instance.IPv4!.ip, this.props.theme),
        doubleConfirmText: 'Yes, restore backup on this server.',
        okText: 'Restore Backup',
        loadingText: 'Storing Backup',
        onSave: async () => {
          await restoreBackup(item.id);
          await this.handleRefresh();
        }
      }
    );
  };

  handleEnableBackups = async () => {
    const { disableBackups, enableBackups } = this.props;
    const { instance } = this.state;
    const text = instance.autoBackups ? 'Disable Backups' : 'Enable Backups';
    await this.confirm.current!.open(
      instance.autoBackups ? 'warn' : 'info',
      instance.autoBackups ? 'Disable Backups ?' : 'Enable Backups?',
      instance.autoBackups
        ? 'Are you sure you want to disable backups? Once disabled, automatic backups cannot be re-enabled from the customer portal.'
        : `Enabling backups is an additional $${(instance.costPerMonth! / 10) *
            2}/month, Individual files cannot be restored (only the entire server).`,
      {
        okText: text,
        loadingText: text,
        doubleConfirmText: instance.autoBackups ? 'Yes, disable backups on this server. ' : undefined,
        onSave: async () => {
          if (instance.autoBackups) {
            await disableBackups();
          } else {
            await enableBackups();
          }
          await this.handleRefresh();
        }
      }
    );
  };

  render() {
    const { colors } = this.props.theme as Theme;
    const { refreshing, backups, schedule, instance } = this.state;
    return (
      <SafeAreaView style={[styles.container, {}]} forceInset={{ bottom: 'never' }}>
        <OperationConfirm ref={this.confirm} />
        <SwipeableFlatList
          data={instance.autoBackups ? backups : []}
          maxSwipeDistance={({ item }: { item: Backup }) => {
            return item.status === 'pending' ? 0 : 80;
          }}
          ListHeaderComponent={this.renderHeader()}
          ListFooterComponent={instance.autoBackups && schedule && this.renderFooter(schedule)}
          renderItem={this.renderItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={this.handleRefresh} tintColor={colors.minor} />
          }
          renderQuickActions={this.renderQuickActions}
          ListEmptyComponent={
            <Item last style={{ marginTop: 20 }}>
              <Note>No Backups</Note>
            </Item>
          }
        />
      </SafeAreaView>
    );
  }

  renderHeader = () => {
    const { instance } = this.state;
    const { colors, fonts } = this.props.theme as Theme;
    return (
      <>
        <List style={{ marginTop: 10 }}>
          <Item size={instance.autoBackups ? 'normal' : 'medium'}>
            <Note>
              {instance.autoBackups ? (
                <>Automatic backups are currently enabled for this server.</>
              ) : (
                <>
                  Enabling backups is an additional $0.50/month. Individual files cannot be restored (only the entire
                  server).
                </>
              )}
            </Note>
          </Item>
          <Item bodyStyle={{ marginRight: 10 }} size={44} skip>
            <TouchableOpacity
              testID="enable-backups"
              onPress={this.handleEnableBackups}
              style={{ alignItems: 'center', flex: 1 }}
            >
              <Note style={[fonts.callout, { color: colors.primary }]}>
                {instance.autoBackups ? <>Disable Automatic Backups</> : <>Enable Backups</>}
              </Note>
            </TouchableOpacity>
          </Item>
        </List>
      </>
    );
  };

  renderFooter = (schedule: BackupSchedule) => {
    const today = moment();
    let even, odd;
    if (today.date() % 2 == 0) {
      even = today;
      odd = today.add(1, 'days');
    } else {
      odd = today;
      even = today.add(1, 'days');
    }
    const dayOfMonth = [];
    for (let i = 1; i <= today.daysInMonth(); i++) {
      dayOfMonth.push({
        label: `Day ${i}`,
        value: i
      });
    }
    const dayofWeek = moment.weekdays().map((week, value) => ({
      label: week,
      value
    }));
    const hours = [];
    for (let i = 0; i < 24; i++) {
      hours.push({
        label: `${i}:00 UTC`,
        value: i
      });
    }
    const cronTypes = [
      { label: 'Daily', value: 'daily' },
      { label: 'Weekly', value: 'weekly' },
      { label: 'Monthly', value: 'monthly' },
      {
        label: `Every Other Day (${even.format('MMM DD')}, ${even.add(2, 'days').format('MMM DD')}, ...)`,
        value: 'daily_alt_even'
      },
      {
        label: `Every Other Day (${odd.format('MMM DD')}, ${odd.add(2, 'days').format('MMM DD')}, ...)`,
        value: 'daily_alt_odd'
      }
    ];
    const defaultDom = schedule.dom || 1;
    const defaultDow = schedule.dow || moment().week();
    const defaultHour = schedule.hour || 0;
    return (
      <List style={{ marginTop: 20 }} title={`Next scheduled backup: ${schedule.nextScheduledTimeUtc} UTC`}>
        <Item>
          <Label>Schedule</Label>
          <Select
            value={cronTypes.find(type => type.value === schedule.cronType)}
            hideIcon
            required
            hideClearButton
            onValueChange={this.handleChangeSchedule('cronType')}
            items={cronTypes}
          />
        </Item>
        <Item visible={schedule.cronType === 'monthly'}>
          <Label style={{ width: 'auto' }}>On</Label>
          <Select
            value={dayOfMonth.find(day => day.value === defaultDom)}
            required
            hideIcon
            hideClearButton
            onValueChange={this.handleChangeSchedule('dom')}
            items={dayOfMonth}
          />
          <Label style={{ width: 'auto' }}>At</Label>
          <Select
            value={hours.find(hour => hour.value === defaultHour)}
            required
            hideIcon
            hideClearButton
            onValueChange={this.handleChangeSchedule('hour')}
            items={hours}
          />
        </Item>
        <Item visible={schedule.cronType === 'weekly'}>
          <Label style={{ width: 'auto' }}>On</Label>
          <Select
            value={dayofWeek.find(day => day.value === defaultDow)}
            required
            hideIcon
            hideClearButton
            onValueChange={this.handleChangeSchedule('dow')}
            items={dayofWeek}
          />
          <Label style={{ width: 'auto' }}>At</Label>
          <Select
            value={hours.find(hour => hour.value === defaultHour)}
            required
            hideIcon
            hideClearButton
            onValueChange={this.handleChangeSchedule('hour')}
            items={hours}
          />
        </Item>
        <Item visible={['daily', 'daily_alt_even', 'daily_alt_odd'].some(type => type === schedule.cronType)}>
          <Label>At</Label>
          <Select
            value={hours.find(hour => hour.value === defaultHour)}
            required
            hideIcon
            hideClearButton
            onValueChange={this.handleChangeSchedule('hour')}
            items={hours}
          />
        </Item>
        <Item>
          <SubmitButton
            simple
            ref={this.submit}
            onSubmit={this.handleUpdateSchedule}
            title="Update Schedule"
            submittingText="Updating Schedule"
            doneText="Update Schedule"
          />
        </Item>
      </List>
    );
  };

  renderItem = ({ item, index }: { item: Backup; index: number }) => {
    const { colors, fonts } = this.props.theme as Theme;
    const statusColor = item.status === 'pending' ? colors.colorful.geraldine : colors.colorful.green;
    return (
      <Item size={85} key={item.md5} last={index === this.state.backups.length - 1} value={item}>
        <ItemBody style={{ paddingRight: 15, paddingVertical: 10 }}>
          <View style={{ flex: 1 }}>
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
                  {item.status === 'pending' ? 'backup in progress' : 'Available'}
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

  renderQuickActions = ({ item }: { item: Backup }) => {
    const { colors } = this.props.theme as Theme;
    if (item.status === 'pending') {
      return <></>;
    }
    return (
      <View style={[styles.actionsContainer, {}]}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.colorful.green }]}
          onPress={this.handleRestoreBackup(item)}
        >
          <Icon type="MaterialIcons" name="restore" color={colors.backgroundColorDeeper} size={24} />
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

const mapStateToProps = ({ cloud: { instances } }: ReduxState, { navigation }: BackupListProps) => {
  const value = navigation.getParam('value') as Instance;
  return { instance: instances.find(node => node.id === value.id)! };
};

const mapDispatchToProps = (dispatch: Dispatch, { navigation }: BackupListProps) => {
  const value = navigation.getParam('value') as Instance;
  const api = getApi(value.account) as VultrAgent;
  return {
    async refresh() {
      const instance = await api.instance.get(value.id);
      dispatch({ type: 'cloud/instance', payload: { operate: 'update', instance: instance } });
      if (instance.autoBackups) {
        const { backups, schedule } = await Bluebird.props({
          backups: api.backup.list(value.id),
          schedule: api.instance.getBackupSchedule(value.id)
        });
        return { backups, schedule, instance };
      }
      return { backups: [], instance, schedule: undefined };
    },
    async enableBackups() {
      await api.instance.enableBackups(value.id);
    },
    async disableBackups() {
      await api.instance.disableBackups(value.id);
    },
    async setBackupSchedule(schedule: BackupSchedule) {
      await api.instance.setBackupSchedule(value.id, schedule);
    },
    async restoreBackup(backup: string) {
      await api.instance.restoreBackup(value.id, backup);
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withTheme(BackupList, false));
