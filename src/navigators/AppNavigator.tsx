import { merge } from 'lodash';
import * as React from 'react';
import { Dimensions, TouchableOpacity } from 'react-native';
import {
  createBottomTabNavigator,
  createStackNavigator,
  NavigationScreenConfigProps,
  NavigationScreenOptions,
  NavigationScreenProp,
} from 'react-navigation';

import { Icon, IconType } from '../components';
import SideMenu from '../components/SideMenu';
import { defaultTheme } from '../components/Theme';
import modules from '../modules';
import { format } from '../utils';

const { colors } = defaultTheme;

const {
  AccountList,
  AccountNew,
  AccountView,
  BindHost,
  Catalog,
  ChooseProvider,
  Deploy,
  Images,
  Instances,
  Locations,
  Pricing,
  Profile,
  ServerEdit,
  Servers,
  ServiceNew,
  Services,
  Settings,
  Sidebar,
  SSHConnect,
  SSHKeyList,
  SSHPublicKeys,
  SSHKeyView,
  AWSRegions,
  Terminal,
  ...routes
} = merge.apply(undefined, modules.routes);

console.log('Routes', Object.keys(routes));

// const server = StackNavigator(
//   { Servers, Deploy },
//   {
//     headerMode: 'float'
//   }
// );

/*
hosts - x
apps - 蛇皮肤的六变形
settings - 眼镜蛇的蛇头
*/
const tabConfigs: { [key: string]: { title: string; icon: { type?: IconType; name: string } } } = {
  store: { title: 'Store', icon: { type: 'FontAwesome5', name: 'cubes' } },
  apps: { title: 'Apps', icon: { name: 'apps' } },
  server: { title: 'Servers', icon: { name: 'hosts' } },
  settings: { title: 'More', icon: { name: 'cobra' } }
};

const tabs = createBottomTabNavigator(
  {
    // apps: Services,
    server: Instances
  },
  {
    initialRouteName: 'server',
    navigationOptions: ({ navigation }) => {
      const { routeName } = navigation.state;
      const { title, icon } = tabConfigs[routeName];
      return {
        title,
        tabBarIcon: ({ tintColor }) => {
          return (
            <Icon
              style={{ marginTop: 8 }}
              type={icon.type}
              name={icon.name}
              size={24}
              color={tintColor || colors.primary}
            />
          );
        }
      };
    },
    tabBarOptions: {
      activeTintColor: colors.primary,
      inactiveTintColor: colors.minor,
      style: {
        backgroundColor: colors.backgroundColorDeeper,
        borderTopWidth: 0,
        shadowColor: format.color(colors.trivial, 'rgba', 0.4),
        shadowOffset: {
          width: 0,
          height: 0
        },
        shadowRadius: 6,
        shadowOpacity: 1
      },
      showLabel: true
    }
  }
);

const Stack = createStackNavigator(
  {
    tabs: {
      screen: tabs,
      navigationOptions: ({ navigation }: NavigationScreenConfigProps): NavigationScreenOptions => {
        const index = navigation.state.index;
        const routeName = (navigation.state as any).routes[index].routeName;
        const tab = tabConfigs[routeName];
        return {
          headerTitle: tab.title,
          headerLeft: (
            <TouchableOpacity
              accessibilityTraits="button"
              testID="toggle-sidebar"
              onPress={() => {
                const openMeun = navigation.getParam('openMenu');
                openMeun && openMeun();
              }}
              style={{ width: 44, height: 44, justifyContent: 'center', alignItems: 'center', marginLeft: 10 }}
            >
              <Icon type="Ionicons" name="md-menu" size={28} color={defaultTheme.colors.primary} />
            </TouchableOpacity>
          )
        };
      }
    },
    // 服务器
    BindHost,
    ServerEdit,
    Catalog,
    // Services,
    ServiceNew,
    // VPS Deploy
    Deploy,
    Locations,
    Pricing,
    Images,
    SSHPublicKeys,
    SSHKeyView,
    // Account
    AccountList,
    // AccountNew: {
    //   screen: createSwitchNavigator(
    //     {
    //       ChooseProvider,
    //       AccountNewNext: AccountNew
    //     },
    //     {
    //       initialRouteName: 'ChooseProvider'
    //     }
    //   )
    // },
    Instances,
    // SSHPublicKeys,
    ...routes
  },
  {
    initialRouteName: 'tabs',
    navigationOptions: {
      headerStyle: {
        backgroundColor: colors.backgroundColorDeeper
      }
    }
  }
);

