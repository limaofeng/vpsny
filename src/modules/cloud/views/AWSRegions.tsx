import { HeaderLeftClose, HeaderRight, Item, ItemDivider, ItemGroup, List, Note, Theme, withTheme } from '@components';
import { ReduxState } from '@modules';
import React from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import Spinner from 'react-native-spinkit';
import { NavigationScreenOptions, NavigationScreenProp, SafeAreaView } from 'react-navigation';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import KeyPairNewBut from '../../settings/components/KeyPairNewBut';
import { RegionProvider, SSHKey } from '../Provider';
import { KeyPair } from '../type';

interface SSHPublicKeysProps {
  navigation: NavigationScreenProp<any>;
  regions: RegionProvider[];
  values: SSHKey[];
  refresh: () => Promise<void>;
  deleteSSHKey: (id: string) => Promise<void>;
  updateSSHKey: (id: string, keyPair: KeyPair) => Promise<void>;
  uploadSSHKey: (keyPair: KeyPair) => Promise<void>;
  onChange: (value: SSHKey[]) => void;
  theme: Theme;
}

interface SSHPublicKeysState {
  refreshing: boolean;
  values: SSHKey[];
}

class SSHPublicKeys extends React.Component<SSHPublicKeysProps, SSHPublicKeysState> {
  static headerRight = React.createRef<any>();
  static handleClickHeaderRight: any;
  static navigationOptions: ({ navigation }: SSHPublicKeysProps) => NavigationScreenOptions = ({
    navigation
  }: SSHPublicKeysProps) => {
    const title = navigation.getParam('callback') ? 'Choose keys' : 'SSH Keys';
    const dangerous = navigation as any;
    const options: NavigationScreenOptions = {
      headerTitle: title,
      headerRight: (
        <HeaderRight
          onClick={() => {
            SSHPublicKeys.handleClickHeaderRight();
          }}
          visible={false}
          ref={SSHPublicKeys.headerRight}
          title="Done"
        />
      )
    };
    if (dangerous.dangerouslyGetParent().state.routeName === 'SSHPublicKeys') {
      options.headerLeft = (
        <HeaderLeftClose
          onPress={() => {
            navigation.pop();
          }}
        />
      );
    }
    return options;
  };
  static defaultProps = {};
  constructor(props: SSHPublicKeysProps) {
    super(props);
    SSHPublicKeys.handleClickHeaderRight = this.handleDone;
    this.state = { refreshing: false };
  }
  loading = () => {
    const {
      theme: { colors }
    } = this.props;
    return (
      <View style={styles.iconContainer}>
        <Spinner isVisible size={18} type="Arc" color={colors.primary} />
      </View>
    );
  };
  handleRefresh = async () => {
    const { refresh } = this.props;
    this.setState({ refreshing: true });
    await refresh();
    this.setState({ refreshing: false });
  };
  handleChoose = (values: SSHKey[]) => {
    this.setState({ values: values });
    if (values.length > 0) {
      SSHPublicKeys.headerRight.current.show();
      this.handleDone(values);
    } else {
      SSHPublicKeys.headerRight.current.hide();
    }
  };
  handleDone = (values?: SSHKey[]) => {
    const { onChange } = this.props;
    onChange(values || this.state.values);
  };
  render() {
    const { colors } = this.props.theme!;
    const { regions } = this.props;
    // data.providers.find(p => p.type === 'lightsail')!.name!
    const groups = [
      {
        name: 'US East',
        regions: regions.filter(({ id }) => id.startsWith('us-east')
        )
      },
      {
        name: 'US West',
        regions: regions.filter(({ id }) => id.startsWith('us-west')
        )
      },
      {
        name: 'Asia Pacific',
        regions: regions.filter(({ id }) => id.startsWith('ap'))
      },
      {
        name: 'Canada',
        regions: regions.filter(({ id }) => id.startsWith('ca'))
      },
      {
        name: 'Europe',
        regions: regions.filter(({ id }) => id.startsWith('eu'))
      },
      {
        name: 'South America',
        regions: regions.filter(({ id }) => id.startsWith('sa'))
      }
    ];
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
            type="multi-choice"
            onChange={this.handleChoose}
            value={this.state.values}
            isEqual={(left, right) => left.id === right.id}
            style={{ marginTop: 13 }}
          >
            {groups.filter(g => g.regions.length).map(({ name, regions }) => (
              <ItemGroup key={name}>
                <ItemDivider>{name}</ItemDivider>
                {regions.map(data => (
                  <Item key={`region-${data.id}`} value={data}>
                    <Note>{data.state} ({data.availabilityZones!.length})</Note>
                  </Item>
                ))}
              </ItemGroup>
            ))}
          </List>
        </ScrollView>
        <KeyPairNewBut />
      </SafeAreaView>
    );
  }
}

const mapStateToProps = ({ cloud: { regions } }: ReduxState, { navigation }: SSHPublicKeysProps) => {
  const choose = !!navigation.getParam('callback');
  const values = navigation.getParam('values') || [];
  return {
    values,
    regions: regions.filter(reg => reg.providers.some(p => p.type === 'lightsail')).map(reg => reg.providers.find(p => p.type === 'lightsail')),
    onChange: (value: SSHKey[]) => {
      if (!choose) {
        return;
      }
      navigation.getParam('callback')(value);
      navigation.goBack();
    }
  };
};

const mapDispatchToProps = (dispatch: Dispatch, { navigation }: SSHPublicKeysProps) => {
  return {};
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withTheme(SSHPublicKeys, false));

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  iconContainer: { height: 24, width: 44, alignItems: 'center', justifyContent: 'center' }
});
