import io from 'socket.io-client';
import {baseURL} from '../config/API';
import {Platform} from 'react-native';
import PushNotification, {Importance} from 'react-native-push-notification';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import BackgroundTimer from 'react-native-background-timer';

export let socket;

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

let inConversation = false;

export function joinConversation(conversationId, userId) {
  console.log('joinConversation function called');
  inConversation = true;
  if (socket) {
    socket.emit('joinConversation', {conversationId, userId});
    console.log(
      `Socket is defined. Attempted to join conversation with ID: ${conversationId}`,
    );
  } else {
    console.log('Socket is not defined in joinConversation');
  }
}

export function leaveConversation(conversationId, userId) {
  console.log('leaveConversation function called');
  inConversation = false;
  if (socket) {
    socket.emit('leaveConversation', {conversationId, userId});
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
}

export function onMessageReceived(callback) {
  if (socket) {
    socket.on('message', message => {
      callback(message); // Call the original callback
    });

    console.log('Socket is defined in onMessageReceived');
  }
}
