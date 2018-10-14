import React from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import Theme, { withTheme } from '../components/Theme';
import { format } from '../utils';
interface OptionProps {
  value: any;
  checked?: boolean;
  name: string;
  theme?: Theme;
  onChange?: (value?: any) => void;
}

interface OptionState {
  checked: boolean;
}

const Option = withTheme(
  class Option extends React.Component<OptionProps, OptionState> {
    constructor(props: OptionProps) {
      super(props);
      this.state = { checked: !!props.checked };
    }
    componentWillReceiveProps(nextProps: OptionProps) {
      if (this.state.checked !== nextProps.checked) {
        this.setState({ checked: !!nextProps.checked });
      }
    }
    handleClick = () => {
      const checked = !this.state.checked;
      const { onChange, value } = this.props;
      this.setState({ checked });
      onChange && onChange(checked ? value : false);
    };
    render() {
      const { colors, fonts } = this.props.theme as Theme;
      const { name } = this.props;
      return (
        <TouchableOpacity onPress={this.handleClick}>
          <View
            style={{
              backgroundColor: this.state.checked ? format.color(colors.primary, 'rgba', 0.1) : colors.backgroundColor,
              height: 25,
              width: 73,
              justifyContent: 'center',
              marginRight: 14,
              marginBottom: 14
            }}
          >
            <Text style={{ color: this.state.checked ? colors.primary : colors.major, fontSize: 11, textAlign: 'center' }}>
              {name}
            </Text>
          </View>
        </TouchableOpacity>
      );
    }
  }
);

interface MultiSelectionProps {
  values?: any[];
  onChange?: (values: any[]) => void;
}
interface MultiSelectionState {
  values: any[];
}

class MultiSelection extends React.Component<MultiSelectionProps, MultiSelectionState> {
  static Option = Option;
  constructor(props: MultiSelectionProps) {
    super(props);
    this.state = { values: props.values || [] };
  }
  componentWillReceiveProps(nextProps: MultiSelectionProps) {
    if (this.state.values !== nextProps.values) {
      this.setState({ values: nextProps.values || [] });
    }
  }
  handleChange = (id: any) => (value: any) => {
    const { values } = this.state;
    const { onChange } = this.props;
    let newValues;
    if (!!value) {
      newValues = !values.some(v => v === id) ? [...values, id] : values;
    } else {
      newValues = values.filter(v => v !== id);
    }
    onChange && onChange(newValues);
    this.setState({ values: newValues });
  };
  render() {
    const { values } = this.state;
    return (
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {React.Children.map(this.props.children, child => {
          if (!child) {
            return child;
          }
          const element = child as React.ReactElement<OptionProps>;
          return React.cloneElement(element, {
            checked: values.some(v => v === element.props.value),
            onChange: this.handleChange(element.props.value)
          });
        })}
      </View>
    );
  }
}

export default MultiSelection;
