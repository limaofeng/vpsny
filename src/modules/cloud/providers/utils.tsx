import { Instance } from '../type';
import { Theme } from '@components';
import React from 'react';
import { View, Text } from 'react-native';

export function getTip(data: Instance, theme: Theme) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Text style={[{ color: theme.colors.minor }, theme.fonts.headline]}>Instance:</Text>
      <Text style={[{ color: theme.colors.secondary, fontWeight: 'bold', marginLeft: 4 }, theme.fonts.footnote]}>
        {data.publicIP}
      </Text>
    </View>
  );
}

export function getObjectInformation(object: string, name: string, theme: Theme) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Text style={[{ color: theme.colors.secondary }, theme.fonts.headline]}>{object}:</Text>
      <Text style={[{ color: theme.colors.major, fontWeight: 'bold', marginLeft: 4 }, theme.fonts.footnote]}>
        {name}
      </Text>
    </View>
  );
}
