import React from 'react';
import { SafeAreaView, NavigationScreenConfigProps, NavigationScreenOptions } from 'react-navigation';
import { StyleSheet, View, Image, Text, TouchableOpacity, ScrollView } from 'react-native';
import { NavigationScreenProp } from 'react-navigation';
import { connect } from 'react-redux';

import { Dispatch } from 'redux';
import Theme, { withTheme } from '../../../components/Theme';
import { Icon, List, Item } from '../../../components';
import HeaderLeftClose from '../../../components/HeaderLeftClose';
import Card from '../../../components/Card';
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
      callback: (user: User) => {
      }
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
                  onPress={this.next(data.id)}
                  style={{ flexDirection: 'row', height: 120, alignItems: 'center' }}
                >
                  <View style={{ flex: 1, alignItems: 'center' }}>
                    <Image source={data.logo} resizeMode="contain" style={{ width: 50, height: 50 }} />
                  </View>
                  <View style={{ flex: 2 }}>
                    <Text style={[{ lineHeight: 30, color: colors.major }, fonts.title]}>{data.name}</Text>
                    <Text style={[{ lineHeight: 30, color: colors.minor }, fonts.body]}>{data.summary}</Text>
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