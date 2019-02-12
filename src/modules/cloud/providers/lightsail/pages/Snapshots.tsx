import { Theme, withTheme, List, Item, Note, Input } from '@components';
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

interface SnapshotsProps {
  navigation: NavigationScreenProp<any>;
  refresh: () => Promise<any>;
  instance: Instance;
  theme: Theme;
}

interface SnapshotsState {
  refreshing: boolean;
  snapshots: SnapshotData[];
}

class Snapshots extends React.Component<SnapshotsProps, SnapshotsState> {
  static navigationOptions: NavigationScreenOptions = {
    title: 'Snapshots',
    headerBackTitle: ' '
  };
  analytics?: RNFirebase.Analytics;
  constructor(props: SnapshotsProps) {
    super(props);
    this.state = {
      refreshing: false,
      snapshots: []
    };
  }

  componentDidMount() {
    this.handleRefresh();
    this.analytics = firebase.analytics();
    this.analytics.setCurrentScreen('Lightsail/Snapshots', 'Lightsail/Snapshots.tsx');
  }

  handleRefresh = async () => {
    const { refresh } = this.props;
    this.setState({ refreshing: true });
    const snapshots = await refresh();
    this.setState({ snapshots, refreshing: false });
  };

  render() {
    const { colors, fonts } = this.props.theme as Theme;

    const { refreshing, snapshots } = this.state;

    return (
      <SafeAreaView style={styles.container} forceInset={{ bottom: 'never' }}>
        <ScrollView
          style={{ flex: 1 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={this.handleRefresh} tintColor={colors.minor} />
          }
        >
          <List style={{ marginTop: 13 }} title="Create instance snapshot">
            <Item>
              <Input value="Ubuntu-512MB-Tokyo-1-1546178977" />
            </Item>
            <Item testID="new-account" size={44} skip>
              <View style={{ alignItems: 'center', flex: 1 }}>
                <Note style={[fonts.callout, { color: colors.primary }]}>Create snapshot</Note>
              </View>
            </Item>
          </List>
          <List title="Recent snapshots">
            {snapshots.map(snapshot => (
              <Item value={snapshot}>
                <Note>{snapshot.name}</Note>
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

const mapStateToProps = (state: ReduxState, { navigation }: SnapshotsProps) => {
  return {
    snapshots: []
  };
};

const mapDispatchToProps = (dispatch: Dispatch, { navigation }: SnapshotsProps) => {
  const value = navigation.getParam('value') as Instance;
  const api = getApi(value.account) as AWSLightsailAgent;
  return {
    async refresh() {
      return await api.snapshot.list();
    },
    instance: value
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withTheme(Snapshots, false));
