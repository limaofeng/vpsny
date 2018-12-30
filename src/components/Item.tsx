import * as React from 'react';
import {
  GestureResponderEvent,
  KeyboardTypeOptions,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextProps,
  TextStyle,
  TouchableHighlight,
  TouchableOpacity,
  View,
  ViewStyle
} from 'react-native';
import Entypo from 'react-native-vector-icons/Entypo';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import { IcoMoon } from '../utils';
import Theme, { withTheme } from './Theme';

interface LabelProps {
  fixed?: boolean;
  floating?: boolean;
  stacked?: boolean;
  color?: string;
  layoutStyle?: StyleProp<TextStyle>;
  style?: StyleProp<TextStyle>;
  theme?: Theme;
}

export const Label = withTheme(
  class Label extends React.Component<LabelProps> {
    static defaultProps = {
      fixed: true
    };
    render() {
      const theme = this.props.theme as Theme;
      const { style, layoutStyle } = this.props;
      return (
        <Text
          style={[
            styles.label,
            {
              color: theme.colors.minor
            },
            theme.fonts.headline,
            layoutStyle,
            style
          ]}
        >
          {this.props.children}
        </Text>
      );
    }
  }
);

export type IconType =
  | 'EvilIcons'
  | 'Entypo'
  | 'FontAwesome'
  | 'FontAwesome5'
  | 'Ionicons'
  | 'MaterialIcons'
  | 'IcoMoon'
  | 'Feather'
  | 'MaterialCommunityIcons';

export interface IconProps {
  name: string;
  type?: IconType;
  color?: string;
  size?: number;
  style?: StyleProp<TextStyle>;
}

function getIcon(name: string): any {
  switch (name) {
    case 'Feather':
      return Feather;
    case 'MaterialIcons':
      return MaterialIcons;
    case 'FontAwesome':
      return FontAwesome;
    case 'FontAwesome5':
      return FontAwesome5;
    case 'MaterialCommunityIcons':
      return MaterialCommunityIcons;
    case 'Ionicons':
      return Ionicons;
    case 'Entypo':
      return Entypo;
    case 'EvilIcons':
      return EvilIcons;
    default:
      return IcoMoon;
  }
}

export class Icon extends React.Component<IconProps> {
  render() {
    const VectorIcon = getIcon(this.props.type as string);
    const { name, color, size, style } = this.props;
    return <VectorIcon name={name} color={color} size={size} style={[{ textAlign: 'center' }, style]} />;
  }
}

interface RadioProps {
  checked?: boolean;
  style?: StyleProp<TextStyle>;
  theme?: Theme;
}

const Radio = withTheme(
  class Radio extends React.Component<RadioProps> {
    render() {
      const { colors } = this.props.theme as Theme;
      const { checked, style } = this.props;
      if (!checked) {
        return <View />;
      }
      return (
        <View style={[{ width: 30, paddingRight: 15 }, style]}>
          <Ionicons name="ios-checkmark" color={colors.primary} size={30} />
        </View>
      );
    }
  }
);

interface InputProps extends TextInputProps {
  value?: string;
  color?: string;
  defaultValue?: string;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  layoutStyle?: StyleProp<TextStyle>;
  style?: StyleProp<TextStyle>;
  onValueChange?: (value: string) => void;
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  theme?: Theme;
}

export const Input = withTheme(
  class Input extends React.Component<InputProps> {
    static defaultProps = {
      autoCapitalize: 'none'
    };
    render() {
      const {
        value,
        onValueChange,
        autoCapitalize,
        secureTextEntry,
        keyboardType,
        placeholder,
        style,
        defaultValue,
        layoutStyle
      } = this.props;
      const { colors, fonts } = this.props.theme as Theme;
      return (
        <TextInput
          {...this.props}
          accessibilityTraits="text"
          autoCapitalize={autoCapitalize}
          placeholder={placeholder}
          onChangeText={onValueChange}
          defaultValue={defaultValue}
          value={value}
          style={[styles.text, { color: colors.major }, fonts.body, layoutStyle, style]}
          keyboardType={keyboardType}
          clearButtonMode="while-editing"
          secureTextEntry={secureTextEntry}
        />
      );
    }
  }
);

interface PasswordProps extends TextInputProps {
  layoutStyle?: StyleProp<TextStyle>;
  style?: StyleProp<TextStyle>;
  onValueChange?: (value: string) => void;
  theme?: Theme;
}

