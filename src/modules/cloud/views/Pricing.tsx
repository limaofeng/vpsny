import React from 'react';
import { SafeAreaView, NavigationScreenProp, NavigationScreenOptions } from 'react-navigation';
import {
  StyleSheet,
  ScrollView,
  Text,
  View,
  Picker,
  Dimensions,
  Image,
  TouchableOpacity,
  RefreshControl
} from 'react-native';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { fileSize } from '../../../utils/format';

import { Plan, Region, Provider } from '../Provider';

import { List, Item, Label, Input, Icon, Note } from '../../../components';
import { ItemStart, ItemBody } from '../../../components/Item';
import MultiSelection from '../../../components/MultiSelection';
import Theme, { withTheme } from '../../../components/Theme';
import HeaderRight from '../../../components/HeaderRight';
import { getApi } from '..';
import { sleep } from '../../../utils';

const { Option } = MultiSelection;

interface ToolbarItem {
  id: string;
  name?: string;
  sort?: 'asc' | 'desc';
}
interface ToolbarProps {
  items: ToolbarItem[];
  value?: SortValue;
  onChange: (value: SortValue) => void;
  theme?: Theme;
}

interface SortValue {
  id: string;
  sort: 'asc' | 'desc';
}

interface ToolbarState {
  value?: SortValue;
}

interface SortFieldProps {
  title: string;
  sort?: 'desc' | 'asc';
  onClick: (checked: 'desc' | 'asc') => void;
  theme?: Theme;
}

interface SortFieldState {
  sort?: 'desc' | 'asc';
}

const SortField = withTheme(
  class SortField extends React.Component<SortFieldProps, SortFieldState> {
    constructor(props: SortFieldProps) {
      super(props);
      this.state = { sort: props.sort };
    }
    componentWillReceiveProps(nextProps: SortFieldProps) {
      this.setState({ sort: nextProps.sort });
    }
    handleClick = () => {
      const { onClick } = this.props;
      const sort = this.state.sort === 'asc' ? 'desc' : 'asc';
      this.setState({ sort });
      onClick(sort);
    };
    render() {
      const { colors, fonts } = this.props.theme as Theme;
      const { title } = this.props;
      const { sort } = this.state;
      return (
        <TouchableOpacity style={styles.stortField} onPress={this.handleClick}>
          <Text style={[fonts.headline, { color: sort ? colors.primary : colors.major }]}>{title}</Text>
          <View>
            <FontAwesome5 color={colors.minor} name={'sort'} size={14} style={[{ paddingLeft: 4 }]} />
            {sort && (
              <FontAwesome5
                color={colors.primary}
                name={sort === 'asc' ? 'sort-up' : 'sort-down'}
                size={14}
                style={[{ paddingLeft: 4, position: 'absolute' }]}
              />
            )}
          </View>
        </TouchableOpacity>
      );
    }
  }
);

interface BoxProps {
  children?: any;
  title: string;
  theme?: Theme;
}

const Box = withTheme(function({ children, title, theme }: BoxProps) {
  const { colors, fonts } = theme as Theme;
  return (
    <View
      style={{
        borderBottomColor: colors.minor,
        borderBottomWidth: StyleSheet.hairlineWidth
      }}
    >
      <Text style={[{ paddingVertical: 20, color: colors.major }, fonts.callout]}>{title}</Text>
      {children}
    </View>
  );
});

interface BottomBoxProps {
  children?: any;
  theme?: Theme;
}

const BottomBox = withTheme(function({ children, theme }: BottomBoxProps) {
  const { colors, fonts } = theme as Theme;
  return (
    <View
      style={[
        {
          width: Dimensions.get('window').width,
          backgroundColor: colors.backgroundColor,
          position: 'absolute',
          left: 0,
          bottom: 45,
          height: 60
        }
      ]}
    >
      <View
        style={[
          {
            height: 60,
            backgroundColor: colors.backgroundColor,
            shadowColor: 'rgba(0, 0, 0, 0.04)',
            shadowOffset: {
              width: 0,
              height: -2
            },
            shadowRadius: 6,
            shadowOpacity: 1
          },
          { paddingHorizontal: 20, paddingVertical: 10, paddingBottom: 6 }
        ]}
      >
        {children}
      </View>
    </View>
  );
});

