import React from 'react';
import { Alert, Clipboard } from 'react-native';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { KeyPair } from '../../cloud/type';
import { ActionButton, Theme, Icon, withTheme } from '@components';
import firebase, { RNFirebase } from 'react-native-firebase';

interface KeyPairNewButProps {
  findKeyPairByPrivateKey: (privateKey: string) => KeyPair;
  pasteKeyPai: (privateKey: string) => void;
  generateKeyPair: () => void;
  theme?: Theme;
}

class KeyPairNewBut extends React.Component<KeyPairNewButProps> {
  analytics?: RNFirebase.Analytics;

  componentDidMount() {
    this.analytics = firebase.analytics();
  }

  handlePasteKeyPai = async () => {
    const { pasteKeyPai, findKeyPairByPrivateKey } = this.props;
    const content = await Clipboard.getString();
    if (!content.startsWith('-----BEGIN RSA PRIVATE KEY-----')) {
      Alert.alert(
        'Invalid Private Key',
        "Private Key should start with:\r\n'-----BEGIN RSA PRIVATE KEY-----'",
        [{ text: 'OK', onPress: () => console.log('OK Pressed') }],
        { cancelable: false }
      );
      return;
    }
    const keyPair = findKeyPairByPrivateKey(content);
    if (keyPair) {
      Alert.alert(
        'Duplicated',
        `This is already added as ${(keyPair as KeyPair).name}`,
        [{ text: 'OK', onPress: () => console.log('OK Pressed') }],
        { cancelable: false }
      );
      return;
    }
    this.analytics!.logEvent('KeyPairs_Paste');
    pasteKeyPai(content);
  };

  handleGenerateKeyPair = () => {
    const { generateKeyPair } = this.props;
    this.analytics!.logEvent('KeyPairs_Generate');
    generateKeyPair();
  }

  render() {
    const { colors } = this.props.theme as Theme;
    return (
      <ActionButton
        testID="keypairs-actions"
        position="right"
        radius={80}
        size={50}
        overlayStyle={{ bottom: 30, right: 10 }}
        btnOutRange={colors.colorful.darkBlue}
        buttonColor={colors.primary}
      >
        <ActionButton.Item
          testID="keypairs-actions-paste"
          onPress={this.handlePasteKeyPai}
          size={45}
          buttonColor={colors.colorful.green}
          title="Paste from Clipborad"
        >
          <Icon type="FontAwesome5" name="copy" size={18} color={colors.backgroundColorDeeper} />
        </ActionButton.Item>
        <ActionButton.Item
          size={45}
          onPress={this.handleGenerateKeyPair}
          buttonColor={colors.colorful.purple}
          title="Generate Key"
          testID="keypairs-actions-generate"
        >
          <Icon type="MaterialCommunityIcons" name="auto-fix" size={18} color={colors.backgroundColorDeeper} />
        </ActionButton.Item>
      </ActionButton>
    );
  }
}

const mapStateToProps = ({ settings: { keyPairs } }: any) => ({
  findKeyPairByPrivateKey: (privateKey: string) => {
    return keyPairs.find((k: any) => k.privateKey === privateKey);
  }
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  generateKeyPair() {
    dispatch({ type: 'settings/generateKeyPair' });
  },
  pasteKeyPai(privateKey: string) {
    dispatch({ type: 'settings/pasteKeyPai', payload: { privateKey } });
  }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withTheme(KeyPairNewBut, false));
