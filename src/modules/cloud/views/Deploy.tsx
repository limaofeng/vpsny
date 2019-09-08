import { ReduxState } from '@modules';
import React from 'react';
import { Alert, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NavigationScreenOptions, NavigationScreenProp, SafeAreaView } from 'react-navigation';
import { connect, Provider } from 'react-redux';
import { Dispatch } from 'redux';

import { getApi } from '../index';
import { Icon, Input, Item, ItemBody, ItemStart, Label, List, Note } from '../../../components';
import BottomRegion from '../../../components/BottomRegion';
import SubmitButton from '../../../components/SubmitButton';
import Theme, { withTheme } from '../../../components/Theme';
import { format, sleep } from '../../../utils';
import Country from '../components/Country';
import { Features, ImageVersion, Plan, Region, SSHKey, SystemImage } from '../Provider';
import { Account, KeyPair, ProviderType } from '../type';
import { IBundle, IRegion, IBlueprint } from '@modules/database/type';
import { CloudManager } from '../providers';

interface DeployProps {
  navigation: NavigationScreenProp<any>;
  keyPairs: KeyPair[];
  theme: Theme;
  bundles: any[];
  blueprints: any[];
  regions: any[];
  getDefaultRegion: (provider: ProviderType) => IRegion;
  getDefaultImage: (provider: ProviderType) => IBlueprint;
  getDefaultPlan: (provider: ProviderType, region: IRegion) => IBundle;
  getDefaultAccount: () => Account;
  getCountryName: (id: string) => string;
  deploy: (
    hostname: string,
    account: Account,
    plan: IBundle,
    region: IRegion,
    image: IBlueprint,
    sshkeys: SSHKey[],
    features: Features
  ) => Promise<void>;
}

interface DeployState {
  hostname: string;
  provider: string;
  plan: IBundle;
  location?: IRegion;
  image: IBlueprint;
  account: Account;
  sshkeys: SSHKey[];
  features: string[];
}

class Deploy extends React.Component<DeployProps, DeployState> {
  static navigationOptions: NavigationScreenOptions = {
    headerTitle: 'Deploy',
    headerBackTitle: ' '
  };
  timer?: NodeJS.Timer;
  analytics?: RNFirebase.Analytics;
  constructor(props: DeployProps) {
    super(props);
    const account = props.getDefaultAccount() as Account;
    const provider = account != null ? account.provider : 'vultr';
    const region = props.getDefaultRegion(provider);
    const plan = props.getDefaultPlan(provider, region);
    this.state = {
      hostname: '',
      provider,
      plan,
      location: region,
      image: props.getDefaultImage(provider),
      account: account,
      sshkeys: [],
      features: []
    };
  }

  componentDidMount() {
    this.analytics = firebase.analytics();
    this.analytics.setCurrentScreen('Deploy', 'Deploy.tsx');
  }

  componentWillUnmount() {
    this.timer && clearTimeout(this.timer);
  }

  toLocations = () => {
    const { location: value, provider } = this.state;
    this.props.navigation.navigate('Locations', {
      provider,
      value,
      callback: (location: IRegion) => {
        this.setState({ location });
      }
    });
  };

  toImages = () => {
    const { provider, image } = this.state;
    this.props.navigation.navigate('Images', {
      provider,
      value: image,
      callback: (image: IBlueprint) => {
        this.setState({ image });
      }
    });
  };

  toSSHKeys = () => {
    const { account, sshkeys } = this.state;
    if (!account) {
      return;
    }
    this.props.navigation.navigate('SSHPublicKeys', {
      data: account,
      values: sshkeys,
      callback: (sshkeys: SSHKey[]) => {
        this.setState({ sshkeys });
      }
    });
  };

  handleJumpToAccounts = () => {
    const { provider, account } = this.state;
    this.props.navigation.navigate('AccountList', {
      provider,
      value: account,
      callback: (account: Account) => {
        this.setState({ account, sshkeys: [], provider });
      }
    });
  };

