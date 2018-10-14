import React from 'react';
import { connect } from 'react-redux';
import {
  StyleSheet,
  Text,
  View,
  WebView,
  TextInput,
  TouchableOpacity,
  LayoutRectangle,
  ScrollView,
  Dimensions,
  Image,
  TextStyle,
  Switch,
  Animated,
  Easing,
  StyleProp,
  LayoutChangeEvent,
  KeyboardAvoidingView
} from 'react-native';
import Modal from 'react-native-modal';
import Theme, { withTheme } from '../../../components/Theme';
import { List, Item, Note, Icon } from '../../../components';
import SubmitButton from '../../../components/SubmitButton';
import { Dispatch } from 'redux';
import { Instance } from '../../cloud/type';

interface SchedulingProps {
  instances: Instance[];
  theme?: Theme;
}
interface SchedulingState {
  nodes: string[];
  visible: boolean;
}

class Scheduling extends React.Component<SchedulingProps, SchedulingState> {
  constructor(props: SchedulingProps) {
    super(props);
    this.state = { nodes: [], visible: true };
  }
  handleNodeChange = (value: string) => (checked: boolean) => {
    const { nodes } = this.state;
    this.setState({ nodes: checked ? [...nodes, value] : nodes.filter(h => h !== value) });
  };
  handleSave = async () => {

  }
  close = () => {
    this.setState({ visible: false });
  }
  render() {
    const { colors, fonts } = this.props.theme as Theme;
    const { instances } = this.props;
    const { nodes, visible } = this.state;
    return (
      <Modal
        style={styles.layout}
        // onBackdropPress={this.close}
        backdropOpacity={0.2}
        isVisible={visible}
      >
        <View style={[styles.container, { backgroundColor: colors.backgroundColorDeeper }]}>
          <View
            style={{
              flexDirection: 'row',
              height: 50,
              alignItems: 'center',
              paddingHorizontal: 10,
              borderBottomColor: colors.trivial,
              borderBottomWidth: StyleSheet.hairlineWidth
            }}
          >
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Note style={[{ color: colors.major }, fonts.title]}>Docker Image</Note>
            </View>
            <TouchableOpacity onPress={this.close} style={{ width: 50, height: 50, alignItems: 'center', justifyContent: 'center' }}>
              <Icon type="Ionicons" size={30} name="ios-close" color={colors.trivial} />
            </TouchableOpacity>
          </View>
          <List>
            {instances.map(({id, label}) => (
              <Item>
                <Note style={{ flex: 1 }}>{label}</Note>
                <Switch
                  style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }], marginRight: 10 }}
                  value={nodes.some(node => node === id)}
                  onValueChange={this.handleNodeChange(id)}
                  tintColor="#4180EE"
                  onTintColor="#4180EE"
                />
              </Item>
            ))}
          </List>
          <View style={{ backgroundColor: colors.backgroundColor, paddingHorizontal: 10, paddingVertical: 15 }}>
            <SubmitButton style={{ height: 36 }} title="Save" onSubmit={this.handleSave} />
          </View>
        </View>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  layout: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  container: {
    width: 320,
    borderRadius: 2
  }
});

const mapStateToProps = ({ cloud: { instances } }: any) => ({
  instances
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  destroy(id: string) {
    dispatch({ type: 'apps/destroy', payload: { id } });
  }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withTheme(Scheduling, false));
