import io from 'socket.io-client';
import {baseURL} from '../config/API';
import {Platform} from 'react-native';
import PushNotification, {Importance} from 'react-native-push-notification';

let socket;

export function connectSocket(userId) {
  // Connect to the socket server
  const socketAddress = baseURL;
  socket = io(socketAddress, {
    query: {userId},
  });

  socket.on('connect', () => {
    console.log('Connected to the socket server');
  });

  socket.on('userOnline', userId => {
    console.log(`User ${userId} is online`);
  });
}

export function joinConversation(conversationId) {
  console.log('joinConversation function called');

  if (socket) {
    socket.emit('joinConversation', conversationId);
    console.log(
      `Socket is defined. Attempted to join conversation with ID: ${conversationId}`,
    );
  } else {
    console.log('Socket is not defined in joinConversation');
  }
}

export function leaveConversation(conversationId) {
  console.log('leaveConversation function called');

  if (socket) {
    socket.emit('leaveConversation', conversationId);
    console.log(
      `Socket is defined. Attempted to leave conversation with ID: ${conversationId}`,
    );
  } else {
    console.log('Socket is not defined in leaveConversation');
  }
}

export function sendMessage(message) {
  if (socket) {
    socket.emit('message', message);
  }
  if (Platform.OS === 'android') {
    PushNotification.createChannel(
      {
        channelId: 'channel-id',
        channelName: 'My channel',
        channelDescription: 'A channel to categorise your notifications', // (optional) default: undefined.
        playSound: false, // (optional) default: true
        soundName: 'default', // (optional) See `soundName` parameter of `localNotification` function
        importance: Importance.HIGH, // (optional) default: Importance.HIGH. Int value of the Android notification importance
        vibrate: true, // (optional) default: true. Creates the default vibration pattern if true.
      },
      created => console.log(`createChannel returned '${created}'`), // (optional) callback returns whether the channel was created, false means it already existed.
    );

    PushNotification.localNotification({
      title: message.userId.name,
      message: message.text,
      channelId: '1',
    });
  }
}

export function onMessageReceived(callback) {
  if (socket) {
    socket.on('message', callback);
    console.log('Socket is defined in onMessageReceived');
  }
}
