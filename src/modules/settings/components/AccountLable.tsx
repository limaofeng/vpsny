import React from 'react';
import { Image, TouchableHighlight, View } from 'react-native';

import { Icon } from '../../../components';
import Theme, { withTheme } from '../../../components/Theme';
import { format } from '../../../utils';
import { Account } from '../../cloud/type';

export const logos = {
  vpsny: require('../../cloud/assets/logo/vpsny.png'),
  vultr: require('../../cloud/assets/logo/vultr.png'),
  lightsail: require('../../cloud/assets/logo/lightsail.png'),
  digitalocean: require('../../cloud/assets/logo/digitalocean.png')
};

interface AccountLableProps {
  theme?: Theme;
  light?: boolean;
  value?: Account;
  logo: 'vpsny' | 'vultr' | 'lightsail';
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
    const { logo } = this.props;
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
              <Image source={logos[logo]} resizeMode="contain" style={{ height: 28, width: 28 }} />
            </View>
          </TouchableHighlight>
        </View>
      </View>
    );
  }
}

const AccountLableWarp = withTheme(AccountLable);

export default AccountLableWarp;

export const AllAccountLable = ({ light, onClick }: { light: boolean; onClick?: (account?: Account) => void }) => {
  return <AccountLableWarp logo={'vpsny'} light={light} onClick={onClick} />;
};

interface NewAccountLableProps {
  theme?: Theme;
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
