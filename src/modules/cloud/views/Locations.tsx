import { AppState } from '@modules';
import React from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NavigationScreenOptions, NavigationScreenProp, SafeAreaView } from 'react-navigation';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { getApi } from '..';
import { Item, List } from '../../../components';
import HeaderRight from '../../../components/HeaderRight';
import { ItemBody, ItemStart } from '../../../components/Item';
import { ItemDivider, ItemGroup } from '../../../components/List';
import Theme, { withTheme } from '../../../components/Theme';
import Country from '../components/Country';
import { Region } from '../Provider';
import { ProviderType } from '../type';
import firebase, { RNFirebase } from 'react-native-firebase';

type Mode = 'choose' | 'manage';

interface LocationsProps {
  navigation: NavigationScreenProp<any>;
  regions: Region[];
  refresh: () => void;
  mode: Mode;
  value: Region;
  onChange: (value: Region) => void;
  getCountryName: (id: string) => string;
  theme: Theme;
}

const continents = ['Asia', 'North America', 'Europe', 'Australia'];

interface LocationsState {
  refreshing: boolean;
  value: Region;
}
class Locations extends React.Component<LocationsProps, LocationsState> {
  static headerRight = React.createRef<any>();
  static handleClickHeaderRight: any;
  static navigationOptions: ({ navigation }: LocationsProps) => NavigationScreenOptions = ({
    navigation
  }: LocationsProps) => {
    const title = navigation.getParam('callback') ? 'Choose a region' : 'Instance regions';
    return {
      headerTitle: title,
      headerBackTitle: ' ',
      headerRight: (
        <HeaderRight
          onClick={() => {
            Locations.handleClickHeaderRight();
          }}
          visible={false}
          ref={Locations.headerRight}
          title="Done"
        />
      )
    };
  };
  analytics?: RNFirebase.Analytics;

  constructor(props: LocationsProps) {
    super(props);
    this.state = {
      refreshing: false,
      value: props.value
    };
    Locations.handleClickHeaderRight = this.handleDone;
  }

  componentDidMount() {
    this.analytics = firebase.analytics();
    this.analytics.setCurrentScreen('Regions', 'Regions.tsx');
  }

  handleChange = (value: Region) => {
    this.setState({ value });
    if (!this.props.value || this.props.value.id !== value.id) {
      Locations.headerRight.current.show();
      this.handleDone(value);
    } else {
      Locations.headerRight.current.hide();
    }
  };
  handleDone = (value?: Region) => {
    const { onChange } = this.props;
    onChange(value || this.state.value);
  };
  handleRefresh = async () => {
    const { refresh } = this.props;
    this.setState({ refreshing: true });
    await refresh();
    this.setState({ refreshing: false });
  };

  static getFeatureText(region: Region) {
    const defaultTxt = 'Private Networking, Backups, IPv6';
    /*     if (ddosProtection || blockStorage) {
      return (
        'Also ' +
        (ddosProtection ? 'DDOS Protection' : '') +
        (ddosProtection && blockStorage ? ',' : '') +
        (blockStorage ? ' Block Storage' : '')
      );
    } */
    return defaultTxt;
  }

  render() {
    const { colors, fonts } = this.props.theme;
    const { regions, navigation } = this.props;
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.backgroundColor }]}>
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={this.handleRefresh}
              tintColor={colors.minor}
            />
          }
        >
          <List
            type="radio-group"
            value={this.state.value}
            valueKey="id"
            onChange={this.handleChange}
            style={{ marginTop: 13 }}
          >
            {continents.map(name => {
              const currentRegions = regions.filter(region => region.continent === name);
              return (
                currentRegions.length && (
                  <ItemGroup key={`regions_group_${name}`}>
                    <ItemDivider>{name}</ItemDivider>
                    {currentRegions.map(region => (
                      <Item key={`regions_${region.id}`} size="medium" value={region}>
                        <ItemStart style={{ width: 100 }}>
                          <Country value={region.country} size={60} />
                        </ItemStart>
                        <ItemBody style={{ flexDirection: 'row' }}>
                          <View style={{ flex: 1 }}>
                            <View style={{ height: 30, justifyContent: 'flex-end' }}>
                              <Text style={[{ color: colors.major }, fonts.callout]}>{region.name}</Text>
                            </View>
                            <View style={{ height: 30, justifyContent: 'center' }}>
                              <Text style={[{ color: colors.minor }, fonts.caption]}>
                                {Locations.getFeatureText(region)}
                              </Text>
                            </View>
                          </View>
                        </ItemBody>
                      </Item>
                    ))}
                  </ItemGroup>
                )
              );
            })}
          </List>
        </ScrollView>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});

const mapStateToProps = ({ database: { regions, countrys } }: AppState, { navigation }: LocationsProps) => {
  const onChange = navigation.getParam('callback');
  const value = navigation.getParam('value');
  const provider = navigation.getParam('provider') as ProviderType;
  const range = navigation.getParam('range') as number[];
  const mode: Mode = !!onChange ? 'choose' : 'manage';
  return {
    regions: regions.filter(region => region.provider === provider),
    mode,
    range,
    value,
    onChange: (value: Region) => {
      if (!onChange) {
        return;
      }
      onChange(value);
      navigation.goBack();
    },
    getCountryName: (id: string) => {
      const country = countrys.find(country => country.id === id);
      return country ? country.name : id;
    }
  };
};
const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    async refresh() {
      dispatch({ type: 'database/fetchRegions' });
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withTheme(Locations, false));
