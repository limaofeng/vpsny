import React from 'react';
import { SafeAreaView } from 'react-navigation';
import { StyleSheet, ScrollView, Text } from 'react-native';
import { connect } from 'react-redux';


interface CloudProviderProps {
  navigation: any;
  servers: any;
}

class CloudProvider extends React.Component<CloudProviderProps> {
  static navigationOptions = {
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
  };

  view = (id: string) => {
    const { navigation } = this.props;
    navigation.navigate('Information', { id });
  };

  render() {
    const { servers } = this.props;
    return (
      <SafeAreaView style={styles.container}>
        <Text>sdfsdfsdf</Text>
      </SafeAreaView>
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

export default CloudProvider;
