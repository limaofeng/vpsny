import React from 'react';
import { SafeAreaView, NavigationScreenProp, NavigationScreenOptions } from 'react-navigation';
import { StyleSheet, Text, View, ScrollView, RefreshControl } from 'react-native';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';

import { Region } from '../Provider';
import Country from '../components/Country';

import { List, Item, Label, Input, Icon, Note } from '../../../components';
import { ItemStart, ItemBody } from '../../../components/Item';
import { ItemGroup, ItemDivider } from '../../../components/List';
import Theme, { withTheme } from '../../../components/Theme';
import HeaderRight from '../../../components/HeaderRight';
import { getApi } from '..';

type Mode = 'choose' | 'manage';

interface LocationsProps {
  navigation: NavigationScreenProp<any>;
  regions: Region[];
  refresh: () => void;
  mode: Mode;
  value: Region;
  onChange: (value: Region) => void;
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

  constructor(props: LocationsProps) {
    super(props);
    this.state = {
      refreshing: false,
      value: props.value
    };
    Locations.handleClickHeaderRight = this.handleDone;
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

  static getFeatureText({ features: { ddosProtection, blockStorage } }: Region) {
    const defaultTxt = 'Private Networking, Backups, IPv6';
    if (ddosProtection || blockStorage) {
      return (
        'Also ' +
        (ddosProtection ? 'DDOS Protection' : '') +
        (ddosProtection && blockStorage ? ',' : '') +
        (blockStorage ? ' Block Storage' : '')
      );
    }
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
                          <Country value={region.country} size={30} />
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

const mapStateToProps = ({ cloud: { regions } }: any, { navigation }: LocationsProps) => {
  const onChange = navigation.getParam('callback');
  const value = navigation.getParam('value');
  const range = navigation.getParam('range');
  const mode: Mode = !!onChange ? 'choose' : 'manage';
  return {
    regions: regions.filter((region: Region) => range.includes(region.id)),
    mode,
    range,
    value,
    onChange: (value: Region) => {
      if (!onChange) {
        return;
      }
      onChange(value);
      navigation.goBack();
    }
  };
};
const mapDispatchToProps = (dispatch: Dispatch) => {
  const api = getApi('vultr');
  return {
    async refresh() {
      const regions = await api.regions();
      dispatch({ type: 'cloud/regions', payload: regions });
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withTheme(Locations, false));