const Toolbar = withTheme(
  class Toolbar extends React.Component<ToolbarProps, ToolbarState> {
    constructor(props: ToolbarProps) {
      super(props);
      this.state = { value: props.value };
    }
    componentWillReceiveProps(nextProps: ToolbarProps) {
      if (nextProps.value !== this.state.value) {
        this.setState({ value: nextProps.value });
      }
    }
    handleClick = (id: string) => (sort: 'asc' | 'desc') => {
      const value = { id, sort };
      this.setState({ value });
      this.props.onChange(value);
    };
    render() {
      const { colors, fonts } = this.props.theme as Theme;
      const { items } = this.props;
      const { value } = this.state;
      return (
        <View
          style={[
            styles.toolbarContainer,
            {
              backgroundColor: colors.backgroundColorDeeper,
              borderBottomColor: colors.minor
            }
          ]}
        >
          {items.map(item => (
            <SortField
              key={`toolbar-item-${item.id}`}
              sort={(value as SortValue).id === item.id ? (value as SortValue).sort : undefined}
              title={item.name as string}
              onClick={this.handleClick(item.id)}
            />
          ))}
          {this.props.children}
        </View>
      );
    }
  }
);

interface Conditions {
  providers: string[];
  regions: Region[];
  prices: number[];
  products: string[];
  soldOut: boolean;
}

type Mode = 'choose' | 'manage';

interface PricingProps {
  navigation: NavigationScreenProp<any>;
  plans: Plan[];
  regions: Region[];
  providers: Provider[];
  mode: Mode;
  value: Plan;
  onChange: (value: Plan) => void;
  theme: Theme;
  refresh: () => void;
}
interface PricingState {
  conditions: Conditions;
  temporary?: Conditions;
  results: Plan[];
  value: Plan;
  provider?: string;
  product?: string;
  region?: number;
  price?: number;
  panel?: boolean;
  sort: SortValue;
  refreshing: boolean;
}
class Pricing extends React.Component<PricingProps, PricingState> {
  static headerRight = React.createRef<any>();
  static handleClickHeaderRight: any;
  static navigationOptions: ({ navigation }: PricingProps) => NavigationScreenOptions = ({
    navigation
  }: PricingProps) => {
    const title = navigation.getParam('callback') ? 'Choose a size' : 'Instance plans';
    return {
      headerTitle: title,
      headerBackTitle: ' ',
      headerRight: (
        <HeaderRight
          onClick={() => {
            Pricing.handleClickHeaderRight();
          }}
          visible={false}
          ref={Pricing.headerRight}
          title="Done"
        />
      )
    };
  };

  constructor(props: PricingProps) {
    super(props);
    const { navigation, plans } = this.props;
    const defaultValue = navigation.getParam('value');
    this.state = {
      results: props.plans.filter(plan => !!plan.regions.length),
      conditions: {
        providers: [],
        regions: [],
        prices: [],
        products: [],
        soldOut: false
      },
      value: plans.find(p => defaultValue && p.id === defaultValue.id) as Plan,
      temporary: undefined,
      provider: 'vultr',
      product: undefined,
      region: undefined,
      price: undefined,
      panel: false,
      sort: { id: 'price', sort: 'asc' },
      refreshing: false
    };
    Pricing.handleClickHeaderRight = this.handleDone;
  }

  view = (id: string) => {
    const { navigation } = this.props;
    navigation.navigate('Information', { id });
  };

