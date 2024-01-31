import axios from 'axios';
import * as Keychain from 'react-native-keychain';
import {SERVER_ADDRESS} from '@env';
import {Alert} from 'react-native';
import {Platform} from 'react-native';

let accessToken = null;

// android reads localhost as the simulator's own local running address so we need to use this weird workaround
// Switch out baseURL with SERVER_ADDRESS below for connection to EC2 instance

export const baseURL =
  Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://localhost:8000';
// SERVER_ADDRESS;

// Create an Axios instance
const API = axios.create({
  baseURL,
  // baseURL: SERVER_ADDRESS,
});

// Add a request interceptor
API.interceptors.request.use(
  async config => {
    // If access token is null, get it from Keychain
    if (!accessToken) {
      const credentials = await Keychain.getGenericPassword();
      if (credentials) {
        const {username: userId, password: refreshToken} = credentials;

        // Access token not found or expired, get a new one using the refresh token
        try {
          const response = await axios.post(`${baseURL}/users/token`, {
            refreshToken: refreshToken,
          });
          accessToken = response.data.accessToken;
        } catch (error) {
          if (error.response && error.response.status === 401) {
            // Refresh token is invalid or expired, clear the stored credentials
            await Keychain.resetGenericPassword();
            Alert.alert('Session expired', 'Please login again.');
            // TODO: Redirect the user to the login screen
          } else {
            console.log('Error getting access token:', error.message);
          }
        }
      }
    }

    // Add the access token to the request header
    config.headers.Authorization = `Bearer ${accessToken}`;

    return config;
  },
  error => {
    return Promise.reject(error);
  },
);

export default API;
