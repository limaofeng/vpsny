import React from 'react';
import { connect } from 'react-redux';
import { StyleSheet, TouchableWithoutFeedback, ScrollView, View, Dimensions, Text } from 'react-native';

import { union } from 'lodash';

import TabView from '../components/TabView';
import CheckBox from '../../../components/CheckBox';
import LabelTextInput from '../../../components/LabelTextInput';

import { DeployStepTitle } from '../components/DeployStepTitle';
import ServerLocation from '../components/ServerLocation';
import ServerType from '../components/ServerType';
import ServerSize from '../components/ServerSize';
import SSHKeys from '../../cloud/views/SSHPublicKeys';

import format from '../../../utils/format';

const background = {
  height: 120,
  backgroundColor: colors.backgroundColor,
  shadowColor: 'rgba(0, 0, 0, 0.04)',
  shadowOffset: {
    width: 0,
    height: -2
  },
  shadowRadius: 6,
  shadowOpacity: 1
};

interface DeployFormProps {
  plans: any[];
  regions: any[];
  operatingSystems: any[];
  applications: any[];
  sshkeys: any[];
  dispatch: any;
}

class DeployForm extends React.Component<DeployFormProps> {
  state = {
    region: '6',
    plan: '200',
    type: {
      type: 'x64',
      value: '127'
    }
  };
  handleValueCaches = {};
  handleValue = name => {
    if (!this.handleValueCaches[name]) {
      this.handleValueCaches[name] = value => {
        this.setState({ [name]: value });
      };
    }
    return this.handleValueCaches[name];
  };
  handleDeploy = () => {
    const { dispatch } = this.props;
    dispatch({ type: 'deploy/deploy', payload: this.state });
  };
  render() {
    const { regions, operatingSystems, applications, plans, sshkeys } = this.props;
    // <DeployStep title step="4" title="Additional Features" />
    //       <DeployStepTitle step="5" title="Startup Script" />
    //       <DeployStepTitle step="6" title="SSH Keys" />
    //       <DeployStepTitle step="7" title="Server Hostname & Label" />
    // <ServerLocation />
    // <ServerType />
    const availables = union(...plans.filter(({ type }) => type === 'SSD').map(({ regions }) => regions.split(',')));
    const allRegions = regions.map(data => ({ ...data, soldOut: !availables.includes(data.id) }));
    if (
      allRegions.length &&
      (!this.state.region && allRegions.some(({ id, soldOut }) => id === this.state.region && soldOut))
    ) {
      this.state.region = allRegions.find(({ soldOut }) => !soldOut).id;
    }
    const allPlans = plans.map(data => ({
      ...data,
      soldOut: !data.regions.includes(this.state.region)
    }));
    if (
      allPlans.length &&
      (!this.state.plan || allPlans.some(({ id, soldOut }) => id === this.state.plan && soldOut))
    ) {
      this.state.plan = allPlans.find(({ soldOut }) => !soldOut).id;
    }
    const monthly =
      this.state.plan && plans.length
        ? format.number(plans.find(({ id }) => id === this.state.plan).price, '0.00')
        : ' -- ';
    const hourly =
      this.state.plan && plans.length
        ? format.number(this.props.plans.find(({ id }) => id === this.state.plan).price / 30 / 24, '0.000')
        : ' -- ';
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.backgroundColor,
            paddingBottom: 120
          }
        ]}
      >
        <ScrollView>
          <DeployStepTitle step="1" title="Server Location" />
          <ServerLocation regions={allRegions} value={this.state.region} onChange={this.handleValue('region')} />
          <DeployStepTitle step="2" title="Server Type" />
          <ServerType
            operatingSystems={operatingSystems}
            applications={applications}
            value={this.state.type}
            onChange={this.handleValue('type')}
          />
          <DeployStepTitle step="3" title="Server Size" />
          <ServerSize plans={allPlans} onChange={this.handleValue('plan')} value={this.state.plan} />
          <DeployStepTitle step="4" title="Additional Features" />
          <View
            style={{
              paddingLeft: 30,
              paddingRight: 20
            }}
          >
            <CheckBox onChange={this.handleValue('ipv6')} label="Enable IPv6" />
            {/*
            <CheckBox label="Enable Auto Backups" />
            <CheckBox label="Enable DDOS Protection" />
            */}
            <CheckBox onChange={this.handleValue('privateNetwork')} label="Enable Private Networking" />
          </View>
          {/*
          <DeployStepTitle step="5" title="Startup Script" />
          <View
            style={{
              backgroundColor: '#F3F3F3',
              paddingLeft: 30,
              height: 62
            }}
          >
            <View
              style={{
                backgroundColor: colors.backgroundColor,
                width: 200,
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
              }}
            >
              <Icon style={{ padding: 6 }} name="centos" size={30} color={colors.primary} />
              <View style={{ padding: 10 }}>
                <Text
                  style={{
                    fontFamily: 'Raleway',
                    fontSize: 12,
                    fontWeight: '600',
                    textAlign: 'left',
                    color: '#363b40'
                  }}
                >
                  install docker
                </Text>
              </View>
            </View>
          </View>
          */}
          <DeployStepTitle step="5" title="SSH Keys" />
          <SSHKeys sshkeys={sshkeys} onChange={this.handleValue('sshKey')} />
          <DeployStepTitle step="6" title="Server Hostname & Label" />
          <View
            style={{
              paddingLeft: 30,
              paddingRight: 20,
              paddingBottom: 10
            }}
          >
            <LabelTextInput
              onChange={this.handleValue('hostname')}
              label="Hostname"
              placeholder="Enter server hostname"
            />
            <LabelTextInput onChange={this.handleValue('label')} label="Label" placeholder="Enter server label" />
          </View>
        </ScrollView>

        <View
          style={[
            {
              width: Dimensions.get('window').width,
              backgroundColor: colors.backgroundColor,
              position: 'absolute',
              left: 0,
              bottom: 0,
              height: 120
            }
          ]}
        >
          <View style={[background, { paddingHorizontal: 20, paddingBottom: 6 }]}>
            <View style={{ flexDirection: 'row', paddingVertical: 10, paddingLeft: 20 }}>
              <View>
                <Text
                  style={{
                    fontFamily: 'Raleway',
                    fontSize: 11,
                    textAlign: 'left',
                    color: '#979797'
                  }}
                >
                  Summary
                </Text>
                <View style={{ marginTop: 5, flexDirection: 'row', alignItems: 'flex-end' }}>
                  <Text style={styles.deployExpenseMonthly}>
                    ${monthly}/<Text>mo</Text>
                  </Text>
                  <Text style={styles.deployExpenseHourly}>(${hourly}/hr)</Text>
                </View>
              </View>
            </View>
            <TouchableWithoutFeedback onPress={this.handleDeploy}>
              <View style={styles.deployButtonContainer}>
                <Text style={styles.deployButtonText}>Deploy Now</Text>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </View>
      </View>
    );
  }
}