  handleChange = async (value: Plan) => {
    this.setState({ value });
    if (this.props.value.id !== value.id) {
      Pricing.headerRight.current.show();
      this.handleDone(value);
    } else {
      Pricing.headerRight.current.hide();
    }
  };

  handleRefresh = async () => {
    const { refresh } = this.props;
    this.setState({ refreshing: true });
    await refresh();
    this.setState({ refreshing: false });
  };

  handleDone = (value?: Plan) => {
    const { onChange } = this.props;
    onChange(value || this.state.value);
  };

  handleSortChange = (sort: SortValue) => {
    this.setState({ sort });
  };

  handleFilterPanel = () => {
    console.log(this.state.conditions);
    this.setState({ panel: !this.state.panel, temporary: this.state.conditions });
  };

  handleCleanPanel = () => {
    this.setState({ panel: false, temporary: undefined });
  };

  createSubItem = (icon: any, value: string, label: string, show?: boolean) => {
    const {
      theme: { colors, fonts }
    } = this.props;
    return (
      <Item size={20} bodyStyle={{ paddingVertical: 0, paddingLeft: 6, paddingRight: 15, borderBottomWidth: 0 }}>
        {icon}
        <Note style={fonts.subhead}>{value}</Note>
        <Label style={[fonts.subhead, { textAlign: 'right' }]}>{label}</Label>
      </Item>
    );
  };

