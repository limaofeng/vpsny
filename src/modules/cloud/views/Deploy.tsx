import React from 'react';
import { Alert, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NavigationScreenOptions, NavigationScreenProp, SafeAreaView } from 'react-navigation';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { getApi } from '..';
import { Icon, Input, Item, ItemBody, ItemStart, Label, List, Note } from '../../../components';
import BottomRegion from '../../../components/BottomRegion';
import SubmitButton from '../../../components/SubmitButton';
import Theme, { withTheme } from '../../../components/Theme';
import { format, sleep } from '../../../utils';
import Country from '../components/Country';
import { Features, ImageVersion, Plan, Provider, Region, SSHKey, SystemImage } from '../Provider';
import { Account, KeyPair } from '../type';

interface DeployProps {
  navigation: NavigationScreenProp<any>;
  keyPairs: KeyPair[];
  theme: Theme;
  getDefaultRegion: (plan: Plan) => Region | undefined;
  getDefaultImage: () => SystemImage;
  getDefaultPlan: () => Plan;
  getDefaultAccount: () => Account;
  deploy: (
    hostname: string,
    account: Account,
    plan: Plan,
    region: Region,
    image: SystemImage,
    sshkeys: SSHKey[],
    features: Features
  ) => Promise<void>;
}

interface DeployState {
  hostname: string;
  provider: string;
  plan: Plan;
  location?: Region;
  image: SystemImage;
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
  constructor(props: DeployProps) {
    super(props);
    const account = props.getDefaultAccount() as Account;
    const plan = props.getDefaultPlan();
    this.state = {
      hostname: '',
      provider: plan.provider,
      plan,
      location: props.getDefaultRegion(plan),
      image: props.getDefaultImage(),
      account: account,
      sshkeys: [],
      features: []
    };
  }

  componentWillUnmount() {
    this.timer && clearTimeout(this.timer);
  }

  toLocations = () => {
    const { plan, location: value } = this.state;
    this.props.navigation.navigate('Locations', {
      range: plan.regions,
      value,
      callback: (location: Region) => {
        this.setState({ location });
      }
    });
  };

  toImages = () => {
    const { provider, image } = this.state;
    this.props.navigation.navigate('Images', {
      provider,
      value: image,
      callback: (image: SystemImage) => {
        this.setState({ image });
      }
    });
  };

