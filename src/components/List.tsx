import React from 'react';
import { View, Text, StyleProp, ViewStyle, TouchableOpacity, TextStyle } from 'react-native';
import Item, { Icon } from './Item';
import Theme, { withTheme } from './Theme';

export class ItemGroup extends React.Component<any> {
  render() {
    const children: React.ReactElement<any>[] = (React.Children.toArray(this.props.children) as React.ReactElement<
      any
    >[]).filter(item => item.type !== Item || (item.type === Item && item.props.visible !== false));
    const divider = children.find(item => item.type === ItemDivider);
    return [
      divider,
      children.filter(item => item.type !== ItemDivider).map((child, index) => {
        return children.length - (!!divider ? 1 : 0) !== index + 1
          ? child
          : React.cloneElement(child as React.ReactElement<any>, {
              last: true
            });
      })
    ];
  }
}

interface ItemDividerProps {
  title?: string;
  style?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  theme?: Theme;
}

export const ItemDivider = withTheme(
  class ItemDivider extends React.Component<ItemDividerProps> {
    render() {
      const { style, children, title = children, titleStyle } = this.props;
      const theme = this.props.theme as Theme;
      return (
        <View
          style={{
            flexDirection: 'row',
            height: 32,
            justifyContent: 'center',
            paddingLeft: 16,
            paddingRight: 5
          }}
        >
          <View style={[{ flex: 1, justifyContent: 'center' }, style]}>
            <Text style={[{ color: theme.colors.minor }, theme.fonts.headline, titleStyle]}>{title}</Text>
          </View>
          {title !== children && children}
        </View>
      );
    }
  }
);

interface ListProps {
  type?: 'list' | 'radio-group' | 'multi-choice' | 'multi-choice-circle';
  title?: string;
  value?: any | any[];
  style?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  itemStyle?: StyleProp<ViewStyle>;
  createItem?: () => React.ReactElement<any>;
  onChange?: (value: any) => void;
  theme?: Theme;
  valueKey?: string;
  visible?: boolean;
  isEqual?: (left: any, right: any) => boolean;
}

interface ListState {
  value: any[];
  items: any;
}

class List extends React.Component<ListProps, ListState> {
  static defaultProps = {
    isEqual: (left: any, right: any) => left === right,
    onChange: () => {},
    visible: true
  };
  constructor(props: ListProps) {
    super(props);
    this.state = {
      value: Array.isArray(props.value) ? props.value : props.value ? [props.value] : [],
      items: []
    };
  }
  handleEqual = (left: any, right: any): boolean => {
    const { isEqual = List.defaultProps.isEqual, valueKey } = this.props;
    if (valueKey) {
      return left[valueKey] === right[valueKey];
    } else {
      return isEqual(left, right);
    }
  };
  handleClick = (value: any) => {
    const { type, onChange = List.defaultProps.onChange } = this.props;
    const { value: values } = this.state;
    if (type === 'multi-choice' || type === 'multi-choice-circle') {
      let newValue = [...values];
      if (values.some(v => this.handleEqual(v, value))) {
        newValue = values.filter(v => !this.handleEqual(v, value));
      } else {
        newValue.push(value);
      }
      this.setState({ value: newValue });
      onChange(newValue);
    } else {
      this.setState({ value: [value] });
      onChange(value);
    }
  };
  componentWillReceiveProps(nextProps: ListProps) {
    if (nextProps.visible && nextProps.value !== this.state.value) {
      this.setState({
        value: Array.isArray(nextProps.value) ? nextProps.value : nextProps.value ? [nextProps.value] : []
      });
    }
  }
  addItem = () => {
    if (!this.props.createItem) {
      console.warn('createItem is not set');
      return;
    }
    const itemTemplate = this.props.createItem();
    const { items } = this.state;
    items.push(itemTemplate);
    this.setState({ items });
  };
  refactorItem = (item: React.ReactChild) => {
    const { type, itemStyle } = this.props;
    const defaultStyle: any = itemStyle;
    const tempItem = item as React.ReactElement<any>;
    if (tempItem.type !== Item || tempItem.props.skip) {
      return item;
    }
    const props: any = { ...tempItem.props };
    if (type === 'radio-group' || type === 'multi-choice' || type === 'multi-choice-circle') {
      props['onValueChange'] = this.handleClick;
      props['checked'] = this.state.value.some(v => this.handleEqual(v, tempItem.props.value));
      props['mode'] = type === 'multi-choice-circle' ? 'radio-left' : 'radio';
    }
    return React.cloneElement(tempItem, {
      ...props,
      style: defaultStyle ? [defaultStyle, props.style] : props.style
    });
  };
  render() {
    if (!this.props.visible) {
      return [];
    }
    const { colors, fonts } = this.props.theme as Theme;
    const { title, type, style } = this.props;
    const length = React.Children.count(this.props.children);
    const children: React.ReactElement<any>[] = React.Children.toArray(this.props.children) as React.ReactElement<
      any
    >[];
    let groups = [];
    if (length > 0) {
      const items = [];
      for (const child of children) {
        if (!child) {
          continue;
        }
        if (child.type === ItemGroup) {
          groups.push(child);
        } else {
          items.push(child);
        }
      }
      if (items.length) {
        groups.push(
          <ItemGroup key="item-group-last">
            {title && (
              <ItemDivider title={title} titleStyle={this.props.titleStyle}>
                {this.props.createItem && (
                  <TouchableOpacity
                    onPress={this.addItem}
                    style={{ height: 32, width: 44, alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Icon type="Ionicons" name="ios-add" color={colors.colorful.red} size={20} />
                  </TouchableOpacity>
                )}
              </ItemDivider>
            )}
            {items}
          </ItemGroup>
        );
      }
    }
    groups = groups.map(group =>
      React.cloneElement(group, {
        children: React.Children.toArray(group.props.children)
          .filter(child => !!child)
          .map((item: React.ReactChild) => {
            const tempItem = item as React.ReactElement<any>;
            if (tempItem.type === React.Fragment) {
              return React.cloneElement(tempItem, {
                children: React.Children.toArray(tempItem.props.children)
                  .filter(child => !!child)
                  .map(this.refactorItem)
              });
            }
            return this.refactorItem(tempItem);
          })
      })
    );
    return <View style={[{ marginBottom: 10 }, style]}>{groups}</View>;
  }
}

export default withTheme(List);