  createItem = (plan: Plan) => {
    const {
      theme: { colors, fonts }
    } = this.props;
    const {
      sort: { id }
    } = this.state;
    return (
      <Item key={`plan_item_${plan.id}`} size={105} value={plan}>
        <ItemStart>
          <View style={{ alignItems: 'center' }}>
            {id === 'price' && (
              <>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                  <Icon style={{ marginRight: 2 }} type="FontAwesome" color={colors.primary} name="dollar" size={12} />
                  <Text style={[{ lineHeight: 35, color: colors.primary, marginRight: 8 }, fonts.huge]}>
                    {plan.price}
                  </Text>
                  )}
                </View>
                <Text style={[{ color: colors.primary }, fonts.caption]}>USD</Text>
              </>
            )}
            {id === 'memory' && (
              <>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                  <Text style={[{ lineHeight: 35, color: colors.primary }, fonts.huge]}>
                    {fileSize(plan.ram, 'MB', { finalUnit: 'GB', mode: 'hide' })}
                  </Text>
                </View>
                <Text style={[{ color: colors.primary }, fonts.caption]}>GB</Text>
              </>
            )}
            {id === 'processing' && (
              <>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                  <Text style={[{ lineHeight: 35, color: colors.primary }, fonts.huge]}>{plan.vcpu}</Text>
                </View>
                <Text style={[{ color: colors.primary }, fonts.caption]}>
                  {' '}
                  vCPU
                  {plan.vcpu > 1 ? 's' : ''}
                </Text>
              </>
            )}
            {id === 'storage' && (
              <>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                  <Text style={[{ lineHeight: 35, color: colors.primary }, fonts.huge]}>{plan.disk}</Text>
                </View>
                <Text style={[{ color: colors.primary }, fonts.caption]}>GB</Text>
              </>
            )}
          </View>
        </ItemStart>
        <ItemBody>
          <View style={{ width: Dimensions.get('window').width - 105 - 40, flexDirection: 'column' }}>
            <List style={{ marginBottom: 0, backgroundColor: 'transparent' }}>
              {id !== 'price' &&
                this.createSubItem(
                  <Icon type="FontAwesome" color={colors.minor} name="dollar" size={12} />,
                  String(plan.price),
                  'Price per month'
                )}
              {id !== 'memory' &&
                this.createSubItem(
                  <Icon type="Feather" color={colors.minor} name="cpu" size={12} />,
                  `${plan.vcpu} vCPU${plan.vcpu > 1 ? 's' : ''}`,
                  'CPU'
                )}
              {id !== 'processing' &&
                this.createSubItem(
                  <Icon type="FontAwesome5" color={colors.minor} name="microchip" size={12} />,
                  plan.ram + ' MB',
                  'RAM'
                )}
              {id !== 'storage' &&
                this.createSubItem(
                  <Icon type="MaterialCommunityIcons" color={colors.minor} name="harddisk" size={14} />,
                  `${plan.disk} GB`,
                  'SSD'
                )}
              {this.createSubItem(
                <Icon type="FontAwesome5" color={colors.minor} name="exchange-alt" size={12} />,
                `${plan.bandwidth} GB`,
                'Transfer'
              )}
            </List>
          </View>
        </ItemBody>
      </Item>
    );
  };

  handleProviderChange = (values: string[]) => {
    const { temporary } = this.state;
    (temporary as Conditions).providers = values;
    this.setState({ temporary });
  };

  handleeRegionChange = (values: Region[]) => {
    const { temporary } = this.state;
    (temporary as Conditions).regions = values;
    this.setState({ temporary });
  };

  handlePriceChange = (values: number[]) => {
    const { temporary } = this.state;
    (temporary as Conditions).prices = values;
    this.setState({ temporary });
  };

  handleProductChange = (values: string[]) => {
    const { temporary } = this.state;
    (temporary as Conditions).products = values;
    this.setState({ temporary });
  };

  handleeShowSoldOutChange = (values: boolean[]) => {
    const { temporary } = this.state;
    (temporary as Conditions).soldOut = !!values.length;
    this.setState({ temporary });
  };

  handleClanConditions = () => {
    this.setState({
      temporary: {
        providers: [],
        regions: [],
        prices: [],
        products: [],
        soldOut: false
      }
    });
  };

  handleFiltering = () => {
    const { plans } = this.props;
    const { temporary } = this.state;
    const { providers, prices, products, regions, soldOut } = temporary as Conditions;
    let results = plans;
    if (providers.length) {
      results = results.filter(plan => providers.some(p => p === plan.provider));
    }

    if (prices.length) {
      results = results.filter(plan => prices.some(p => p === plan.price));
    }

    if (products.length) {
      results = results.filter(plan => products.some(p => p === plan.type));
    }

    if (!soldOut) {
      results = results.filter(plan => !!plan.regions.length);
    }

    if (regions.length) {
      results = results.filter(plan => regions.some(r => plan.regions.some(x => x === r.id)));
    }

    this.setState({ results, panel: false, conditions: temporary as Conditions, temporary: undefined });
  };

  sorting = (l: Plan, r: Plan) => {
    const {
      sort: { id, sort }
    } = this.state;
    let val = 0;
    switch (id) {
      case 'price':
        val = l.price - r.price;
        break;
      case 'memory':
        val = l.ram - r.ram;
        break;
      case 'processing':
        val = l.vcpu - r.vcpu;
        break;
      case 'storage':
        val = l.disk - r.disk;
        break;
      default:
        val = l.price - r.price;
    }
    return sort === 'asc' ? val : -val;
  };

  render() {
    const {
      theme: { colors, fonts }
    } = this.props;
    const { provider: providerId, sort, temporary, results: plans, value } = this.state;
    const conditions = temporary as Conditions;
    const location: Region = this.props.navigation.getParam('location');
    // const provider: Provider = this.props.navigation.getParam('provider');
    const { regions, providers } = this.props;
    const { products, prices } = providers.find(p => p.id === providerId) as Provider;

    //  && plan.regions.some(r => r === location.id)
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.backgroundColor }]}>
        <Toolbar
          value={sort}
          onChange={this.handleSortChange}
          items={[
            { id: 'price', name: 'Price' },
            { id: 'memory', name: 'Memory' },
            { id: 'processing', name: 'Processing' },
            { id: 'storage', name: 'Storage' }
          ]}
        >
          <TouchableOpacity onPress={this.handleFilterPanel}>
            <Text style={{ paddingRight: 20 }}>
              <Ionicons color={this.state.panel ? colors.primary : colors.minor} name="ios-funnel" size={14} />
            </Text>
          </TouchableOpacity>
        </Toolbar>
        {this.state.panel && (
          <View
            style={{
              top: 40,
              height: Dimensions.get('window').height - 100,
              width: Dimensions.get('window').width,
              backgroundColor: colors.backgroundColorDeeper,
              position: 'absolute',
              zIndex: 100
            }}
          >
            <View style={{ paddingLeft: 20, height: Dimensions.get('window').height - 210 }}>
              <ScrollView>
                <Box title="Cloud Provider">
                  <MultiSelection values={conditions.providers} onChange={this.handleProviderChange}>
                    <Option key={`multi-option-providers-vultr`} value="vultr" name="Vultr" />
                  </MultiSelection>
                </Box>
                <Box title="Region">
                  <MultiSelection values={conditions.regions} onChange={this.handleeRegionChange}>
                    {regions.map(item => (
                      <Option key={`multi-option-regions-${item.id}`} value={item} name={item.name} />
                    ))}
                  </MultiSelection>
                </Box>
                <Box title="Pricing">
                  <MultiSelection values={conditions.prices} onChange={this.handlePriceChange}>
                    {prices.map(price => (
                      <Option key={`multi-option-prices-${price}`} value={price} name={`$${price}`} />
                    ))}
                  </MultiSelection>
                </Box>
                <Box title="Pricing">
                  <MultiSelection values={conditions.products} onChange={this.handleProductChange}>
                    {products.map(product => (
                      <Option key={`multi-option-products-${product}`} checked value={product} name={product} />
                    ))}
                  </MultiSelection>
                </Box>
                <Box title="Show Temporarily Sold Out">
                  <MultiSelection values={[conditions.soldOut]} onChange={this.handleeShowSoldOutChange}>
                    <Option key={`multi-option-show-soldOut`} value={true} name="Yes" />
                  </MultiSelection>
                </Box>
              </ScrollView>
            </View>
            <BottomBox>
              <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity
                  style={[styles.buttonContainer, { marginRight: 7, backgroundColor: colors.backgroundColor }]}
                  onPress={this.handleClanConditions}
                >
                  <Text style={[styles.buttonText, { color: colors.minor }, fonts.callout]}>Reset</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.buttonContainer, { marginLeft: 7, backgroundColor: colors.primary }]}
                  onPress={this.handleFiltering}
                >
                  <Text style={[styles.buttonText, { color: colors.backgroundColorDeeper }, fonts.callout]}>
                    Search
                  </Text>
                </TouchableOpacity>
              </View>
            </BottomBox>
          </View>
        )}
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={this.handleRefresh}
              tintColor={colors.minor}
            />
          }
        >
          <List value={value} valueKey="id" type="radio-group" onChange={this.handleChange}>
            {plans.sort(this.sorting).map(plan => this.createItem(plan))}
          </List>
        </ScrollView>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  toolbarContainer: {
    height: 40,
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    paddingLeft: 10
  },
  stortField: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  scrollAscension: {
    width: 1,
    height: 54
  },
  buttonContainer: {
    height: 39,
    flex: 1,
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 2
  },
  buttonText: {
    width: 82,
    textAlign: 'center',
    fontWeight: 'bold'
  }
});

const mapStateToProps = ({ cloud: { pricing: plans, regions, providers } }: any, { navigation }: PricingProps) => {
  const onChange = navigation.getParam('callback');
  const value = navigation.getParam('value');
  const mode: Mode = !!onChange ? 'choose' : 'manage';
  return {
    plans: plans.sort((l: Plan, r: Plan) => l.price - r.price),
    regions,
    providers,
    mode,
    value,
    onChange: (value: Plan) => {
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
      const pricing = await api.pricing();
      dispatch({ type: 'cloud/pricing', payload: pricing });
    }
  };
};
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withTheme(Pricing, false));