  toSSHKeys = () => {
    const { account, sshkeys } = this.state;
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
        this.setState({ account, sshkeys: [] });
      }
    });
  };

  toPricing = () => {
    const { getDefaultRegion } = this.props;
    const { provider, location, plan } = this.state;
    this.props.navigation.navigate('Pricing', {
      value: plan,
      provider,
      location,
      callback: (plan: Plan) => {
        const state: any = { plan, provider: plan.provider };
        if (!location || !plan.regions.some(id => id === location.id)) {
          state.location = getDefaultRegion(plan);
        }
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
    await deploy(hostname, account, plan, location as Region, image, sshkeys, features);
    this.timer = setTimeout(() => {
      this.timer && clearTimeout(this.timer);
      navigation.goBack();
    }, 1000);
  };

  isKeep(): boolean {
    const { location } = this.state;
    return !location;
  }

  render() {
    const { colors, fonts } = this.props.theme;
    const { provider, location, plan, image, account, sshkeys } = this.state;
    // <LinearGradient
    //   start={{ x: 0, y: 1 }}
    //   end={{ x: 0, y: 0 }}
    //   colors={['#0B4182', '#1e88e5', '#40BAF5']}
    //   style={{ flex: 1 }}
    // >
    // </LinearGradient>
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.backgroundColor }]}>
        <ScrollView>
          <List title="Hostname" style={{ marginTop: 13 }}>
            <Item size={50}>
              <Input onValueChange={this.handleChangeHostname} placeholder="Enter hostname" />
            </Item>
          </List>
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
          <List title="Choose a size">
            <Item size={80} onClick={this.toPricing} push>
              <ItemStart>
                <View style={{ alignItems: 'center' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                    <Icon
                      style={{ marginRight: 2 }}
                      type="FontAwesome"
                      color={colors.primary}
                      name="dollar"
                      size={12}
                    />
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
                    {/*
                    <Item
                      size={20}
                      bodyStyle={{ paddingVertical: 0, paddingLeft: 6, paddingRight: 15, borderBottomWidth: 0 }}
                    >
                      <Icon type="FontAwesome5" color={colors.minor} name="exchange-alt" size={12} />
                      <Note style={{ }}>{plan.bandwidth} GB</Note>
                      <Label style={[fonts.subhead, { textAlign: 'right', marginRight: 15 }]}>Transfer</Label>
                    </Item>
                    */}
                  </List>
                </View>
                <Icon
                  type="FontAwesome"
                  name="angle-right"
                  color={colors.trivial}
                  size={18}
                  style={{ paddingRight: 15 }}
                />
              </ItemBody>
            </Item>
          </List>
          <List title="Choose a region">
            <Item size="medium" push={!!location} onClick={location && this.toLocations}>
              <View style={{ flex: 1, height: 54 }}>
                {location ? (
                  <>
                    <View style={{ height: 30, justifyContent: 'flex-end' }}>
                      <Note style={fonts.callout}>
                        {location.name}
                        <Text style={[{ color: colors.minor }, fonts.caption]}>
                          {'   '}
                          {location.country}
                        </Text>
                      </Note>
                    </View>
                    <View style={{ height: 30, justifyContent: 'center' }}>
                      {provider === 'vultr' && (
                        <Text style={[{ color: colors.minor }, fonts.caption]}>
                          Private Networking, Backups, IPv6
                          {location.providers.find(p => p.type === 'vultr')!.features!.ddosProtection &&
                            ', DDOS Protection'}
                          {location.providers.find(p => p.type === 'vultr')!.features!.blockStorage &&
                            ', Block Storage'}
                        </Text>
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
          {/*
          <Text
            style={[
              { color: colors.minor, paddingHorizontal: 15, paddingVertical: 10, flex: 1, lineHeight: 16 },
              fonts.subhead
            ]}
          >
            Your Droplet Region is the datacenter that your droplet is deployed in
          </Text>
        */}
          <List title="Choose an image">
            <Item size={45} push onClick={this.toImages}>
              <Note>
                {image && (image as SystemImage).name} {image && ((image as SystemImage).version as ImageVersion).name}
              </Note>
            </Item>
          </List>
          {/*
          <Text
            style={[
              { color: colors.minor, paddingHorizontal: 15, paddingVertical: 10, flex: 1, lineHeight: 16 },
              fonts.subhead
            ]}
          >
            This includes Linux distribution images, snapshots, backups, one-click applications, and destroyed Droplet
            images
          </Text>
        */}
          <List title="Choose a account">
            <Item push onClick={this.handleJumpToAccounts}>
              <Note>
                {account.name} - {account.email}
              </Note>
            </Item>
          </List>
          <List title="Add your SSH keys">
            <Item onClick={this.toSSHKeys} push>
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
                  {sshkeys.length && (
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
          <List
            type="multi-choice-circle"
            value={this.state.features || []}
            onChange={this.handleAdditionalFeatures}
            title="Additional Features"
          >
            <Item value="IPv6">
              <Note style={{ color: colors.secondary }}>Enable IPv6</Note>
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
                {location &&
                  location.providers.find(p => p.type === 'vultr')!.features!.ddosProtection && (
                    <Item value="DDOS Protection">
                      <Note style={{ color: colors.secondary }}>Enable DDOS Protection</Note>
                      <View style={[styles.additionalCostContainer, { backgroundColor: colors.primary }]}>
                        <Text
                          style={[styles.additionalCostText, fonts.subhead, { color: colors.backgroundColorDeeper }]}
                        >
                          $10/mo
                        </Text>
                      </View>
                    </Item>
                  )}
                <Item value="Private Networking">
                  <Note style={{ color: colors.secondary }}>Enable Private Networking</Note>
                </Item>
              </>
            )}
          </List>
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
                {location && <Country map value={location.country} size={50} fill={colors.trivial} />}
              </View>
              <View style={{ paddingTop: 25, paddingLeft: 50, justifyContent: 'flex-end' }}>
                <View style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                  <Text style={[{ color: colors.primary }, fonts.title]}>{location && location.name}</Text>
                  <Text style={[{ paddingLeft: 5, color: colors.minor }, fonts.subhead]}>
                    {location && location.country}
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

const mapStateToProps = ({ settings: { keyPairs }, cloud: { accounts, regions, providers, pricing } }: any) => {
  const dregions = regions as Region[];
  const plans = pricing as Plan[];
  const provider = (providers as Provider[]).find(p => p.id === 'vultr') as Provider;
  const iaccounts = accounts as Account[];
  return {
    getDefaultRegion: (plan: Plan) => {
      const regions = dregions.filter(r => r.providers.some(p => p.type === plan.provider));
      if (!regions.length) {
        return undefined;
      }
      let defaultRegion = regions.find(r => r.continent === 'Asia');
      if (!defaultRegion) {
        defaultRegion = regions.find(r => r.continent === 'North America');
      }
      return defaultRegion && regions[regions.length - 1];
    },
    getDefaultPlan: () => {
      return plans.find(plan => plan.provider === 'vultr' && plan.price === 5 && plan.type === 'ssd') as Plan;
    },
    getDefaultImage: () => {
      const image = provider.images.find(image => image.name === 'Ubuntu') as SystemImage;
      image.version = image.versions[image.versions.length - 1];
      return image;
    },
    getDefaultAccount: () => {
      return iaccounts.find(a => a.provider === 'vultr') as Account;
    },
    provider,
    keyPairs,
    accounts
  };
};

const mapDispatchToProps = (dispatch: Dispatch, { navigation }: DeployProps) => {
  return {
    async deploy(
      hostname: string,
      account: Account,
      plan: Plan,
      region: Region,
      image: SystemImage,
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
