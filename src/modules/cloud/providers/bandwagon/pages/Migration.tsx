import { Theme, withTheme, List, Item, Note } from '@components';
import { getApi } from '@modules/cloud';
import { Instance } from '@modules/cloud/Provider';
import React from 'react';
import { RefreshControl, ScrollView, StyleSheet } from 'react-native';
import firebase, { RNFirebase } from 'react-native-firebase';
import { NavigationScreenOptions, NavigationScreenProp, SafeAreaView } from 'react-navigation';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { AppState } from '@modules';
import BandwagonHostAgent from '@modules/cloud/agents/BandwagonHostAgent';

interface ReinstallProps {
  navigation: NavigationScreenProp<any>;
  refresh: () => Promise<any>;
  instance: Instance;
  theme: Theme;
}

interface ReinstallState {
  refreshing: boolean;
  value: string;
  data: any;
}

class Reinstall extends React.Component<ReinstallProps, ReinstallState> {
  static navigationOptions: NavigationScreenOptions = {
    title: 'Migration',
    headerBackTitle: ' '
  };
  analytics?: RNFirebase.Analytics;
  constructor(props: ReinstallProps) {
    super(props);
    this.state = {
      refreshing: false,
      value: '',
      data: {
        locations: []
      }
    };
  }

  componentDidMount() {
    this.handleRefresh();
    this.analytics = firebase.analytics();
    this.analytics.setCurrentScreen('ServerView', 'ServerView.tsx');
  }

  handleOpenTerminal = () => {
    const { navigation, instance } = this.props;
    navigation.navigate('Terminal', { value: instance });
  };

  handleGoToBindHost = () => {
    const { navigation } = this.props;
    navigation.navigate('Deploy');
  };

  handleRefresh = async () => {
    const { refresh } = this.props;
    this.setState({ refreshing: true });
    const data = await refresh();
    this.setState({ data, refreshing: false });
  };

  handleChange = async (value: any) => {
    this.setState({ value });
  };

  render() {
    const { colors, fonts } = this.props.theme as Theme;

    const { refreshing, data } = this.state;

    return (
      <SafeAreaView style={styles.container} forceInset={{ bottom: 'never' }}>
        <ScrollView
          style={{ flex: 1 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={this.handleRefresh} tintColor={colors.minor} />
          }
        >
          <List type="radio-group" value={data.currentLocation} isEqual={(l, r) => l === r} onChange={this.handleChange}>
            {data.locations.map((location: any) => (
              <Item value={location}>
                <Note>{data.descriptions[location]}</Note>
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

const mapStateToProps = (state: AppState, { navigation }: ReinstallProps) => {
  return {};
};

const mapDispatchToProps = (dispatch: Dispatch, { navigation }: ReinstallProps) => {
  const value = navigation.getParam('value') as Instance;
  const api = getApi(value.account) as BandwagonHostAgent;
  return {
    async refresh() {
      return await api.instance.getMigrateLocations(value.id);
    },
    instance: value
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withTheme(Reinstall, false));
