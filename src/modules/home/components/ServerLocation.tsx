import React from 'react';
import PropTypes from 'prop-types';
import LinearGradient from 'react-native-linear-gradient';
import { View, StyleSheet, Text, TouchableWithoutFeedback, Image } from 'react-native';
import { isEqual } from 'lodash';

import TabView from './TabView';

const countryNames = {
  JP: 'Japan',
  SG: 'Singapore',
  NL: 'Netherlands',
  FR: 'France',
  DE: 'Germany',
  GB: 'UnitedKingdom',
  US: 'UnitedStates',
  AU: 'Australia'
};

const countryImages = {
  JP: <Image width={36} source={require('../assets/images/country/Japan.png')} />,
  SG: <Image width={36} source={require('../assets/images/country/Singapore.png')} />,
  NL: <Image width={36} source={require('../assets/images/country/Netherlands.png')} />,
  FR: <Image width={36} source={require('../assets/images/country/France.png')} />,
  DE: <Image width={36} source={require('../assets/images/country/Germany.png')} />,
  GB: <Image width={36} source={require('../assets/images/country/UnitedKingdom.png')} />,
  US: <Image width={36} source={require('../assets/images/country/UnitedStates.png')} />,
  AU: <Image width={36} source={require('../assets/images/country/Australia.png')} />
};

class Container extends React.Component {
  static propTypes = {
    children: PropTypes.any.isRequired,
    checked: PropTypes.bool.isRequired,
    soldOut: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired
  };
  render() {
    const { children, checked, onChange, soldOut } = this.props;
    if (soldOut) {
      return (
        <View style={[styles.locationContainer, soldOut && styles.locationContainerTemporarilySoldOut]}>
          {children}
        </View>
      );
    }
    if (!checked) {
      return (
        <TouchableWithoutFeedback onPress={onChange}>
          <View style={[styles.locationContainer, soldOut && styles.locationContainerTemporarilySoldOut]}>
            {children}
          </View>
        </TouchableWithoutFeedback>
      );
    }
    return (
      <LinearGradient
        start={{ x: 0.0, y: 0.25 }}
        end={{ x: 0.5, y: 0.0 }}
        locations={[0.1, 0.3, 1.2]}
        colors={['#3762A1', '#3E6CB0', '#65A0DF']}
        style={[styles.locationContainer, soldOut && styles.locationContainerTemporarilySoldOut]}
      >
        {children}
      </LinearGradient>
    );
  }
}

export class ServerLocationItem extends React.Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    country: PropTypes.string.isRequired,
    checked: PropTypes.bool,
    soldOut: PropTypes.bool,
    onChange: PropTypes.func
  };
  static defaultProps = {
    soldOut: false,
    checked: false,
    onChange: () => {}
  };
  shouldComponentUpdate(nextProps) {
    return !isEqual(nextProps, this.props);
  }
  handleChange = () => {
    const { id } = this.props;
    this.props.onChange(id);
  };
  render() {
    const { name, country, soldOut, checked } = this.props;
    const iconComponent = checked ? (
      <View
        style={{
          backgroundColor: '#518AD8',
          borderRadius: 15,
          width: 30,
          height: 30,
          padding: 5
        }}
      >
      {/*<MaterialIcons name="check" size={20} color="#fff" />*/}
      </View>
    ) : (
      countryImages[country]
    );
    return (
      <Container checked={checked} onChange={this.handleChange} soldOut={soldOut}>
        <View style={{ width: 45, alignItems: 'center', justifyContent: 'center' }}>{iconComponent}</View>
        <View style={{ padding: 10 }}>
          <Text style={[styles.city, soldOut && { opacity: 0.8 }, checked && styles.selected]}>{name}</Text>
          <Text style={[styles.country, soldOut && { opacity: 0.6 }, checked && styles.selected]}>
            {countryNames[country]}
          </Text>
          {soldOut && <Text style={styles.soldOut}>Temporarily Sold Out</Text>}
        </View>
      </Container>
    );
  }
}

const navigationState = {
  index: 0,
  routes: [
    { key: 'all', title: 'All Locations', continents: ['North America', 'Europe', 'Asia', 'Australia'] },
    { key: 'america', title: 'America', continents: ['North America'] },
    { key: 'europe', title: 'Europe', continents: ['Europe'] },
    { key: 'asia', title: 'Asia', continents: ['Asia'] },
    { key: 'australia', title: 'Australia', continents: ['Australia'] }
  ]
};

const locationComponents = {};

const loadLocationComponents = (regions, current) =>
  regions.filter(data => current.continents.includes(data.continent)).map(data => {
    if (!locationComponents[data.key]) {
      locationComponents[data.key] = <ServerLocationItem key={data.key} {...data} />;
    }
    return locationComponents[data.key];
  });

export default class ServerLocation extends React.Component {
  static propTypes = {
    regions: PropTypes.array.isRequired,
    onChange: PropTypes.func,
    value: PropTypes.string
  };
  static defaultProps = {
    onChange: () => {},
    availables: [],
    value: null
  };
  constructor(props) {
    super(props);
    this.state = { current: navigationState.routes[0], value: props.value };
  }
  handleChange = route => {
    this.setState({ current: route });
  };
  handleValueChange = value => {
    const { onChange } = this.props;
    this.setState({ value });
    onChange(value);
  };
  render() {
    const { regions } = this.props;
    const { current, value } = this.state;
    return (
      <TabView key="location-tabs" routes={navigationState.routes} onChange={this.handleChange}>
        <View style={[styles.container, { flexDirection: 'row', flexWrap: 'wrap' }]}>
          {loadLocationComponents(regions, current).map(component =>
            React.cloneElement(component, {
              checked: value === component.props.id,
              onChange: this.handleValueChange,
              soldOut: regions.find(({ id }) => id === component.props.id).soldOut
            })
          )}
        </View>
      </TabView>
    );
  }
}

const styles = StyleSheet.create({
  linearGradient: {
    flex: 1,
    paddingLeft: 15,
    paddingRight: 15,
    borderRadius: 5
  },
  container: {
    flex: 1,
    backgroundColor: '#F3F3F3',
    paddingLeft: 30,
    paddingBottom: 10
  },
  locationContainer: {
    backgroundColor: colors.backgroundColor,
    width: 158,
    height: 42,
    borderRadius: 4,
    shadowColor: 'rgba(0, 0, 0, 0.04)',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowRadius: 6,
    shadowOpacity: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginRight: 10,
    paddingLeft: 10
  },
  selected: {
    color: '#FFFFFF'
  },
  city: {
    height: 14,
    fontFamily: 'Raleway',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'left',
    color: colors.charcoalGrey
  },
  country: {
    height: 10,
    opacity: 0.8,
    fontFamily: 'Raleway',
    fontSize: 9,
    textAlign: 'left',
    color: '#616366'
  },
  soldOut: {
    height: 10,
    opacity: 0.9,
    fontFamily: 'Raleway',
    fontSize: 9,
    textAlign: 'left',
    color: '#616366'
  },
  locationContainerTemporarilySoldOut: {
    backgroundColor: '#f8f8f8'
  }
});
