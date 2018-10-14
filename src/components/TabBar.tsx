import React, { Component } from 'react';
import { StyleSheet, Text, View, Animated, TouchableNativeFeedback, TouchableOpacity, Platform, StyleProp, TextStyle, ViewStyle } from 'react-native';


interface TabBarProps {
  backgroundColor: string;
  tabUnderlineDefaultWidth?: number;
  tabUnderlineScaleX: number;
  activeColor: string;
  inactiveColor: string;
  textStyle?: StyleProp<TextStyle>;
  scrollValue?: Animated.Value;
  underlineStyle?: StyleProp<ViewStyle>;
  activeTab?: any;
  style?: StyleProp<ViewStyle>;
  goToPage?: (page: number) => void;
  tabs?: any[];
  containerWidth?: number;
}

export default class TabBar extends Component<TabBarProps> {
  constructor(props: TabBarProps) {
    super(props);
    this.state = {
      activeDefaultColor: '#08086b',
      inactiveDefaultColor: '#666666'
    };
  }

  _renderTab(name: string, page: number, isTabActive: boolean, onPressHandler: (page: number) => void) {
    const { textStyle } = this.props;
    const textColor = isTabActive ? this.props.activeColor : this.props.inactiveColor;

    const fontWeight = isTabActive ? 'bold' : 'normal';

    const Button = Platform.OS == 'ios' ? ButtonIos : ButtonAndroid;
    return (
      <Button
        style={{ flex: 1 }}
        key={name}
        accessible={true}
        accessibilityLabel={name}
        accessibilityTraits="button"
        onPress={() => onPressHandler(page)}
      >
        <View style={styles.tab}>
          <Text style={[{ color: textColor, fontWeight }, textStyle]}>{name}</Text>
        </View>
      </Button>
    );
  }

  _renderUnderline() {
    const containerWidth = this.props.containerWidth as number;
    const numberOfTabs = (this.props.tabs as any[]).length;
    const underlineWidth = this.props.tabUnderlineDefaultWidth
      ? this.props.tabUnderlineDefaultWidth
      : containerWidth / (numberOfTabs * 2);
    const scale = this.props.tabUnderlineScaleX ? this.props.tabUnderlineScaleX : 3;
    const deLen = (containerWidth / numberOfTabs - underlineWidth) / 2;
    const tabUnderlineStyle = {
      position: 'absolute',
      width: underlineWidth,
      height: 2,
      borderRadius: 2,
      backgroundColor: this.props.activeColor,
      bottom: 0,
      left: deLen
    };
    const scrollValue = this.props.scrollValue as Animated.Value;

    const translateX = scrollValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, containerWidth / numberOfTabs]
    });

    const scaleValue = (defaultScale: any) => {
      const number: number = 4;
      const arr: any[] = new Array(number * 2);
      return arr.fill(0).reduce(
        function(pre, cur, idx) {
          idx == 0 ? pre.inputRange.push(cur) : pre.inputRange.push(pre.inputRange[idx - 1] + 0.5);
          idx % 2 ? pre.outputRange.push(defaultScale) : pre.outputRange.push(1);
          return pre;
        },
        { inputRange: [], outputRange: [] }
      );
    };

    const scaleX = scrollValue.interpolate(scaleValue(scale));

    return (
      <Animated.View
        style={[
          tabUnderlineStyle,
          {
            transform: [{ translateX }, { scaleX }]
          },
          this.props.underlineStyle
        ]}
      />
    );
  }

  render() {
    return (
      <View style={[styles.tabs, { backgroundColor: this.props.backgroundColor }, this.props.style]}>
        {(this.props.tabs as any[]).map((name, page) => {
          const isTabActive = this.props.activeTab === page;
          return this._renderTab(name, page, isTabActive, this.props.goToPage as (page: number) => void);
        })}
        {this._renderUnderline()}
      </View>
    );
  }
}

const ButtonAndroid = (props: any) => (
  <TouchableNativeFeedback delayPressIn={0} background={TouchableNativeFeedback.SelectableBackground()} {...props}>
    {props.children}
  </TouchableNativeFeedback>
);

const ButtonIos = (props: any) => <TouchableOpacity {...props}>{props.children}</TouchableOpacity>;

const styles = StyleSheet.create({
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  tabs: {
    height: 50,
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderWidth: 1,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderColor: '#f4f4f4'
  }
});