  toPricing = () => {
    const { provider, location, plan } = this.state;
    this.props.navigation.navigate('Pricing', {
      value: plan,
      provider,
      region: location,
      callback: (plan: IBundle) => {
        const state: any = { plan, provider: plan.provider };
        this.setState(state);
      }
    });
  };

  view = (id: string) => {
    const { navigation } = this.props;
    navigation.navigate('Information', { id });
  };

  handleCleanSSHKey = () => {
    this.setState({ sshkeys: [] });
  };

  handleChangeHostname = (value: string) => {
    this.setState({ hostname: value });
  };

  handleAdditionalFeatures = (values: string[]) => {
    this.setState({ features: values });
  };

  handleDeploy = async () => {
    const { deploy, navigation } = this.props;
    const { hostname, account, plan, location, image, sshkeys, features: afs } = this.state;
    if (!location) {
      Alert.alert('Error', 'No available region', [{ text: 'OK', onPress: () => console.log('OK Pressed') }], {
        cancelable: false
      });
      return;
    }
    const features: Features = {
      PrivateNetwork: afs.indexOf('Private Networking') != -1,
      DDOSProtection: afs.indexOf('DDOS Protection') != -1,
      IPv6: afs.indexOf('IPv6') != -1,
      AutoBackups: afs.indexOf('Auto Backups') != -1
    };
    await deploy(hostname, account, plan, location, image, sshkeys, features);
    this.timer = setTimeout(() => {
      this.timer && clearTimeout(this.timer);
      navigation.goBack();
    }, 1000);
  };

  isKeep(): boolean {
    const { location } = this.state;
    return !location;
  }

  renderAccount = () => {
    const { account } = this.state;
    return (
      <List title="Choose a account" style={{ marginTop: 13 }}>
        <Item push onClick={this.handleJumpToAccounts}>
          {account ? (
            <Note>
              {account.provider.toUpperCase()} - {account.email}
            </Note>
          ) : (
            <Note> Only Vultr is supported </Note>
          )}
        </Item>
      </List>
    );
  };
  renderRegion = () => {
    const { colors, fonts } = this.props.theme;
    const { getCountryName } = this.props;
    const { provider, location } = this.state;
    return (
      <List title="Choose a region">
        <Item
          testID="servers-deploy-choose-region"
          size="medium"
          push={!!location}
          onClick={location && this.toLocations}
        >
          <View style={{ flex: 1, height: 54 }}>
            {location ? (
              <>
                <View style={{ height: 30, justifyContent: 'flex-end' }}>
                  <Note style={fonts.callout}>
                    {location.name}
                    <Text style={[{ color: colors.minor }, fonts.caption]}>
                      {'   '}
                      {getCountryName(location.country)}
                    </Text>
                  </Note>
                  <Text />
                </View>
                <View style={{ height: 30, justifyContent: 'center' }}>
                  {provider === 'vultr' && (
                    <Text style={[{ color: colors.minor }, fonts.caption]}>Private Networking, Backups, IPv6</Text>
                  )}
                </View>
              </>
            ) : (
              <>
                <View style={{ flex: 1, justifyContent: 'center' }}>
                  <Note style={fonts.callout}>No available region</Note>
                </View>
              </>
            )}
          </View>
        </Item>
      </List>
    );
  };

  renderImage = () => {
    const { image } = this.state;
    return (
      <List title="Choose an image">
        <Item testID="servers-deploy-choose-image" size={45} push onClick={this.toImages}>
          <Note>
            {image && (image as SystemImage).name} {image && ((image as SystemImage).version as ImageVersion).name}
          </Note>
        </Item>
      </List>
    );
  };

