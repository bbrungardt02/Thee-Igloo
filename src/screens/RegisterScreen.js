import {baseURL} from '../config/API';
import {
  Alert,
  KeyboardAvoidingView,
  Pressable,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import React, {useState} from 'react';
import {
  TextInput,
  GestureHandlerRootView,
  ScrollView,
} from 'react-native-gesture-handler';
import {useNavigation, useTheme} from '@react-navigation/native';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import {launchImageLibrary} from 'react-native-image-picker';

const RegisterScreen = () => {
  const [email, setEmail] = React.useState('');
  const [name, setName] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [image, setImage] = useState('');
  const navigation = useNavigation();
  const {colors} = useTheme();
  const [isLoading, setIsLoading] = useState(false);

  const selectImage = () => {
    launchImageLibrary({mediaType: 'photo'}, response => {
      if (!response.didCancel && !response.errorCode) {
        setImage(response);
      }
    });
  };

  const handleRegister = async () => {
    setIsLoading(true);
    if (password !== confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Passwords do not match!',
      });
      return;
    }

    let validImage =
      'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png';

    if (image) {
      const formData = new FormData();
      formData.append('file', {
        uri: image.assets[0].uri,
        type: image.assets[0].type,
        name: image.assets[0].fileName,
      });

      try {
        const response = await axios.post(`${baseURL}/chats/upload`, formData);
        validImage = response.data.url;
      } catch (error) {
        console.log('Failed to upload image:', error);
      }
    }

    const user = {
      name: name,
      email: email,
      password: password,
      image: validImage,
    };

    // send a POST request to the backend API to register the user
    try {
      const URL = `${baseURL}/users/register`;
      const response = await axios.post(URL, user);
      Alert.alert('Success', 'You have successfully registered!');
      setName('');
      setEmail('');
      setPassword('');
      setImage('');
      navigation.replace('Login');
      setTimeout(() => {
        setIsLoading(false);
      }, 2000);
    } catch (error) {
      Alert.alert('Error', error.message);
      console.log('registration failed', error);
      setTimeout(() => {
        setIsLoading(false);
      }, 2000);
    }
  };

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <ScrollView>
        <View
          style={{
            flex: 1,
            backgroundColor: colors.background,
            padding: 10,
            alignItems: 'center',
          }}>
          <KeyboardAvoidingView>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
              </View>
            ) : null}
            <View
              style={{
                marginTop: 20,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Text
                style={{
                  color: '#75E6DA',
                  fontSize: 17,
                  fontWeight: 'bold',
                }}>
                Register
              </Text>
              <Text
                style={{
                  fontSize: 17,
                  fontWeight: 'bold',
                  marginTop: 15,
                  color: colors.text,
                }}>
                Register to your account
              </Text>
            </View>

            <View
              style={{
                marginTop: 50,
              }}>
              <View style={{marginTop: 10}}>
                <Text style={{fontSize: 18, fontWeight: '600', color: 'grey'}}>
                  Name
                </Text>
                <TextInput
                  value={name}
                  onChangeText={text => setName(text)}
                  style={{
                    fontSize: name ? 18 : 18,
                    borderBottomColor: 'gray',
                    borderBottomWidth: 1,
                    marginVertical: 10,
                    width: 300,
                    color: colors.text,
                  }}
                  placeholderTextColor={colors.text}
                  placeholder="enter your name"
                />
              </View>

              <View>
                <Text style={{fontSize: 18, fontWeight: '600', color: 'grey'}}>
                  Email
                </Text>
                <TextInput
                  value={email}
                  onChangeText={text => setEmail(text)}
                  style={{
                    fontSize: email ? 18 : 18,
                    borderBottomColor: 'gray',
                    borderBottomWidth: 1,
                    marginVertical: 10,
                    width: 300,
                    color: colors.text,
                  }}
                  placeholderTextColor={colors.text}
                  placeholder="enter your email"
                />
              </View>

              <View style={{marginTop: 10}}>
                <Text style={{fontSize: 18, fontWeight: '600', color: 'grey'}}>
                  Password
                </Text>
                <TextInput
                  value={password}
                  onChangeText={text => setPassword(text)}
                  secureTextEntry={true}
                  style={{
                    fontSize: password ? 18 : 18,
                    borderBottomColor: 'gray',
                    borderBottomWidth: 1,
                    marginVertical: 10,
                    width: 300,
                    color: colors.text,
                  }}
                  placeholderTextColor={colors.text}
                  placeholder="enter password"
                />
              </View>
              <View style={{marginTop: 10}}>
                <Text style={{fontSize: 18, fontWeight: '600', color: 'grey'}}>
                  Confirm Password
                </Text>
                <TextInput
                  value={confirmPassword}
                  onChangeText={text => setConfirmPassword(text)}
                  secureTextEntry={true}
                  style={{
                    fontSize: confirmPassword ? 18 : 18,
                    borderBottomColor: 'gray',
                    borderBottomWidth: 1,
                    marginVertical: 10,
                    width: 300,
                    color: colors.text,
                  }}
                  placeholderTextColor={colors.text}
                  placeholder="confirm password"
                />
              </View>
              {image ? (
                <View style={styles.imageContainer}>
                  <Image
                    source={{uri: image.assets[0].uri}}
                    style={styles.selectedImage}
                  />
                  <TouchableOpacity
                    style={styles.deselectButton}
                    onPress={() => setImage('')}>
                    <Text style={styles.deselectButtonText}>X</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <Text
                  style={[
                    styles.noImageText,
                    {color: colors.text, marginTop: 20, marginBottom: 20},
                  ]}>
                  No image selected
                </Text>
              )}
              <Pressable
                style={({pressed}) => [
                  {
                    backgroundColor: pressed ? '#85a3b2' : '#ADD8E6',
                  },
                  styles.selectImageButton,
                ]}
                onPress={selectImage}>
                <Text style={styles.selectImageButtonText}>Select Image</Text>
              </Pressable>

              <Pressable
                onPress={handleRegister}
                style={({pressed}) => [
                  {
                    width: 200,
                    backgroundColor: pressed ? '#5DB8BE' : '#75E6DA',
                    padding: 15,
                    marginTop: 50,
                    marginLeft: 'auto',
                    marginRight: 'auto',
                    borderRadius: 6,
                  },
                ]}>
                <Text
                  style={{
                    color: 'white',
                    fontSize: 16,
                    fontWeight: 'bold',
                    textAlign: 'center',
                  }}>
                  Register
                </Text>
              </Pressable>

              <Pressable
                onPress={() => navigation.goBack()}
                style={{marginTop: 15}}>
                <Text
                  style={{textAlign: 'center', color: 'gray', fontSize: 16}}>
                  Already have an account? Sign In
                </Text>
              </Pressable>
            </View>
          </KeyboardAvoidingView>
        </View>
      </ScrollView>
    </GestureHandlerRootView>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
  textInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    width: '85%',
    marginBottom: 20,
    textAlign: 'center',
  },
  noImageText: {
    fontSize: 16,
    color: '#000',
    marginBottom: 10,
  },
  selectedImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
  imageContainer: {
    position: 'relative',
    alignItems: 'center',
    marginTop: 10,
  },
  deselectButton: {
    position: 'absolute',
    top: 0,
    right: 100,
    backgroundColor: '#fff',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deselectButtonText: {
    color: 'red',
    fontWeight: 'bold',
    fontSize: 20,
  },
  selectImageButton: {
    paddingVertical: 5,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
  },
  selectImageButtonText: {
    color: '#000',
    fontSize: 14,
  },
});
