import { Theme, withTheme, List, Item, Note, Input, Label, Icon } from '@components';
import { getApi } from '@modules/cloud';
import { Instance } from '@modules/cloud/Provider';
import { Snapshot as SnapshotData } from '@modules/cloud/Agent';
import React from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import firebase, { RNFirebase } from 'react-native-firebase';
import { NavigationScreenOptions, NavigationScreenProp, SafeAreaView } from 'react-navigation';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { ReduxState } from '@modules';
import { AWSLightsailAgent } from '../AWSProvider';
import { OperationList } from 'aws-sdk/clients/lightsail';
import moment = require('moment');

interface HistoryProps {
  navigation: NavigationScreenProp<any>;
  refresh: () => Promise<any>;
  instance: Instance;
  theme: Theme;
}

interface HistoryState {
  refreshing: boolean;
  logs: OperationList;
}

class History extends React.Component<HistoryProps, HistoryState> {
  static navigationOptions: NavigationScreenOptions = {
    title: 'History',
    headerBackTitle: ' '
  };
  analytics?: RNFirebase.Analytics;
  constructor(props: HistoryProps) {
    super(props);
    this.state = {
      refreshing: false,
      logs: []
    };
  }

  componentDidMount() {
    this.handleRefresh();
    this.analytics = firebase.analytics();
    this.analytics.setCurrentScreen('Lightsail/History', 'Lightsail/History.tsx');
  }

  handleRefresh = async () => {
    const { refresh } = this.props;
    this.setState({ refreshing: true });
    const logs = await refresh();
    this.setState({ logs, refreshing: false });
  };

  render() {
    const { colors, fonts } = this.props.theme as Theme;
    const { refreshing, logs } = this.state;
    return (
      <SafeAreaView style={styles.container} forceInset={{ bottom: 'never' }}>
        <ScrollView
          style={{ flex: 1 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={this.handleRefresh} tintColor={colors.minor} />
          }
        >
          <List style={{ marginTop: 13 }} title="Instance history">
            {logs.map(log => (
              <Item value={log}>
                <Icon
                  type="Ionicons"
                  color={
                    log.status === 'Succeeded'
                      ? colors.colorful.green
                      : log.status === 'Failed'
                        ? colors.colorful.red
                        : colors.colorful.geraldine
                  }
                  name={
                    log.status === 'Succeeded'
                      ? 'ios-checkmark-circle-outline'
                      : log.status === 'Failed'
                        ? 'ios-close-circle-outline'
                        : 'ios-code-working'
                  }
                  size={14}
                />
                <Note style={{ flex: 1 }}>{log.operationType}</Note>
                <Label style={{ flex: 0 }}>{moment(log.createdAt).format('YYYY-MM-DD')}</Label>
              </Item>
            ))}
          </List>
        </ScrollView>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F1F2'
  }
});

const mapStateToProps = (state: ReduxState, { navigation }: HistoryProps) => {
  return {
    snapshots: []
  };
};

const mapDispatchToProps = (dispatch: Dispatch, { navigation }: HistoryProps) => {
  const value = navigation.getParam('value') as Instance;
  const api = getApi(value.account) as AWSLightsailAgent;
  return {
    async refresh() {
      return await api.instance.history(value.id);
    },
    instance: value
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withTheme(History, false));