const TerminalAlias = createStackNavigator(
  {
    XTerm: { screen: Terminal },
    SSHConnect: { screen: SSHConnect },
    SSHKeyList,
    SSHKeyView
  },
  {
    initialRouteName: 'XTerm',
    headerMode: 'screen',
    navigationOptions: {
      headerStyle: {
        backgroundColor: colors.backgroundColorDeeper
      }
    }
  }
);

interface ApplicationProps {
  navigation: NavigationScreenProp<any>;
}

class Application extends React.Component<ApplicationProps> {
  static router = Stack.router;
  state = {
    side: true
  };
  timer?: NodeJS.Timer;
  componentDidMount() {
    // const { navigation } = this.props;
    // this.timer = setInterval(() => {
    //   const { routes } = navigation.state;
    //   const side = routes.length === 1;
    //   if (side !== this.state.side) {
    //     this.setState({ side });
    //   }
    //   console.log('侧边栏是否可用', side, routes);
    // }, 500);
  }
  componentWillUnmount() {
    this.timer && clearInterval(this.timer);
  }
  side = React.createRef<SideMenu>();
  toggleSidebar = (open: boolean) => {
    const side = this.side.current as SideMenu;
    side.openMenu(open);
  };
  render() {
    const { navigation } = this.props;
    const menu = <Sidebar openMenu={this.toggleSidebar} navigation={navigation} />;
    const tabs = navigation.state.routes[0];
    tabs.params = {
      openMenu: () => {
        this.toggleSidebar(true);
      }
    };
    return (
      <SideMenu
        ref={this.side}
        disableGestures={() => {
          const { routes } = navigation.state;
          return routes.length > 1;
        }}
        openMenuOffset={Dimensions.get('window').width * 0.88}
        menu={menu}
      >
        <Stack navigation={navigation} />
      </SideMenu>
    );
  }
}

export default createStackNavigator(
  {
    Stack: { screen: Application },
    Terminal: { screen: TerminalAlias },
    AccountNew: {
      screen: createStackNavigator(
        {
          ChooseProvider,
          AccountNew
        },
        {
          initialRouteName: 'ChooseProvider',
          headerMode: 'screen',
          navigationOptions: {
            headerStyle: {
              backgroundColor: colors.backgroundColorDeeper
            }
          }
        }
      )
    },
    KeyPairs: {
      screen: createStackNavigator(
        {
          SSHKeyList,
          SSHKeyView
        },
        {
          initialRouteName: 'SSHKeyList',
          headerMode: 'screen',
          navigationOptions: {
            headerStyle: {
              backgroundColor: colors.backgroundColorDeeper
            }
          }
        }
      )
    },
    Settings: {
      screen: createStackNavigator(
        {
          Settings,
          AccountView,
          KeyPairs: {
            screen: SSHKeyList
          },
          AWSRegions,
          SSHKeyView
        },
        {
          initialRouteName: 'Settings',
          headerMode: 'screen',
          navigationOptions: {
            headerStyle: {
              backgroundColor: colors.backgroundColorDeeper
            }
          }
        }
      )
    },
    SSHPublicKeys: {
      screen: createStackNavigator(
        {
          SSHPublicKeys,
          KeyPairs: {
            screen: SSHKeyList
          },
          SSHKeyView
        },
        {
          initialRouteName: 'SSHPublicKeys',
          headerMode: 'screen',
          navigationOptions: {
            headerStyle: {
              backgroundColor: colors.backgroundColorDeeper
            }
          }
        }
      )
    }
  },
  {
    mode: 'modal',
    headerMode: 'none',
    initialRouteName: 'Stack'
  }
);