export const Password = withTheme(
  class Password extends React.Component<PasswordProps> {
    state = {
      secureTextEntry: true
    };
    static defaultProps = {
      autoCapitalize: 'none'
    };
    toggle = () => {
      this.setState({ secureTextEntry: !this.state.secureTextEntry });
    };
    render() {
      const { onValueChange, style, layoutStyle } = this.props;
      const { colors, fonts } = this.props.theme as Theme;
      const { secureTextEntry } = this.state;
      return (
        <View style={[{ flexDirection: 'row', alignItems: 'center', flex: 1 }]}>
          <View style={{ flex: 1, flexDirection: 'column' }}>
            <TextInput
              {...this.props}
              onChangeText={onValueChange}
              style={[styles.text, { color: colors.major }, fonts.body, layoutStyle, style]}
              clearButtonMode="never"
              secureTextEntry={secureTextEntry}
            />
          </View>
          <TouchableOpacity
            style={{
              width: 40,
              height: 40,
              justifyContent: 'center',
              alignItems: 'center',
              position: 'absolute',
              right: 0
            }}
            onPress={this.toggle}
            activeOpacity={1}
          >
            <Icon
              type="Ionicons"
              style={{ marginTop: 2, marginRight: 10 }}
              color={colors.trivial}
              size={secureTextEntry ? 18 : 19}
              name={secureTextEntry ? 'ios-eye' : 'ios-eye-off'}
            />
          </TouchableOpacity>
        </View>
      );
    }
  }
);

interface NoteProps extends TextProps {
  layoutStyle?: StyleProp<TextStyle>;
  style?: StyleProp<TextStyle>;
  theme?: Theme;
}

export const Note = withTheme(
  class Note extends React.Component<NoteProps> {
    render() {
      const theme = this.props.theme as Theme;
      const { style, layoutStyle, ...props } = this.props;
      return (
        <Text
          style={[
            styles.note,
            layoutStyle,
            theme.fonts.body,
            {
              color: theme.colors.major
            },
            style
          ]}
          {...props}
        >
          {this.props.children}
        </Text>
      );
    }
  }
);

export class Avatar extends React.Component<ItemBodyProps> {
  render() {
    return <ItemStart />;
  }
}

interface ItemBodyProps {
  layoutStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
  theme?: Theme;
}

export const ItemBody = withTheme(
  class ItemBody extends React.Component<ItemBodyProps> {
    render() {
      const theme = this.props.theme as Theme;
      const { style, layoutStyle } = this.props;
      return (
        <View style={[styles.itemBody, { borderBottomColor: theme.colors.trivial }, layoutStyle, style]}>
          {this.props.children}
        </View>
      );
    }
  }
);

interface ItemStartProps {
  layoutStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
}

export class ItemStart extends React.Component<ItemStartProps> {
  render() {
    const { style, layoutStyle } = this.props;
    return (
      <View style={[layoutStyle, style, { justifyContent: 'center', alignItems: 'center' }]}>
        {this.props.children}
      </View>
    );
  }
}

interface ItemProps {
  push?: boolean;
  skip?: boolean;
  value?: any;
  checked?: any;
  mode?: 'list' | 'radio' | 'radio-left';
  size?: 'small' | 'normal' | 'medium' | 'large' | number | 'auto';
  onValueChange?: (value: any) => void;
  onClick?: (e?: GestureResponderEvent | any) => void;
  style?: StyleProp<ViewStyle>;
  bodyStyle?: StyleProp<ViewStyle>;
  arrowStyle?: StyleProp<TextStyle>;
  last?: boolean;
  visible?: boolean;
  theme?: Theme;
  testID?: string;
}

