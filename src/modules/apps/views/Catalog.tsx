import React from 'react';
import { connect } from 'react-redux';
import { NavigationScreenOptions, SafeAreaView } from 'react-navigation';
import { StyleSheet, Text, View, WebView, TextInput, TouchableOpacity, Dimensions } from 'react-native';

interface TerminalProps {
  user: any;
  bill: any;
  dispatch: any;
}
interface TerminalState {
  logs: string[];
  input?: string;
  timestamp: number;
}

const keymaps = {
  Backspace: '\x7f',
  Enter: '\r'
};

class Terminal extends React.Component<TerminalProps, TerminalState> {
  static navigationOptions: NavigationScreenOptions = {
    tabBarVisible: false
  };
  input: TextInput | null | undefined;
  xterm: WebView | null | undefined;
  constructor(props: TerminalProps) {
    super(props);
  }
  handleOpenKeyboard = () => {
    (this.input as TextInput).focus();
  };
  handleInput = (value: string) => {
  };
  render() {
    const { logs, input } = this.state;
    return (
      <SafeAreaView style={[styles.container]}>
      </SafeAreaView>
    );
  }
  searchChange(text: string): any {
    console.log(text);
  }
}

const styles = StyleSheet.create({
  container: {
    // backgroundColor: '#24262C',
    flex: 1
  },
  username: {
    marginTop: 44,
    marginLeft: 16,
    fontSize: 34,
    lineHeight: 41,
    letterSpacing: 0.41,
    color: '#000000'
  },
  email: {
    marginTop: 10,
    marginLeft: 16,
    fontFamily: 'Raleway',
    fontSize: 13,
    color: '#616366'
  },
  cardContainer: {
    marginTop: 10,
    paddingHorizontal: 7,
    marginRight: 10,
    borderRadius: 8,
    backgroundColor: '#fff',
    shadowColor: '#d2d8dc',
    shadowOffset: {
      width: 0,
      height: 1
    },
    shadowRadius: 6,
    shadowOpacity: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  cardTitle: {
    fontFamily: 'Helvetica',
    fontSize: 20,
    color: '#7cb342'
  },
  cardSummary: {
    fontFamily: 'Raleway',
    fontSize: 10,
    textAlign: 'left',
    color: '#979797'
  }
});

export default connect()(Terminal);
