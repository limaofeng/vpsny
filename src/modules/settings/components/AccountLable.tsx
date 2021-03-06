import { Icon, Theme, withTheme } from '@components';
import { format } from '@utils';
import React from 'react';
import { Image, ImageSourcePropType, TouchableHighlight, View } from 'react-native';

import { Account } from '../../cloud/type';

interface AccountLableProps {
  theme?: Theme;
  light?: boolean;
  testID?: string;
  value?: Account;
  logo: ImageSourcePropType;
  onClick?: (account?: Account) => void;
}

interface AccountLableState {
  light: boolean;
}

class AccountLable extends React.Component<AccountLableProps, AccountLableState> {
  static getDerivedStateFromProps(nextProps: AccountLableProps, prevState: AccountLableState) {
    if (nextProps.light !== prevState.light) {
      return { ...prevState, light: nextProps.light };
    }
    return prevState;
  }

  constructor(props: AccountLableProps) {
    super(props);
    this.state = { light: !!props.light };
  }

  handleClick = () => {
    const { value, onClick } = this.props;
    this.setState({ light: true });
    onClick && onClick(value);
  };

  render() {
    const { colors, fonts } = this.props.theme as Theme;
    const { logo, testID } = this.props;
    const { light } = this.state;
    return (
      <View
        style={{
          height: 70,
          width: 70,
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <View
          style={{
            width: 52,
            height: 52,
            borderRadius: 26,
            borderColor: light ? colors.primary : 'transparent',
            borderWidth: 2,
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <TouchableHighlight
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: colors.backgroundColorDeeper
            }}
            testID={testID}
            accessibilityTraits="button"
            underlayColor={format.color(colors.primary, 'rgba', 0.1)}
            onPress={this.handleClick}
          >
            <View
              style={{
                width: 48,
                height: 48,
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Image source={logo} resizeMode="contain" style={{ height: 28, width: 28 }} />
            </View>
          </TouchableHighlight>
        </View>
      </View>
    );
  }
}

const AccountLableWarp = withTheme(AccountLable);

export default AccountLableWarp;

export const AllAccountLable = ({
  light,
  onClick,
  testID
}: {
  testID?: string;
  light: boolean;
  onClick?: (account?: Account) => void;
}) => {
  return <AccountLableWarp testID={testID} logo={require('../../cloud/assets/logo/vpsny.png')} light={light} onClick={onClick} />;
};

interface NewAccountLableProps {
  theme?: Theme;
  testID?: string;
  onClick: () => void;
}

export const NewAccountLable = withTheme(
  class AddAccountLable extends React.Component<NewAccountLableProps> {
    render() {
      const { colors, fonts } = this.props.theme as Theme;
      return (
        <View
          style={{
            height: 70,
            width: 70,
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <TouchableHighlight
            accessibilityTraits="button"
            testID={this.props.testID}
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: '#D3D4D6'
            }}
            underlayColor={colors.colorful.iron}
            onPress={this.props.onClick}
          >
            <>
              <View
                style={{
                  width: 48,
                  height: 48,
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Icon type="FontAwesome5" name="server" size={21} color={colors.backgroundColorDeeper} />
              </View>
              <View
                style={{
                  width: 21,
                  height: 21,
                  borderRadius: 10.5,
                  backgroundColor: colors.backgroundColor,
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'absolute',
                  right: 0,
                  bottom: 0
                }}
              >
                <View
                  style={{
                    width: 16,
                    height: 16,
                    backgroundColor: colors.primary,
                    borderRadius: 8,
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Icon type="MaterialCommunityIcons" name="plus" color={colors.backgroundColorDeeper} size={15} />
                </View>
              </View>
            </>
          </TouchableHighlight>
        </View>
      );
    }
  }
);
