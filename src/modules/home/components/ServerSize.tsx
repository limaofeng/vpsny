import React from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet, Text, ScrollView, TouchableWithoutFeedback } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { isEqual } from 'lodash';

const Format = {};

class PlanContainer extends React.Component {
  static propTypes = {
    children: PropTypes.any.isRequired,
    soldOut: PropTypes.any.isRequired,
    checked: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired
  };
  render() {
    const { children, soldOut, checked, onChange } = this.props;
    if (soldOut) {
      return <View style={[styles.planContainer, soldOut && styles.planContainerTemporarilySoldOut]}>{children}</View>;
    }
    if (!checked) {
      return (
        <TouchableWithoutFeedback onPress={onChange}>
          <View style={[styles.planContainer, soldOut && styles.planContainerTemporarilySoldOut]}>{children}</View>
        </TouchableWithoutFeedback>
      );
    }
    return (
      <LinearGradient
        start={{ x: 0.0, y: 0.25 }}
        end={{ x: 0.5, y: 0.0 }}
        locations={[0.1, 0.3, 1.2]}
        colors={['#3762A1', '#3E6CB0', '#65A0DF']}
        style={[styles.planContainer, soldOut && styles.planContainerTemporarilySoldOut]}
      >
        {children}
      </LinearGradient>
    );
  }
}

export class ServerPlan extends React.Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
    soldOut: PropTypes.bool,
    bandwidth: PropTypes.number.isRequired,
    price: PropTypes.number.isRequired,
    ram: PropTypes.number.isRequired,
    type: PropTypes.string.isRequired,
    disk: PropTypes.number.isRequired,
    vcpu: PropTypes.number.isRequired,
    checked: PropTypes.bool,
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
    console.log(' server size -> ', this.props.id);
    const { soldOut, bandwidth, vcpu, price, ram, disk, type, checked } = this.props;
    const hourly = Format.number(price / 30 / 24, '0.000');
    return (
      <View>
        {soldOut && (
          <Text style={[styles.soldOut, { position: 'absolute', left: 34.5, top: 5, zIndex: 10 }]}>
            Temporarily Sold Out
          </Text>
        )}
        <PlanContainer checked={checked} soldOut={soldOut} onChange={this.handleChange}>
          <Text style={[styles.storage, checked && styles.fontWhite]}>
            {disk} GB {type}
          </Text>
          <Text style={[styles.monthly, checked && styles.fontWhite]}>
            ${price} <Text style={styles.monthlyMark}>/mo</Text>
          </Text>
          <Text style={[styles.hourly, checked && styles.fontWhite]}>${hourly}/h</Text>,
          <View style={[styles.separator]} />,
          <Text style={[styles.name, checked && styles.fontWhite]}>
            <Text style={[styles.value, checked && styles.fontWhite]}>{vcpu}</Text> CPU
          </Text>
          <Text style={[styles.name, checked && styles.fontWhite]}>
            <Text style={[styles.value, checked && styles.fontWhite]}>{ram}MB</Text> Memory
          </Text>
          <Text style={[styles.name, checked && styles.fontWhite]}>
            <Text style={[styles.value, checked && styles.fontWhite]}>{bandwidth}GB</Text> Bandwidth
          </Text>
        </PlanContainer>
      </View>
    );
  }
}

const planComponents = {};

const loadPlanComponents = plans =>
  plans.filter(({ type }) => type === 'SSD').map(({ key, ...data }) => {
    if (!planComponents[key]) {
      planComponents[key] = <ServerPlan key={key} {...data} />;
    }
    return planComponents[key];
  });

class ServerSize extends React.Component {
  static propTypes = {
    plans: PropTypes.array.isRequired,
    value: PropTypes.string,
    onChange: PropTypes.func
  };
  static defaultProps = {
    onChange: () => {},
    region: null,
    value: null
  };
  constructor(props) {
    super(props);
    this.state = { value: props.value };
  }
  componentWillReceiveProps(nextProps) {
    const { value } = nextProps;
    if (value !== this.props.value) {
      this.setState({ value });
    }
  }
  handleValueChange = value => {
    const { onChange } = this.props;
    this.setState({ value });
    onChange(value);
  };
  render() {
    const { value } = this.state;
    const { plans } = this.props;
    return (
      <View style={{ height: 160 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.container}>
          <View style={{ flex: 1, flexDirection: 'row', paddingRight: 40 }}>
            {loadPlanComponents(plans).map(component =>
              React.cloneElement(component, {
                checked: value === component.props.id,
                onChange: this.handleValueChange,
                soldOut: plans.find(({ id }) => id === component.props.id).soldOut
              })
            )}
            {/*
            <ServerPlan soldOut />
            <ServerPlan />
            <ServerPlan />
            */}
          </View>
        </ScrollView>
      </View>
    );
  }
}

export default ServerSize;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F3F3',
    paddingLeft: 30,
    height: 160
  },
  planContainer: {
    width: 158,
    height: 140,
    borderRadius: 4,
    backgroundColor: colors.backgroundColor,
    shadowColor: 'rgba(0, 0, 0, 0.04)',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowRadius: 6,
    shadowOpacity: 1,
    marginTop: 10,
    marginRight: 10,
    paddingTop: 14
  },
  planContainerTemporarilySoldOut: {
    backgroundColor: '#f8f8f8',
    opacity: 0.75
  },
  soldOut: {
    width: 89,
    padding: 1.5,
    backgroundColor: '#8f8f8f',
    fontFamily: 'Raleway',
    fontSize: 8,
    fontWeight: '600',
    textAlign: 'center',
    color: '#fff'
  },
  storage: {
    fontFamily: 'Raleway',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#363b40'
  },
  monthly: {
    marginTop: 5,
    fontFamily: 'Raleway-SemiBold',
    fontSize: 16,
    textAlign: 'center',
    color: colors.primary
  },
  monthlyMark: {
    fontFamily: 'Raleway',
    fontSize: 12
  },
  hourly: {
    marginTop: 2,
    fontFamily: 'Raleway',
    fontSize: 9,
    textAlign: 'center',
    color: '#9b9b9b'
  },
  value: {
    fontFamily: 'Raleway-SemiBold',
    fontSize: 12,
    textAlign: 'center',
    opacity: 1,
    color: '#616366'
  },
  name: {
    marginBottom: 3,
    textAlign: 'center',
    fontFamily: 'Raleway',
    fontSize: 11,
    opacity: 0.7,
    color: '#616366'
  },
  separator: {
    width: 158,
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#c8c7cc',
    marginTop: 10,
    marginBottom: 5
  },
  fontWhite: {
    color: '#ffffff'
  }
});
