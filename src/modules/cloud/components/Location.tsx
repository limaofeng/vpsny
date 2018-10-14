import React from 'react';
import { SafeAreaView, NavigationScreenOptions } from 'react-navigation';
import { StyleSheet, ScrollView, Text, View, Image } from 'react-native';
import { connect } from 'react-redux';

import { Region } from '../Provider';
import Country from './Country';

interface LocationProps {
  data: Region;
}

class Location extends React.Component<LocationProps> {
  render() {
    const { data } = this.props;
    return (
      <View style={[styles.container, { paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center' }]}>
        <Country map value={data.country} size={30} />
        <Country value={data.country} size={25} />
        <View style={{ paddingHorizontal: 5, flex: 1 }}>
          <Text style={[fonts.normal, { textAlign: 'center', fontWeight: 'bold' }]}>{data.name}</Text>
          <Text style={[fonts.minimum, { textAlign: 'center' }]}> {data.country} </Text>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  city: {
    color: colors.backgroundColor
  },
  scrollAscension: {
    width: 1,
    height: 54
  }
});

/*
Servers.navigationOptions = {
  title: 'Servers',
  headerStyle: {
    backgroundColor: colors.backgroundColor,
    height: 140 - 44,
    borderBottomWidth: 0
  },
  headerTintColor: colors.backgroundColor,
  headerLeft: undefined,
  headerTitleStyle: {
    flex: 1,
    position: 'relative',
    textAlign: 'left',
    marginTop: 50,
    marginLeft: 14,
    letterSpacing: 0.4,
    fontWeight: 'bold',
    color: '#000000',
    height: 52,
    fontSize: 34
  }
};*/

export default Location;
