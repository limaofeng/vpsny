import { Item, List, Note } from '@components';
import React from 'react';
import { StyleSheet } from 'react-native';
import Spinner from 'react-native-spinkit';

import Theme, { withTheme } from '../../../components/Theme';
import { KeyPair } from '../../cloud/type';

interface KeyPairsProps {
  title: string;
  keyPairs: KeyPair[];
  mode?: 'choose' | 'manage';
  theme?: Theme;
  value?: any;
  onChange?: (value: any) => void;
  onClick: (value: KeyPair) => void;
  additional?: (value: KeyPair) => React.ReactElement<any>;
}

interface KeyPairsState {
  value: KeyPair;
}

class KeyPairs extends React.Component<KeyPairsProps, KeyPairsState> {
  constructor(props: KeyPairsProps) {
    super(props);
    this.state = { value: props.value };
  }
  handleClick = (value: KeyPair) => {
    this.props.onClick(value);
  };
  handleChange = (value: KeyPair) => {
    const { onChange } = this.props;
    this.setState({ value });
    onChange && onChange(value);
  };
  render() {
    const { colors } = this.props.theme as Theme;
    const { keyPairs, title, additional, mode } = this.props;
    const isChoose = mode === 'choose';
    return (
      <List valueKey="id" value={this.state.value} onChange={this.handleChange} type={isChoose ? 'radio-group' : 'list'} title={title}>
        {keyPairs.length ? (
          keyPairs.map(keyPair => (
            <Item
              value={keyPair}
              key={keyPair.id}
              onClick={this.handleClick}
              push={!isChoose && (additional ? false : !!keyPair.privateKey)}
            >
              {!keyPair.privateKey ? (
                <>
                  <Spinner
                    key="spinner-loading"
                    style={styles.spinner}
                    isVisible={true}
                    size={20}
                    type="Wave"
                    color={colors.colorful.green}
                  />
                  <Note key="spinner-title">Generating 1024 bit RSA keys</Note>
                </>
              ) : (
                <>
                  <Note style={{ flex: 1 }}>{keyPair.name}</Note>
                  {additional && additional(keyPair)}
                </>
              )}
            </Item>
          ))
        ) : (
          <Item>
            <Note> No Keys</Note>
          </Item>
        )}
      </List>
    );
  }
}

export default withTheme(KeyPairs);

const styles = StyleSheet.create({
  spinner: {
    marginRight: 5
  }
});
