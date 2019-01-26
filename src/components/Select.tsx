import React from 'react';
import {
  ColorPropType,
  Modal,
  Picker,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleProp,
  TextStyle
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import { isEqual } from 'lodash';

function handlePlaceholder(placeholder: SelectItem) {
  if (isEqual(placeholder, {})) {
    return [];
  }
  return [placeholder];
}

function getSelectedItem({ items, key, value }: { items: SelectItem[]; key?: string | number; value: any }) {
  let idx = items.findIndex(item => {
    return isEqual(item, value);
  });
  if (idx === -1) {
    idx = 0;
  }
  return {
    selectedItem: items[idx],
    idx
  };
}

interface SelectStyle {
  input?: StyleProp<TextStyle>;
  viewContainer?: any;
  modalViewMiddle?: any;
  done?: any;
  inputContainer?: any;
  icon?: any;
  modalViewTop?: any;
  underline?: any;
  headlessAndroidContainer?: any;
  modalViewBottom?: any;
}

interface RNPickerSelectProps {
  required?: boolean;
  onValueChange: (value: any, index: number) => void;
  items: SelectItem[];
  placeholder?: SelectItem;
  hideDoneBar?: boolean;
  hideIcon?: boolean;
  hideClearButton?: boolean;
  disabled?: boolean;
  value?: any;
  itemKey?: string | number;
  style?: SelectStyle;
  children?: any;
  mode?: 'dialog' | 'dropdown';
  animationType?: 'none' | 'slide' | 'fade';
  title?: string;
  cancelText?: string;
  confirmText?: string;
  defaultValue?: SelectItem;
}

interface SelectItem {
  label: string;
  value: any;
  key?: string | number;
  color?: string;
}

interface RNPickerSelectState {
  selectedItem: {
    label: string;
    value: any;
  };
  tempItem: {
    label: string;
    value: any;
  };
  showPicker: boolean;
  animationType?: 'none' | 'slide' | 'fade';
  value?: SelectItem;
}

export default class RNPickerSelect extends React.PureComponent<RNPickerSelectProps, RNPickerSelectState> {
  static defaultProps = {
    placeholder: {
      label: 'Select an item...',
      value: null
    },
    hideDoneBar: false,
    hideIcon: false,
    disabled: false,
    required: false,
    value: undefined,
    itemKey: null,
    style: {},
    children: null,
    mode: 'dialog',
    animationType: 'slide',
    title: '',
    cancelText: '取消',
    confirmText: '确定'
  };
  inputRef?: TextInput;
  static getDerivedStateFromProps(nextProps: RNPickerSelectProps, prevState: RNPickerSelectState) {
    const newItems = nextProps.items;
    const { selectedItem, idx } = getSelectedItem({
      items: newItems,
      key: nextProps.itemKey,
      value: nextProps.value
    });
    const tempItem = selectedItem;
    if (isEqual(prevState.selectedItem, prevState.tempItem)) {
      return {
        selectedItem: tempItem,
        tempItem
      };
    }
    return null;
  }

  constructor(props: RNPickerSelectProps) {
    super(props);
    const items = props.items;
    const { selectedItem } = getSelectedItem({
      items,
      key: props.itemKey,
      value: props.value || props.defaultValue
    });
    this.state = {
      selectedItem,
      tempItem: selectedItem,
      showPicker: false,
      animationType: undefined,
      value: props.value || props.defaultValue
    };

    this.togglePicker = this.togglePicker.bind(this);
  }

  handleValueChange = (value: any, index: number) => {
    const selectedItem = this.props.items[index];
    if (this.props.hideDoneBar) {
      this.setState({
        selectedItem
      });
      this.props.onValueChange(selectedItem, index);
    } else {
      this.setState({ tempItem: selectedItem });
    }
  };

  onValueChange = () => {
    const { tempItem } = this.state;
    const selectedItem = tempItem;
    const index = this.props.items.findIndex(item => item.value === selectedItem.value);
    this.props.onValueChange(this.props.items[index].value, index);
    this.togglePicker(true);
    this.setState({ value: this.props.items[index] });
  };

  handleCancel = () => {
    this.togglePicker(true);
  };

  handleCleanValue = () => {
    const { required, defaultValue, items, itemKey } = this.props;
    if (required) {
      const { selectedItem, idx } = getSelectedItem({
        items,
        value: defaultValue
      });
      this.setState({ value: defaultValue, selectedItem });
      this.props.onValueChange(defaultValue, idx);
    } else {
      this.setState({ value: undefined });
    }
  };

  togglePicker(animate = false) {
    if (this.props.disabled) {
      return;
    }
    this.setState({
      animationType: animate ? this.props.animationType : undefined,
      showPicker: !this.state.showPicker
    });
    if (!this.state.showPicker && this.inputRef) {
      this.inputRef.focus();
      this.inputRef.blur();
    }
  }

  renderPickerItems() {
    return this.props.items.map(item => {
      return <Picker.Item label={item.label} value={item.value} key={item.key || item.label} color={item.color} />;
    });
  }

  renderDoneBar() {
    if (this.props.hideDoneBar) {
      return null;
    }

    const style = this.props.style as SelectStyle;

    return (
      <View style={[styles.modalViewMiddle, style.modalViewMiddle, { alignItems: 'center' }]}>
        <TouchableOpacity activeOpacity={1} onPress={this.handleCancel}>
          <Text style={[styles.done, style.done]}>{this.props.cancelText}</Text>
        </TouchableOpacity>
        <Text style={[styles.title]}>{this.props.title}</Text>
        <TouchableOpacity
          activeOpacity={1}
          onPress={this.onValueChange}
          hitSlop={{ top: 2, right: 2, bottom: 2, left: 2 }}
        >
          <View>
            <Text style={[styles.done, style.done]}>{this.props.confirmText}</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  }

  renderIcon() {
    if (this.props.hideIcon) {
      return null;
    }
    const style = this.props.style as SelectStyle;
    return <FontAwesomeIcon name="caret-down" color="#C8C7CC" size={18} style={[styles.icon, style.icon]} />;
  }

  renderTextInputOrChildren() {
    const { value } = this.state;
    const style = this.props.style as SelectStyle;
    if (this.props.children) {
      return (
        <View pointerEvents="box-only" style={[{ flexDirection: 'row' }, style.inputContainer]}>
          {this.props.children}
        </View>
      );
    }
    return (
      <View style={[{ flexDirection: 'row', alignItems: 'center', height: 24 }, style.inputContainer]}>
        <View pointerEvents="box-only" style={{ flex: 1 }}>
          <TextInput
            style={[styles.textInput, style.input]}
            value={value && value.label}
            placeholder={(this.props.placeholder as SelectItem).label}
            ref={ref => {
              this.inputRef = ref as TextInput;
            }}
          />
        </View>
        {value &&
          !this.props.hideClearButton && (
            <TouchableOpacity activeOpacity={1} onPress={this.handleCleanValue}>
              <Ionicons style={{ marginTop: 2, marginRight: 10 }} color="#CCCCCC" size={17} name="ios-close-circle" />
            </TouchableOpacity>
          )}
        {this.renderIcon()}
      </View>
    );
  }

  renderIOS() {
    const style = this.props.style as SelectStyle;
    return (
      <View style={[styles.viewContainer, style.viewContainer]}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => {
            this.togglePicker(true);
          }}
        >
          {this.renderTextInputOrChildren()}
        </TouchableOpacity>
        <Modal
          visible={this.state.showPicker}
          transparent
          animationType={this.state.animationType}
          supportedOrientations={['portrait', 'landscape']}
        >
          <TouchableOpacity
            style={[styles.modalViewTop, style.modalViewTop]}
            onPress={() => {
              this.togglePicker(true);
            }}
          />
          {this.renderDoneBar()}
          <View style={[styles.modalViewBottom, style.modalViewBottom]}>
            <Picker
              itemStyle={
                {
                  fontSize: 14,
                  color: '#24262C'
                } as any
              }
              onValueChange={this.handleValueChange}
              selectedValue={this.state.tempItem.value}
              testID="RNPickerSelectIOS"
            >
              {this.renderPickerItems()}
            </Picker>
          </View>
        </Modal>
      </View>
    );
  }

  renderAndroidHeadless() {
    const style = this.props.style as SelectStyle;
    return (
      <View style={[{ borderWidth: 0 }, style.headlessAndroidContainer]}>
        {this.props.children}
        <Picker
          style={{ position: 'absolute', top: 0, width: 1000, height: 1000 }}
          onValueChange={this.onValueChange}
          selectedValue={this.state.selectedItem.value}
          testID="RNPickerSelectAndroid"
          mode={this.props.mode}
          enabled={!this.props.disabled}
        >
          {this.renderPickerItems()}
        </Picker>
      </View>
    );
  }

  renderAndroid() {
    if (this.props.children) {
      return this.renderAndroidHeadless();
    }
    const style = this.props.style as SelectStyle;
    return (
      <View style={[styles.viewContainer, style.viewContainer]}>
        <Picker
          style={[this.props.hideIcon ? { backgroundColor: 'transparent' } : {}, style.input]}
          onValueChange={this.onValueChange}
          selectedValue={this.state.tempItem.value}
          testID="RNPickerSelectAndroid"
          mode={this.props.mode}
          enabled={!this.props.disabled}
        >
          {this.renderPickerItems()}
        </Picker>
        <View style={[styles.underline, style.underline]} />
      </View>
    );
  }

  render() {
    return Platform.OS === 'ios' ? this.renderIOS() : this.renderAndroid();
  }
}

const styles = StyleSheet.create({
  viewContainer: {
    alignSelf: 'stretch',
    flex: 1
  },
  chevron: {
    width: 15,
    height: 15,
    backgroundColor: 'transparent',
    borderTopWidth: 1.5,
    borderTopColor: '#D0D4DB',
    borderRightWidth: 1.5,
    borderRightColor: '#D0D4DB'
  },
  chevronUp: {
    transform: [{ translateY: 17 }, { rotate: '-45deg' }]
  },
  chevronDown: {
    transform: [{ translateY: 8 }, { rotate: '135deg' }]
  },
  chevronActive: {
    borderTopColor: '#007AFE',
    borderRightColor: '#007AFE'
  },
  modalViewTop: {
    flex: 1
  },
  modalViewMiddle: {
    height: 40,
    zIndex: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#E8E8E8'
  },
  modalViewBottom: {
    height: 210,
    justifyContent: 'center',
    backgroundColor: '#D0D4DB'
  },
  textInput: {
    flex: 1,
    fontSize: 13,
    textAlign: 'left',
    color: '#363b40'
  },
  icon: {
    paddingRight: 15
  },
  done: {
    color: '#007AFE',
    padding: 10,
    paddingRight: 15,
    fontSize: 14
  },
  title: {
    color: '#24262C',
    padding: 10,
    fontSize: 15
  },
  underline: {
    borderTopWidth: 1,
    borderTopColor: '#888988',
    marginHorizontal: 4
  }
});
