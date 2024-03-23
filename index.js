import AsyncStorage from '@react-native-async-storage/async-storage';
import {AppRegistry, Platform} from 'react-native';

import PushNotification from 'react-native-push-notification';
import PushNotificationIOS from '@react-native-community/push-notification-ios';

import App from './App';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => App);

PushNotification.configure({
  onRegister: async function (token) {
    console.log('TOKEN:', token);
    const storedToken = await AsyncStorage.getItem('pushToken');
    if (token.token !== storedToken) {
      await AsyncStorage.setItem('pushToken', token.token);
    }
  },

  onNotification: function (notification) {
    console.log('NOTIFICATION:', notification);
    notification.finish(PushNotificationIOS.FetchResult.NoData);
  },

  // // (optional) Called when Registered Action is pressed and invokeApp is false, if true onNotification will be called (Android)
  // onAction: function (notification) {
  //   console.log('ACTION:', notification.action);
  //   console.log('NOTIFICATION:', notification);

  //   // process the action
  // },

  // // (optional) Called when the user fails to register for remote notifications. Typically occurs when APNS is having issues, or the device is a simulator. (iOS)
  // onRegistrationError: function (err) {
  //   console.error(err.message, err);
  // },

  channelId: '1',

  // IOS ONLY (optional): default: all - Permissions to register.
  permissions: {
    alert: true,
    badge: true,
    sound: true,
  },

  // Should the initial notification be popped automatically
  // default: true
  popInitialNotification: true,

  /**
   * (optional) default: true
   * - Specified if permissions (ios) and token (android and ios) will requested or not,
   * - if not, you must call PushNotificationsHandler.requestPermissions() later
   * - if you are not using remote notification or do not have Firebase installed, use this:
   *     requestPermissions: Platform.OS === 'ios'
   */
  requestPermissions: Platform.OS === 'ios',
});
