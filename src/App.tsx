import React from 'react';
import { createAppContainer, createStackNavigator } from 'react-navigation';
import { HomeScreen } from './screens/HomeScreen';
import { MessagingProvider } from './screens/MessagingContext';
import { MessagingScreen } from './screens/MessagingScreen';

const AppNavigator = createStackNavigator({
  Home: HomeScreen,
  Messaging: MessagingScreen
}, { initialRouteName: "Home" });

const AppContainer = createAppContainer(AppNavigator);

export default () => <MessagingProvider>
  <AppContainer></AppContainer>
</MessagingProvider>;