export default withTheme(
  class Item extends React.Component<ItemProps> {
    static defaultProps = {
      visible: true,
      size: 'normal',
      skip: false
    };
    handleClick = () => {
      this.props.onClick && this.props.onClick(this.props.value);
    };
    handleValueChange = () => {
      const onValueChange = this.props.onValueChange;
      onValueChange && onValueChange(this.props.value);
    };
    render() {
      if (!this.props.visible) {
        return [];
      }
      const { colors } = this.props.theme as Theme;
      const { size = 'normal', last, mode, checked, style, bodyStyle, push, arrowStyle, testID } = this.props;
      const children: React.ReactElement<any>[] = React.Children.toArray(this.props.children) as React.ReactElement<
        any
      >[];

      const startStyle =
        typeof size === 'string'
          ? specs[size].itemStart
          : {
              width: size,
              height: size
            };

      let itemStart = children.find(child => child.type === ItemStart);
      if (!itemStart) {
        const icon = children.length && children[0].type === Icon ? children[0] : undefined;
        itemStart = icon && <ItemStart>{icon}</ItemStart>;
      }

      let itemBody = children.find(child => child.type === ItemBody);
      const lastStyle = last ? { borderBottomWidth: 0 } : {};
      if (!itemBody) {
        const body = children.filter(child => child.type != Icon && child.type !== ItemStart);
        if (body.length) {
          const content = body.filter(child => child.type !== Radio);
          itemBody = (
            <ItemBody style={bodyStyle}>
              {content.map((element, index) => {
                return content.length === index + 1
                  ? React.cloneElement(element, {
                      layoutStyle: {
                        flex: 1
                      }
                    })
                  : element;
              })}
              {body.find(child => child.type === Radio)}
              {push && (
                <FontAwesome
                  name="angle-right"
                  color={colors.trivial}
                  size={18}
                  style={[{ paddingRight: 15 }, arrowStyle]}
                />
              )}
            </ItemBody>
          );
        }
      }

      let handleClick = this.props.onClick && this.handleClick;
      if (mode === 'radio-left') {
        handleClick = handleClick || this.handleValueChange;
        itemStart = (
          <TouchableOpacity onPress={this.handleValueChange}>
            <ItemStart layoutStyle={startStyle}>
              <View style={{ width: 24, height: 24, alignItems: 'center', justifyContent: 'center' }}>
                {checked ? (
                  <Icon
                    type="Ionicons"
                    style={{ height: 17, lineHeight: 17, paddingTop: 1 }}
                    name="ios-checkmark-circle"
                    color={colors.primary}
                    size={20}
                  />
                ) : (
                  <Icon type="FontAwesome" name="circle-thin" color={colors.trivial} size={18} />
                )}
              </View>
            </ItemStart>
          </TouchableOpacity>
        );
      } else if (mode === 'radio') {
        handleClick = this.handleValueChange;
        const tempBody = itemBody as React.ReactElement<any>;
        itemBody = React.cloneElement(tempBody, {
          children: (
            <>
              {tempBody.props.children}
              <Radio checked={checked} />
            </>
          )
        });
      }

      const item = (
        <View
          style={[
            styles.container,
            { backgroundColor: colors.backgroundColorDeeper },
            { paddingLeft: itemStart ? 5 : 15 },
            style
          ]}
        >
          {itemStart &&
            React.cloneElement(itemStart, {
              layoutStyle: startStyle
            })}
          {itemBody &&
            React.cloneElement(itemBody, {
              layoutStyle: {
                ...(typeof size === 'string'
                  ? specs[size].itemBody
                  : {
                      height: size
                    }),
                ...lastStyle
              }
            })}
        </View>
      );
      return push || handleClick ? (
        <TouchableHighlight
          testID={testID}
          accessibilityTraits="button"
          underlayColor={colors.colorful.iron}
          onLongPress={this.handleClick}
          onPress={handleClick}
        >
          {item}
        </TouchableHighlight>
      ) : (
        item
      );
    }
  }
);

const specs = {
  small: {
    itemStart: {
      width: 30,
      height: 20
    },
    itemBody: {
      height: 20,
      paddingVertical: 0,
      paddingLeft: 6,
      paddingRight: 15,
      borderBottomWidth: 0
    }
  },
  normal: {
    itemStart: {
      width: 40,
      height: 40
    },
    itemBody: {
      height: 40
    }
  },
  medium: {
    itemStart: {
      width: 76,
      height: 76
    },
    itemBody: {
      height: 76
    }
  },
  large: {
    itemStart: {
      width: 80,
      height: 80
    },
    itemBody: {
      height: 132
    }
  },
  auto: {
    itemStart: {
      width: 80,
      height: 'auto'
    },
    itemBody: {
      height: 'auto'
    }
  }
};

const styles = StyleSheet.create({
  container: {
    paddingLeft: 5,
    flexDirection: 'row',
    alignItems: 'center'
  },
  itemBody: {
    flex: 1,
    height: 40,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingRight: 5,
    flexDirection: 'row',
    alignItems: 'center'
  },
  label: {
    textAlign: 'left',
    marginRight: 10,
    width: 80
  },
  text: {
    height: '100%',
    textAlign: 'left'
  },
  note: {
    paddingRight: 10
  }
});
