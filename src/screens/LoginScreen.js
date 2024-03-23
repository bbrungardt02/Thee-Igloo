import {baseURL} from '../config/API';
import {
  KeyboardAvoidingView,
  Pressable,
  StyleSheet,
  Text,
  View,
  Alert,
} from 'react-native';
import React, {useEffect} from 'react';
import {TextInput, GestureHandlerRootView} from 'react-native-gesture-handler';
import {useNavigation} from '@react-navigation/native';
import {connectSocket} from '../components/Socket';
import * as Keychain from 'react-native-keychain';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

let accessToken = null;

const LoginScreen = () => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const navigation = useNavigation();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const credentials = await Keychain.getGenericPassword();
        if (credentials) {
          const {username: userId, password: refreshToken} = credentials;

          // Access token not found or expired, get a new one using the refresh token
          const URL = `${baseURL}/users/token`;
          const response = await axios.post(URL, {
            refreshToken: refreshToken,
          });
          accessToken = response.data.accessToken;

          // Connect to the socket using socket.io and set the user online
          connectSocket(userId);

          navigation.replace('Home');
        } else {
          // Refresh token not found, show the login screen itself
        }
      } catch (error) {
        console.log('error', error);
      }
    };

    checkLoginStatus();
  }, [navigation]);

  const handleLogin = async () => {
    // Get the device token
    let deviceToken = null;
    try {
      deviceToken = await AsyncStorage.getItem('pushToken');
    } catch (error) {
      console.log('Error getting device token from AsyncStorage:', error);
    }

    const user = {
      email: email,
      password: password,
      deviceToken: deviceToken,
    };

    const URL = `${baseURL}/users/login`;
    axios
      .post(URL, user)
      .then(async response => {
        accessToken = response.data.accessToken;
        const refreshToken = response.data.refreshToken;
        const userId = response.data.userId;
        await Keychain.setGenericPassword(userId.toString(), refreshToken);

        // Connect to the socket and set the user online
        connectSocket(userId);

        navigation.replace('Home');
      })
      .catch(error => {
        Alert.alert('Login Error', 'Invalid email or password');
        console.log('Login Error', error);
      });
  };
  return (
    <GestureHandlerRootView style={styles.root}>
      <View style={styles.container}>
        <KeyboardAvoidingView>
          <View style={styles.innerContainer}>
            <Text style={styles.signInText}>Sign In</Text>
            <Text style={styles.signInSubText}>Sign in to your account</Text>
          </View>
          <View style={styles.formContainer}>
            <View>
              <Text style={styles.labelText}>Email</Text>
              <TextInput
                value={email}
                onChangeText={text => setEmail(text)}
                style={styles.input}
                placeholderTextColor={'black'}
                placeholder="enter your Email"
              />
            </View>
            <View style={styles.passwordContainer}>
              <Text style={styles.labelText}>Password</Text>
              <TextInput
                value={password}
                onChangeText={text => setPassword(text)}
                secureTextEntry={true}
                style={styles.input}
                placeholderTextColor={'black'}
                placeholder="enter your Password"
              />
            </View>
            <Pressable onPress={handleLogin} style={styles.loginButton}>
              <Text style={styles.loginButtonText}>Login</Text>
            </Pressable>
            <Pressable
              onPress={() => navigation.navigate('Register')}
              style={styles.registerContainer}>
              <Text style={styles.registerText}>
                Don't have an account? Sign Up
              </Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </View>
    </GestureHandlerRootView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 10,
    alignItems: 'center',
  },
  innerContainer: {
    marginTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signInText: {
    color: '#75E6DA',
    fontSize: 17,
    fontWeight: 'bold',
  },
  signInSubText: {
    fontSize: 17,
    fontWeight: 'bold',
    marginTop: 15,
  },
  formContainer: {
    marginTop: 50,
  },
  labelText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'grey',
  },
  input: {
    fontSize: 18,
    borderBottomColor: 'gray',
    borderBottomWidth: 1,
    marginVertical: 10,
    width: 300,
  },
  passwordContainer: {
    marginTop: 10,
  },
  loginButton: {
    width: 200,
    backgroundColor: '#75E6DA',
    padding: 15,
    marginTop: 50,
    marginLeft: 'auto',
    marginRight: 'auto',
    borderRadius: 6,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  registerContainer: {
    marginTop: 15,
  },
  registerText: {
    textAlign: 'center',
    color: 'gray',
    fontSize: 16,
  },
});