  renderSize = () => {
    const { colors, fonts } = this.props.theme;
    const { plan } = this.state;
    return (
      <List title="Choose a size">
        <Item testID="servers-deploy-choose-size" size={80} onClick={this.toPricing} push>
          <ItemStart>
            <View style={{ alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                <Icon style={{ marginRight: 2 }} type="FontAwesome" color={colors.primary} name="dollar" size={12} />
                <Text style={[{ lineHeight: 35, color: colors.primary, marginRight: 8 }, fonts.huge]}>
                  {plan.price}
                </Text>
              </View>
              <Text style={[{ color: colors.primary }, fonts.caption]}>USD</Text>
            </View>
          </ItemStart>
          <ItemBody>
            <View style={{ flex: 1, flexDirection: 'column' }}>
              <List style={{ marginBottom: 0, backgroundColor: 'transparent' }}>
                <Item
                  size={20}
                  bodyStyle={{ paddingVertical: 0, paddingLeft: 6, paddingRight: 15, borderBottomWidth: 0 }}
                >
                  <Icon type="Feather" color={colors.minor} name="cpu" size={12} />
                  <Note style={fonts.subhead}>
                    {plan.vcpu} vCPU {plan.vcpu > 1 && 's'}
                  </Note>
                  <Label style={[fonts.subhead, { textAlign: 'right', marginRight: 15 }]}>CPU</Label>
                </Item>
                <Item
                  size={20}
                  bodyStyle={{ paddingVertical: 0, paddingLeft: 6, paddingRight: 15, borderBottomWidth: 0 }}
                >
                  <Icon type="FontAwesome5" color={colors.minor} name="microchip" size={12} />
                  <Note style={fonts.subhead}>{plan.ram} MB</Note>
                  <Label style={[fonts.subhead, { textAlign: 'right', marginRight: 15 }]}>RAM</Label>
                </Item>
                <Item
                  size={20}
                  bodyStyle={{ paddingVertical: 0, paddingLeft: 6, paddingRight: 15, borderBottomWidth: 0 }}
                >
                  <Icon type="MaterialCommunityIcons" color={colors.minor} name="harddisk" size={14} />
                  <Note style={fonts.subhead}>{plan.disk} GB</Note>
                  <Label style={[fonts.subhead, { textAlign: 'right', marginRight: 15 }]}>SSD</Label>
                </Item>
              </List>
            </View>
            <Icon type="FontAwesome" name="angle-right" color={colors.trivial} size={18} style={{ paddingRight: 15 }} />
          </ItemBody>
        </Item>
      </List>
    );
  };
  renderPublicKey = () => {
    const { colors } = this.props.theme;
    const { sshkeys } = this.state;
    return (
      <List title="Add your SSH keys">
        <Item testID="servers-deploy-choose-sshkeys" onClick={this.toSSHKeys} push>
          <View style={{ flexDirection: 'column', flex: 1 }}>
            <View style={[{ flexDirection: 'row', alignItems: 'center', flex: 1 }]}>
              <View pointerEvents="box-only" style={{ flex: 1, flexDirection: 'column' }}>
                <Input
                  style={{ height: 24 }}
                  placeholder="New SSH Key or Choose keys"
                  editable={false}
                  clearButtonMode="always"
                  value={
                    !sshkeys.length
                      ? undefined
                      : sshkeys.length === 1
                      ? sshkeys[0].name
                      : `${sshkeys[0].name} and ${sshkeys.length - 1} other`
                  }
                />
              </View>
              {!!sshkeys.length && (
                <TouchableOpacity onPress={this.handleCleanSSHKey} activeOpacity={1}>
                  <Icon
                    type="Ionicons"
                    style={{ marginTop: 2, marginRight: 10 }}
                    color={colors.trivial}
                    size={17}
                    name="ios-close-circle"
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Item>
      </List>
    );
  };

  renderFeatures = () => {
    const { colors, fonts } = this.props.theme;
    const { getCountryName } = this.props;
    const { location, plan } = this.state;
    return (
      <List
        type="multi-choice-circle"
        value={this.state.features || []}
        onChange={this.handleAdditionalFeatures}
        title="Additional Features"
      >
        <Item value="private_networking" visible={false}>
          <Note style={{ color: colors.secondary }}>Private networking</Note>
        </Item>
        <Item value="backups" visible={false}>
          <Note style={{ color: colors.secondary }}>Backups</Note>
        </Item>
        <Item value="ipv6" visible={false}>
          <Note style={{ color: colors.secondary }}>IPv6</Note>
        </Item>
        <Item value="install_agent" visible={false}>
          <Note style={{ color: colors.secondary }}>Monitoring</Note>
        </Item>
        {plan.type !== 'baremetal' && (
          <>
            {plan.type === 'ssd' && (
              <Item value="Auto Backups">
                <Note style={{ color: colors.secondary }}>Enable Auto Backups</Note>
                <View style={[styles.additionalCostContainer, { backgroundColor: colors.primary }]}>
                  <Text style={[styles.additionalCostText, fonts.subhead, { color: colors.backgroundColorDeeper }]}>
                    {format.usMoney((plan.price / 10) * 2)}
                    /mo
                  </Text>
                </View>
              </Item>
            )}
            <Item visible={false} value="DDOS Protection">
              <Note style={{ color: colors.secondary }}>Enable DDOS Protection</Note>
              <View style={[styles.additionalCostContainer, { backgroundColor: colors.primary }]}>
                <Text style={[styles.additionalCostText, fonts.subhead, { color: colors.backgroundColorDeeper }]}>
                  $10/mo
                </Text>
              </View>
            </Item>
            <Item value="Private Networking" bodyStyle={{ borderBottomWidth: 0 }}>
              <Note style={{ color: colors.secondary }}>Enable Private Networking</Note>
            </Item>
          </>
        )}
      </List>
    );
  };
  renderNodeInfo = () => {
    return (
      <List title="Hostname">
        <Item size={45}>
          <Input onValueChange={this.handleChangeHostname} placeholder="Enter hostname" />
        </Item>
      </List>
    );
  };
  render() {
    const { colors, fonts } = this.props.theme;
    const { getCountryName } = this.props;
    const { location, plan } = this.state;
    // <LinearGradient
    //   start={{ x: 0, y: 1 }}
    //   end={{ x: 0, y: 0 }}
    //   colors={['#0B4182', '#1e88e5', '#40BAF5']}
    //   style={{ flex: 1 }}
    // >
    // </LinearGradient>
    return (
      <SafeAreaView
        forceInset={{ bottom: 'never' }}
        style={[styles.container, { backgroundColor: colors.backgroundColor }]}
      >
        <ScrollView>
          {this.renderAccount()}
          {/*
          <Text
            style={[
              { color: colors.minor, paddingHorizontal: 15, paddingVertical: 10, flex: 1, lineHeight: 16 },
              fonts.subhead
            ]}
          >
            The Droplet name is what this Droplet is called in the DigitalOcean system, and is also the original
            hostname of the server
          </Text>
          */}
          {this.renderRegion()}
          {this.renderImage()}
          {this.renderSize()}
          {this.renderPublicKey()}
          {this.renderFeatures()}
          {this.renderNodeInfo()}
        </ScrollView>
        <BottomRegion height={125} backgroundColor={colors.backgroundColorDeeper}>
          <View style={{ flexDirection: 'row', paddingVertical: 10, paddingLeft: 20 }}>
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  {
                    textAlign: 'left',
                    color: colors.minor
                  },
                  fonts.subhead
                ]}
              >
                Summary
              </Text>
              <View style={{ marginTop: 5, flexDirection: 'row', alignItems: 'flex-end' }}>
                <Text style={[{ color: colors.primary, top: 4 }, fonts.huge, { fontWeight: 'normal' }]}>
                  {plan.price}
                </Text>
                <Text style={[{ color: colors.primary, top: 1 }, fonts.title]}>/mo</Text>
                <Text style={[{ paddingLeft: 5, color: colors.minor }, fonts.subhead]}>($ 0.08/hr)</Text>
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ position: 'absolute' }}>
                {location && <Country map value={location.country} size={60} fill={colors.trivial} />}
              </View>
              <View style={{ paddingTop: 25, paddingLeft: 50, justifyContent: 'flex-end' }}>
                <View style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                  <Text style={[{ color: colors.primary }, fonts.title]}>{location && location.name}</Text>
                  <Text style={[{ paddingLeft: 5, color: colors.minor }, fonts.subhead]}>
                    {location && getCountryName(location.country)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
          <View style={{ width: Dimensions.get('window').width - 40 }}>
            <SubmitButton
              disabled={this.isKeep()}
              onSubmit={this.handleDeploy}
              title="Deploy Now"
              submittingText="Deploying"
              doneText="Deployed"
            />
          </View>
        </BottomRegion>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  additionalCostContainer: {
    paddingVertical: 2,
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 2
  },
  additionalCostText: {
    fontWeight: 'bold'
  }
});

const mapStateToProps = ({
  settings: { keyPairs },
  cloud: { accounts },
  database: { bundles, blueprints, regions, countrys }
}: ReduxState) => {
  return {
    getDefaultRegion: (provider: ProviderType) => {
      return regions.find(r => r.provider === provider) as IRegion;
    },
    getDefaultPlan: (provider: ProviderType, region: IRegion) => {
      return bundles.find(
        plan =>
          plan.provider === provider && plan.type! === 'ssd' && plan.requirements.regions.some(id => id == region.id)
      ) as IBundle;
    },
    getDefaultImage: (provider: ProviderType) => {
      return blueprints.find(
        blueprint => blueprint.provider === provider && blueprint.type === 'os' && blueprint.family === 'ubuntu'
      ) as IBlueprint;
    },
    getDefaultAccount: () => {
      const providers = CloudManager.getProviders()
        .filter(p => p.features.deploy)
        .map(p => p.id);
      return accounts.find(a => providers.some(p => p === a.provider)) as Account;
    },
    keyPairs,
    getCountryName: (id: string) => {
      const country = countrys.find(country => country.id === id);
      return country ? country.name : id;
    },
    accounts
  };
};

const mapDispatchToProps = (dispatch: Dispatch, { navigation }: DeployProps) => {
  return {
    async deploy(
      hostname: string,
      account: Account,
      plan: IBundle,
      region: IRegion,
      image: IBlueprint,
      sshkeys: SSHKey[],
      features: Features
    ): Promise<void> {
      const api = getApi(account.id);
      const id = await api.deploy(hostname, plan, region, image, sshkeys, features);
      const node = await api.instance.get(id);
      dispatch({ type: 'cloud/instance', payload: { operate: 'insert', instance: node } });
      await sleep(500);
      dispatch({ type: 'cloud/track', payload: { node } });
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withTheme(Deploy, false));

{
  /*
                    <Item
                      size={20}
                      bodyStyle={{ paddingVertical: 0, paddingLeft: 6, paddingRight: 15, borderBottomWidth: 0 }}
                    >
                      <Icon type="FontAwesome5" color={colors.minor} name="exchange-alt" size={12} />
                      <Note style={{ }}>{plan.bandwidth} GB</Note>
                      <Label style={[fonts.subhead, { textAlign: 'right', marginRight: 15 }]}>Transfer</Label>
                    </Item>
                    */
}
{
  /*
          <Text
            style={[
              { color: colors.minor, paddingHorizontal: 15, paddingVertical: 10, flex: 1, lineHeight: 16 },
              fonts.subhead
            ]}
          >
            Your Droplet Region is the datacenter that your droplet is deployed in
          </Text>
        */
}
{
  /*
          <Text
            style={[
              { color: colors.minor, paddingHorizontal: 15, paddingVertical: 10, flex: 1, lineHeight: 16 },
              fonts.subhead
            ]}
          >
            This includes Linux distribution images, snapshots, backups, one-click applications, and destroyed Droplet
            images
          </Text>
        */
}
