import { Theme, withTheme, List, Item, Note, HeaderRight } from '@components';
import { getApi } from '@modules/cloud';
import { Instance } from '@modules/cloud/Provider';
import React from 'react';
import { RefreshControl, ScrollView, StyleSheet, Alert } from 'react-native';
import { NavigationScreenOptions, NavigationScreenProp, SafeAreaView } from 'react-navigation';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { ReduxState } from '@modules';
import BandwagonHostAgent from '@modules/cloud/agents/BandwagonHostAgent';
import Message from '../../../../../utils/Message';

interface MigrationProps {
  navigation: NavigationScreenProp<any>;
  refresh: () => Promise<any>;
  migrate: (location: string) => Promise<any>;
  instance: Instance;
  theme: Theme;
}

interface MigrationState {
  refreshing: boolean;
  value: string;
  initialValue: string;
  locations: any[];
}

class Migration extends React.Component<MigrationProps, MigrationState> {
  static headerRight = React.createRef<any>();
  static handleClickHeaderRight: any;
  static navigationOptions: NavigationScreenOptions = {
    title: 'Migration',
    headerBackTitle: ' ',
    headerRight: (
      <HeaderRight
        onClick={() => {
          Migration.handleClickHeaderRight();
        }}
        visible={false}
        title="Switch"
        ref={Migration.headerRight}
      />
    )
  };
  analytics?: RNFirebase.Analytics;
  constructor(props: MigrationProps) {
    super(props);
    this.state = {
      refreshing: false,
      value: '',
      initialValue: '',
      locations: []
    };
    Migration.handleClickHeaderRight = this.handleMigrate;
  }

  componentDidMount() {
    this.handleRefresh();
    this.analytics = firebase.analytics();
    this.analytics.setCurrentScreen('BWG/Migration', 'BWG/Migration.tsx');
  }

  handleMigrate = async () => {
    const { migrate } = this.props;
    const { value, initialValue } = this.state;
    Alert.alert(
      'Migrate to another DC ?',
      `Please back up your data to prevent data loss.`,
      [
        { text: 'Cancel' },
        {
          text: 'Migrate',
          onPress: async () => {
            const email = await await migrate(value);
            Message.info(
              `Migrate to another DC in progress`,
              `From ${initialValue} to ${value} \r\n Once completed, an email notification will be sent to the following address: ${email}.`
            );
          }
        }
      ],
      {
        cancelable: false
      }
    );
  };

  handleRefresh = async () => {
    const { refresh } = this.props;
    this.setState({ refreshing: true });
    const { locations, currentLocation, descriptions } = await refresh();
    this.setState({
      locations: locations.map((location: any) => ({
        id: location,
        title: descriptions[location]
      })),
      value: currentLocation,
      initialValue: currentLocation,
      refreshing: false
    });
    this.handleChange(currentLocation);
  };

  handleChange = async (value: any) => {
    const { initialValue } = this.state;
    this.setState({ value });
    if (initialValue === value) {
      Migration.headerRight.current!.hide();
    } else {
      Migration.headerRight.current!.show();
    }
  };

  render() {
    const { colors } = this.props.theme as Theme;
    const { refreshing, locations, value } = this.state;
    return (
      <SafeAreaView style={styles.container} forceInset={{ bottom: 'never' }}>
        <ScrollView
          style={{ flex: 1 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={this.handleRefresh} tintColor={colors.minor} />
          }
        >
          <List type="radio-group" value={value} isEqual={(l, r) => l === r} onChange={this.handleChange}>
            {locations.map((location: any) => (
              <Item key={location.id} value={location.id}>
                <Note>{location.title}</Note>
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

const mapStateToProps = (state: ReduxState, { navigation }: MigrationProps) => {
  return {};
};

const mapDispatchToProps = (dispatch: Dispatch, { navigation }: MigrationProps) => {
  const value = navigation.getParam('value') as Instance;
  const api = getApi(value.account) as BandwagonHostAgent;
  return {
    async refresh() {
      return await api.instance.getMigrateLocations(value.id);
    },
    async migrate(location: string) {
      await api.instance.migrate(value.id, location);
    },
    instance: value
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withTheme(Migration, false));
