import { Item, ItemBody, Label, Note, SubmitButton, Theme, withTheme } from '@components';
import { AppState } from '@modules';
import { getApi } from '@modules/cloud';
import { Backup } from '@modules/cloud/Agent';
import BandwagonHostAgent from '@modules/cloud/agents/BandwagonHostAgent';
import OSLogo from '@modules/cloud/components/OSLogo';
import { Instance } from '@modules/cloud/Provider';
import { format } from '@utils';
import moment = require('moment');
import React from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import firebase, { RNFirebase } from 'react-native-firebase';
import { NavigationScreenOptions, NavigationScreenProp, SafeAreaView } from 'react-navigation';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import Message from '../../../../../utils/Message';

interface BackupListProps {
  navigation: NavigationScreenProp<any>;
  refresh: () => Promise<any>;
  copyToSnapshot: (name: string) => Promise<string>;
  instance: Instance;
  theme: Theme;
}

interface BackupListState {
  refreshing: boolean;
  value: string;
  backups: Backup[];
  visible: boolean;
  name: string;
}

class BackupList extends React.Component<BackupListProps, BackupListState> {
  static navigationOptions: NavigationScreenOptions = {
    title: 'Backups',
    headerBackTitle: ' ',
    tabBarVisible: false
  };
  analytics?: RNFirebase.Analytics;
  constructor(props: BackupListProps) {
    super(props);
    this.state = {
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
      const backups = await refresh();
      this.setState({ backups, refreshing: false });
    } catch (e) {
      this.setState({ refreshing: false });
    }
  };

  handleSubmit = (item: Backup) => async (button?: any) => {
    const { copyToSnapshot } = this.props;
    const email = await copyToSnapshot(item.id);
    Message.info(
      'Import to Snapshots in progress',
      `Once completed, an email notification will be sent to the following address: ${email}.`
    );
    button.update({ disabled: true, title: 'Import to Snapshots in progress' });
    throw 'Waiting for completion';
  };

  render() {
    const { colors } = this.props.theme as Theme;

    const { refreshing, backups } = this.state;

    return (
      <SafeAreaView style={[styles.container, {}]} forceInset={{ bottom: 'never' }}>
        <FlatList
          data={backups}
          renderItem={this.renderItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={this.handleRefresh} tintColor={colors.minor} />
          }
        />
      </SafeAreaView>
    );
  }

  renderItem = ({ item, index }: { item: Backup; index: number }) => {
    const { colors, fonts } = this.props.theme as Theme;
    return (
      <Item size={100} key={item.md5} last={index === this.state.backups.length - 1} value={item}>
        <ItemBody style={{ paddingRight: 15, paddingTop: 10, paddingBottom: 5 }}>
          <View style={{ flex: 1 }}>
            <View style={{ position: 'absolute', right: 12, bottom: 25 }}>
              <OSLogo name={item.os} size={35} />
            </View>
            <View style={{ height: 20, flexDirection: 'row', alignItems: 'center' }}>
              <Label style={{ width: 'auto', flex: 1 }}>{item.os}</Label>
              <Text style={[{ color: colors.secondary }, fonts.subhead]}>
                {moment(item.timestamp * 1000)
                  .utcOffset(-5)
                  .format('dd, DD MMM YYYY HH:mm:ss ZZ')}
              </Text>
            </View>
            <View style={{ height: 20, justifyContent: 'center' }}>
              <Label style={{ width: 'auto' }}>size: {format.fileSize(item.size, 'MB')}</Label>
            </View>
            <View style={{ height: 20, justifyContent: 'center' }}>
              <Note style={[fonts.footnote]}>MD5: {item.md5}</Note>
            </View>
            <SubmitButton
              style={{ marginTop: 5, backgroundColor: colors.minor, height: 20, borderRadius: 10 }}
              buttonStyle={[fonts.subhead]}
              disabled={item.snapshot}
              disabledStyle={{
                style: { backgroundColor: colors.backgroundColor },
                buttonStyle: { color: colors.trivial }
              }}
              spinnerSize={14}
              onSubmit={this.handleSubmit(item)}
              title={item.snapshot ? 'This backup is already in your Snapshots' : 'Import to my Snapshots'}
              submittingText="Importing a backup into Snapshots"
            />
          </View>
        </ItemBody>
      </Item>
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
    height: 100,
    justifyContent: 'center'
  }
});

const mapStateToProps = (state: AppState, { navigation }: BackupListProps) => {
  return {};
};

const mapDispatchToProps = (dispatch: Dispatch, { navigation }: BackupListProps) => {
  const value = navigation.getParam('value') as Instance;
  const api = getApi(value.account) as BandwagonHostAgent;
  return {
    async refresh() {
      return await api.backup.list(value.id);
    },
    async copyToSnapshot(id: string) {
      return await api.backup.copyToSnapshot(id);
    },
    instance: value
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withTheme(BackupList, false));
