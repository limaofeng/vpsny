import React from 'react';
import { NavigationActions } from 'react-navigation';
import { SafeAreaView, NavigationScreenOptions, NavigationScreenProps } from 'react-navigation';
import { StyleSheet, ScrollView, Text, View, TouchableHighlight } from 'react-native';
import { connect } from 'react-redux';

import Svg from '../../../components/Svg';
import { Dispatch } from 'redux';

interface CloudProviderProps {
  name: string;
}

class CloudProvider extends React.Component<CloudProviderProps> {
  static navigationOptions: NavigationScreenOptions = {
    tabBarVisible: false,
    header: null
  };

  render() {
    const { cloudProviders } = this.props as any;
    return (
      <View style={{ paddingRight: 20, paddingLeft: 10 }}>
        <Svg width={40} height={40} source={require('../assets/logo/vultr.svg')} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundColor,
    paddingLeft: 20,
    paddingRight: 16,
    paddingTop: 13
  },
  scrollAscension: {
    width: 1,
    height: 54
  }
});

const mapStateToProps = () => ({});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  cloudProviders: () => {
    dispatch(NavigationActions.navigate({ routeName: 'CloudProviderList' }));
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(CloudProvider);
