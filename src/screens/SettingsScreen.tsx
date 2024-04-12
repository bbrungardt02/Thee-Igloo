import {
  StyleSheet,
  Text,
  Alert,
  TouchableOpacity,
  TextInput,
  View,
  Image,
  ActivityIndicator,
} from 'react-native';
import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Keychain from 'react-native-keychain';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {
  useNavigation,
  useTheme,
  NavigationProp,
} from '@react-navigation/native';
import API from '../config/API';
import {socket} from '../components/Socket.js';
import {RootParamList} from '../../StackNavigator.tsx';
import {UserType} from '../../UserContext.tsx';
import {launchImageLibrary} from 'react-native-image-picker';
import Toast from 'react-native-toast-message';

const SettingsScreen = () => {
  const navigation = useNavigation<NavigationProp<RootParamList>>();
  const userContext = React.useContext(UserType);
  const {colors} = useTheme();
  // Check if userContext is defined before destructuring userId
  const userId = userContext ? userContext.userId : null;
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [image, setImage] = React.useState('');
  const [newName, setNewName] = React.useState('');
  const [newEmail, setNewEmail] = React.useState('');
  const [newImage, setNewImage] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const getUserDetails = async () => {
    try {
      const response = await API.get('/users/me');

      if (response.status === 200) {
        setName(response.data.name);
        setEmail(response.data.email);
        setImage(response.data.image);
      } else {
        Alert.alert('Error', 'Error retrieving user details');
      }
    } catch (error) {
      Alert.alert('Error', 'Error retrieving user details');
      console.error(error);
    }
  };

  React.useEffect(() => {
    getUserDetails();
  }, []);

  const selectImage = () => {
    const options = {
      mediaType: 'photo' as 'photo',
    };

    launchImageLibrary(options, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } else if (response.assets && response.assets[0].uri) {
        const source = {uri: response.assets[0].uri};
        setNewImage(source.uri);
      }
    });
  };

  const updateUserDetails = async (
    userId: string,
    newName: string,
    newEmail: string,
    newImage: string,
  ) => {
    setIsLoading(true);
    try {
      let imageUrl = newImage;

      // Check if newImage is not empty
      if (newImage) {
        // Create a new FormData object
        let formData = new FormData();
        // Append the newImage file to formData
        formData.append('file', {
          uri: newImage,
          type: 'image/jpeg',
          name: 'upload.jpg',
        });

        // Make a POST request to the '/upload' endpoint
        const uploadResponse = await API.post('chats/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        // If the request is successful, get the URL of the uploaded image
        if (uploadResponse.status >= 200 && uploadResponse.status < 300) {
          const uploadResult = uploadResponse.data;
          imageUrl = uploadResult.url;
        } else {
          throw new Error('Failed to upload image to S3');
        }
      }

      // Define the type for the update object
      type UpdateObject = {
        name?: string;
        email?: string;
        image?: string;
      };

      // Create an update object with only the provided fields
      const update: UpdateObject = {};
      if (newName) {
        update.name = newName;
      }
      if (newEmail) {
        update.email = newEmail;
      }
      if (imageUrl) {
        update.image = imageUrl;
      }

      const response = await API.put(`/users/update/${userId}`, update);

      if (response.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'User updated successfully',
        });
        // Update the user details in your application state
        if (newName) {
          setName(newName);
        }
        if (newEmail) {
          setEmail(newEmail);
        }
        if (imageUrl) {
          setImage(imageUrl);
        }
      } else {
        Alert.alert('Error', 'Error updating user');
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error updating user',
      });
      console.error(error);
    }
    setIsLoading(false);
  };

  const logout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {
        text: 'Confirm',
        onPress: async () => {
          // Disconnect the user from the socket
          if (socket) {
            socket.disconnect();
          }

          // Get the device token
          let deviceToken = null;
          try {
            deviceToken = await AsyncStorage.getItem('pushToken');
          } catch (error) {
            console.log('Error getting device token from AsyncStorage:', error);
          }

          // Send a request to the logout endpoint with the device token
          const URL = '/users/logout';
          API.post(URL, {deviceToken});

          // Clear user credentials from Keychain
          await Keychain.resetGenericPassword();
          navigation.reset({
            index: 0,
            routes: [{name: 'Login'}],
          });
        },
      },
    ]);
  };

  const deleteAccount = async (userId: string) => {
    Alert.alert('PERMANENTLY DELETE ACCOUNT', 'Are you sure?', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {
        text: 'Confirm',
        style: 'destructive',
        onPress: async () => {
          try {
            // Disconnect the user from the socket
            if (socket) {
              socket.disconnect();
            }

            // Send a request to the delete endpoint
            const response = await API.delete(`/users/delete/${userId}`);
            if (response.status !== 200) {
              throw new Error('Error deleting account');
            }

            // Clear user credentials from Keychain
            await Keychain.resetGenericPassword();

            navigation.reset({
              index: 0,
              routes: [{name: 'Login'}],
            });
          } catch (error) {
            Alert.alert('Error', 'Error deleting account');
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      {isLoading ? <ActivityIndicator size="large" color="#0000ff" /> : null}
      <Text>{name}</Text>
      <Text>{email}</Text>
      {image ? <Image source={{uri: image}} style={styles.image} /> : null}
      <TextInput
        style={styles.textInput}
        value={newName}
        onChangeText={setNewName}
        placeholder="Name"
      />
      <TextInput
        style={styles.textInput}
        value={newEmail}
        onChangeText={setNewEmail}
        placeholder="Email"
      />
      {newImage ? (
        <Image source={{uri: newImage}} style={styles.image} />
      ) : (
        <Text>No image selected</Text>
      )}
      <TouchableOpacity style={styles.button} onPress={selectImage}>
        <Text style={styles.buttonText}>Select Image</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          if (userId) {
            updateUserDetails(userId, newName, newEmail, newImage);
          } else {
            Alert.alert('Error', 'User ID is null');
          }
        }}>
        <Text style={styles.buttonText}>Update Details</Text>
      </TouchableOpacity>
      <MaterialIcons
        onPress={logout}
        name="logout"
        size={24}
        color={colors.text}
      />
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => {
          if (userId) {
            deleteAccount(userId);
          } else {
            Alert.alert('Error', 'User ID is null');
          }
        }}>
        <Text style={styles.deleteButtonText}>Delete Account</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  textInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    width: '100%',
    marginBottom: 20,
    paddingLeft: 10,
  },
  image: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
  buttonText: {
    color: '#FFFFFF',
  },
  deleteButton: {
    backgroundColor: '#ff0000',
    padding: 10,
    borderRadius: 5,
  },
  deleteButtonText: {
    color: '#ffffff',
  },
});
