import { Card, HeaderLeftClose, Theme, withTheme } from '@components';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  NavigationScreenConfigProps,
  NavigationScreenOptions,
  NavigationScreenProp,
  SafeAreaView
} from 'react-navigation';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { User } from '../Agent';

interface CloudProviderProps {
  navigation: NavigationScreenProp<any>;
  servers: any;
  theme?: Theme;
}

class CloudProvider extends React.Component<CloudProviderProps> {
  static navigationOptions = ({ navigation }: NavigationScreenConfigProps): NavigationScreenOptions => {
    return {
      headerTitle: 'Connect to Provider',
      headerLeft: (
        <HeaderLeftClose
          testID="close-newaccount"
          onPress={() => {
            navigation.pop();
          }}
        />
      ),
      headerBackTitle: 'Back'
    };
  };

  next = (provider: string) => () => {
    const { navigation } = this.props;
    navigation.navigate('AccountNew', {
      provider,
      callback: (user: User) => {}
    });
  };

  render() {
    const { colors, fonts } = this.props.theme as Theme;
    const { back } = this.props as any;
    const providers = [
      {
        id: 'vultr',
        logo: require('../assets/logo/vultr.png'),
        name: 'Vultr',
        summary: 'Global Cloud Hosting'
      },
      {
        id: 'digitalocean',
        logo: require('../assets/logo/digitalocean.png'),
        name: 'DigitalOcean',
        summary: 'The simplest cloud platform for developers & teams'
      },
      {
        id: 'lightsail',
        logo: require('../assets/logo/lightsail.png'),
        name: 'Lightsail',
        summary: 'Now available worldwide'
      }
    ];
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.backgroundColor }]}>
        <ScrollView>
          <View
            style={{
              height: 32,
              marginTop: 13,
              justifyContent: 'center',
              paddingLeft: 16,
              paddingRight: 5
            }}
          >
            <Text style={[{ color: colors.minor }, fonts.headline]}>Choose your server provider</Text>
          </View>
          <View style={{ flex: 1, alignItems: 'center' }}>
            {providers.map(data => (
              <Card key={data.id}>
                <TouchableOpacity
                  accessibilityTraits="button"
                  testID={`newaccount-choose-provider-${data.id}`}
                  onPress={this.next(data.id)}
                  style={{ flexDirection: 'row', height: 120, alignItems: 'center' }}
                >
                  <View style={{ flex: 1, alignItems: 'center' }}>
                    <Image source={data.logo} resizeMode="contain" style={{ width: 50, height: 50 }} />
                  </View>
                  <View style={{ flex: 2 }}>
                    <Text style={[{ lineHeight: 30, color: colors.major }, fonts.title]}>{data.name}</Text>
                    <Text style={[{ lineHeight: 17, color: colors.minor }, fonts.body]}>{data.summary}</Text>
                  </View>
                </TouchableOpacity>
              </Card>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  providerContainer: {
    marginTop: 10,
    paddingHorizontal: 20,
    marginHorizontal: 15,
    borderRadius: 4,
    shadowOffset: {
      width: 0,
      height: 1
    },
    height: 100,
    shadowRadius: 6,
    shadowOpacity: 1,
    alignItems: 'center'
  }
});

const mapStateToProps = () => ({});

const mapDispatchToProps = (dispatch: Dispatch) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withTheme(CloudProvider, false));
