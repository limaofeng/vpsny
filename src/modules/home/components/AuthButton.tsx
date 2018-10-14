import React from 'react';
import { connect } from 'react-redux';
import { Button } from 'react-native';
import { NavigationActions } from 'react-navigation';

const AuthButton = ({ logout, loginScreen, isLoggedIn }: AuthButtonProps) => (
  <Button title={isLoggedIn ? 'Log Out' : 'Open Login Screen'} onPress={isLoggedIn ? logout : loginScreen} />
);

interface AuthButtonProps {
  isLoggedIn: boolean;
  logout: () => void;
  loginScreen: () => void;
}

const mapStateToProps = (state: any) => ({
  isLoggedIn: state.auth.isLoggedIn
});

const mapDispatchToProps = (dispatch: any) => ({
  logout: () => dispatch({ type: 'auth/logout' }),
  loginScreen: () => dispatch(NavigationActions.navigate({ routeName: 'Login' }))
});

export default connect(mapStateToProps, mapDispatchToProps)(AuthButton);
