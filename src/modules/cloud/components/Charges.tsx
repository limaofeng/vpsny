import React, { Component } from 'react';
import { List, Item, ItemStart, Icon, ItemBody, Note, Label, withTheme, Theme } from '@components';
import { Instance } from '../Provider';

interface ChargesProps {
  theme: Theme;
  data: Instance;
}

export default class Charges extends Component<ChargesProps> {
  render() {
    const { colors, fonts } = this.props.theme;
    const { data } = this.props;
    return (
      <List>
        <Item
          onClick={() => {
            this.setState({ visible: true });
          }}
          style={{ paddingLeft: 15, paddingRight: 15 }}
          bodyStyle={{ paddingLeft: 6 }}
        >
          <ItemStart style={{ width: 20 }}>
            <Icon type="FontAwesome" color={colors.minor} name="credit-card-alt" size={12} />
          </ItemStart>
          <ItemBody style={{ paddingLeft: 6 }}>
            <Note style={{ flex: 1 }}>
              ${data.pendingCharges!.toFixed(2)} of ${data.costPerMonth!.toFixed(2)} per month
            </Note>
            <Label style={[fonts.subhead, { textAlign: 'right', marginRight: 15 }]}>Charges</Label>
          </ItemBody>
        </Item>
      </List>
    );
  }
}