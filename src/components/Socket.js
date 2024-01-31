import io from 'socket.io-client';
import {baseURL} from '../config/API';

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
}

export function onMessageReceived(callback) {
  if (socket) {
    socket.on('message', callback);
    console.log('Socket is defined in onMessageReceived');
  }
}