const DeployFormWrapper = connect(
  ({ deploy: { plans, regions, operatingSystems, applications }, auth: { sshkeys } }) => ({
    plans,
    regions,
    operatingSystems: operatingSystems.filter(({ family }) => !['iso', 'application'].includes(family)),
    applications,
    sshkeys
  })
)(DeployForm);
class Deploy extends React.Component {
  state = {
    index: 0,
    routes: [
      {
        key: 'vc2',
        title: 'Vultr Cloud Compute (VC2)'
      },
      {
        key: 'dedicated',
        title: 'Dedicated Instance'
      }
    ]
  };

  changeIndex = index => () => {
    this.setState({ index });
  };

  render() {
    const { routes, index } = this.state;
    return (
      <View style={styles.container}>
        <TabView key="server-deploy" routes={routes} index={index}>
          <DeployFormWrapper />
        </TabView>
      </View>
    );
  }
}

Deploy.navigationOptions = {
  title: 'Deploy',
  tabBarVisible: false,
  headerStyle: {
    backgroundColor: colors.backgroundColor,
    borderBottomWidth: 0
  },
  headerTitleStyle: {
    letterSpacing: 0.4,
    color: '#000000',
    fontSize: 17
  },
  headerLeftStyle: {
    color: '#000000'
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundColor,
    paddingBottom: 34
  },
  deployExpenseMonthly: {
    fontFamily: 'Raleway-SemiBold',
    fontSize: 24,
    color: '#4a90e2'
  },
  deployExpenseHourly: {
    paddingLeft: 5,
    fontFamily: 'Raleway',
    fontSize: 11,
    fontWeight: '600',
    color: '#9b9b9b'
  },
  deployButtonContainer: {
    height: 50,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4a90e2',
    borderColor: 'green',
    borderStyle: 'solid',
    paddingBottom: 2
  },
  deployButtonText: {
    width: 82,
    height: 16,
    fontFamily: 'Raleway',
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.backgroundColor
  }
});
// deploy: { plans }
export default Deploy;
