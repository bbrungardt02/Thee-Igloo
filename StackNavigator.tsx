import React from 'react';
import {useColorScheme} from 'react-native';
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import FriendsScreen from './src/screens/FriendsScreen';
import ChatsScreen from './src/screens/ChatsScreen';
import ChatMessagesScreen from './src/screens/ChatMessagesScreen';
import NewChatScreen from './src/screens/NewChatScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import ReportScreen from './src/screens/ReportScreen';
import TermsScreen from './src/screens/TermsScreen';
import SettingsScreen from './src/screens/SettingsScreen';

// Define the type for your navigation parameters
export type RootParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  'Friend Requests': undefined;
  Chats: undefined;
  'New Chat': undefined;
  Messages: undefined;
  Profile: undefined;
  Report: undefined;
  Terms: undefined;
  Settings: undefined;
};

const StackNavigator: React.FC = () => {
  // Pass RootParamList to createNativeStackNavigator
  const Stack = createNativeStackNavigator<RootParamList>();
  const scheme = useColorScheme();

  return (
    <NavigationContainer theme={scheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack.Navigator>
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Friend Requests" component={FriendsScreen} />
        <Stack.Screen name="Chats" component={ChatsScreen} />
        <Stack.Screen name="New Chat" component={NewChatScreen} />
        <Stack.Screen name="Messages" component={ChatMessagesScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Report" component={ReportScreen} />
        <Stack.Screen name="Terms" component={TermsScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default StackNavigator;
