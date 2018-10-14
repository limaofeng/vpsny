import React from 'react';
import { connect } from 'react-redux';
import { NavigationScreenOptions, SafeAreaView, NavigationScreenProp } from 'react-navigation';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Animated,
  Easing
} from 'react-native';

import { Dispatch } from 'redux';

import { List, Item, Note, ItemStart, ItemBody, Svg, Icon, Label } from '../../../components';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DashLine from '../../../components/DashLine';
import ActionButton from '../../../components/ActionButton';
import { Service } from '..';
import { sleep, format } from '../../../utils';
import Theme, { withTheme } from '../../../components/Theme';
import Modal from 'react-native-modal';
import Scheduling from '../components/Scheduling';
import { Instance } from '../../cloud/type';
import PodActions from '../components/PodActions';
import Card from '../../../components/Card';

interface MoreActionProps {
  onDelete: () => void;
}

interface MoreActionState {}

class MoreAction extends React.Component<MoreActionProps, MoreActionState> {
  state = {
    expand: false
  };
  handleClick = async () => {
    const { expand } = this.state;
    this.setState({ expand: !expand });
    if (!expand) {
      await sleep(3000);
      this.setState({ expand: false });
    }
  };
  render() {
    const { expand } = this.state;
    return (
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'flex-end',
          paddingVertical: 6,
          paddingRight: 10
        }}
      >
        {expand && (
          <TouchableOpacity
            onPress={this.props.onDelete}
            style={{ width: 30, height: 30, alignItems: 'center', justifyContent: 'center' }}
          >
            <Ionicons name="ios-remove-circle" color="#E74628" size={24} />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={this.handleClick}
          style={{ width: 30, height: 30, alignItems: 'center', justifyContent: 'center' }}
        >
          <Ionicons name="md-more" color="#4180EE" size={24} />
        </TouchableOpacity>
      </View>
    );
  }
}

interface ServicesProps {
  navigation: NavigationScreenProp<any>;
  destroy: (id: string) => void;
  allNodes: Instance[];
  services: Service[];
  dispatch: any;
  theme: Theme;
}

interface ServicesState {
  showMoreTheIndex?: number;
  openup?: string;
  anim: Animated.Value;
}

class Services extends React.Component<ServicesProps, ServicesState> {
  static navigationOptions: NavigationScreenOptions = {
    tabBarLabel: 'Apps'
  };
  constructor(props: ServicesProps) {
    super(props);
    this.state = { showMoreTheIndex: undefined, openup: undefined, anim: new Animated.Value(0) };
  }
  handleOpenKeyboard = () => {};
  handleServiceNew = () => {
    const { navigation } = this.props;
    navigation.navigate('ServiceNew');
  };
  handleDelete = (id: string) => () => {
    const { destroy } = this.props;
    destroy(id);
  };
  handleJumpToView = (value: Service) => () => {
    const { navigation } = this.props;
    navigation.navigate('ServiceView', { value });
  };
  handleOpenup = (app: Service) => () => {
    const { anim } = this.state;
    this.setState({ openup: app.id });
    anim.stopAnimation();
    Animated.timing(anim, {
      toValue: 1,
      duration: 200,
      easing: Easing.linear
    }).start(() => {
      // anim.setValue(0);
    });
  };
  render() {
    const { colors, fonts } = this.props.theme;
    const { services, allNodes } = this.props;
    const { showMoreTheIndex, openup, anim } = this.state;
    return (
      <SafeAreaView style={[styles.container]}>
        <ScrollView
          style={{ paddingTop: 13 }}
          contentContainerStyle={{ alignItems: 'center' }}
          showsVerticalScrollIndicator={false}
        >
          {services.map((app, i) => {
            const { id, name, summary, configs } = app;
            const nodes = allNodes.filter(node => configs.nodes.some(id => id === node.id));
            // onClick={this.handleJumpToView(app)}
            return (
              <Card key={`app-${id}`}>
                <List
                  style={{ marginBottom: 0 }}
                  itemStyle={{
                    paddingHorizontal: 10
                  }}
                >
                  <Item style={{ paddingTop: 5 }} size={45}>
                    <Image
                      source={require('../../../assets/images/apps/nginx.png')}
                      resizeMode="contain"
                      style={{ height: 24, width: 24 }}
                    />
                    <Note style={{ flex: 1, marginLeft: 5 }}>{name}</Note>
                    <MoreAction onDelete={this.handleDelete(id)} />
                  </Item>
                  <Item>
                    <Label>{summary || 'Not configured'}</Label>
                  </Item>
                  {nodes.map(node => (
                    <Item key={`service-node-${node.id}`} arrowStyle={{ paddingRight: 5 }} push>
                      <PodActions node={node} app={app} style={{ flex: 1 }}>
                        <Note style={{ flex: 1 }}>{node.label}</Note>
                        <Label style={[{ width: 'auto', textAlign: 'right', color: colors.secondary }, fonts.footnote]}>
                          up 8 hours
                        </Label>
                      </PodActions>
                    </Item>
                  ))}
                  <Item visible={openup === id}>
                    <ItemBody>
                      <View style={{ flex: 1, alignItems: 'flex-start' }}>
                        <TouchableOpacity>
                          <Icon type="FontAwesome5" name="cubes" size={20} color={colors.primary} />
                        </TouchableOpacity>
                      </View>
                      <View style={{ flex: 2 }}>
                        <TouchableOpacity>
                          <Icon type="Ionicons" name="ios-settings" size={22} color={colors.primary} />
                        </TouchableOpacity>
                      </View>
                      <View style={{ flex: 2 }}>
                        <TouchableOpacity>
                          <Icon type="FontAwesome5" name="connectdevelop" size={20} color={colors.primary} />
                        </TouchableOpacity>
                      </View>
                      <View style={{ flex: 1, alignItems: 'flex-end' }}>
                        <TouchableOpacity>
                          <Icon type="Ionicons" name="ios-list-box" size={22} color={colors.primary} />
                        </TouchableOpacity>
                      </View>
                    </ItemBody>
                  </Item>
                </List>
              </Card>
            );
          })}
        </ScrollView>
        <ActionButton position="right" radius={80} size={50} buttonColor="#4180EE" onPress={this.handleServiceNew} />
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F1F2'
  }
});

const mapStateToProps = ({ apps: { services }, cloud: { instances: allNodes } }: any) => ({
  services,
  allNodes
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  destroy(id: string) {
    dispatch({ type: 'apps/destroy', payload: { id } });
  }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withTheme(Services, false));
