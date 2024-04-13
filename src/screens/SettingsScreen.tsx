import {
  StyleSheet,
  Text,
  Alert,
  TouchableOpacity,
  TextInput,
  View,
  ScrollView,
  Image,
  ActivityIndicator,
  Modal,
  Pressable,
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
  const [modalVisible, setModalVisible] = React.useState(false);
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
        // Reset the state of each input and select
        setNewName('');
        setNewEmail('');
        setNewImage('');
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
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  const logout = React.useCallback(async () => {
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
  }, [navigation]);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={logout} style={{marginRight: 10}}>
          {({pressed}) => (
            <MaterialIcons
              name="logout"
              size={24}
              color={pressed ? 'rgba(0, 0, 0, 0.1)' : colors.text}
            />
          )}
        </Pressable>
      ),
    });
  }, [colors.text, logout, navigation]);

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
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size={'large'} color="#0000ff" />
        </View>
      ) : null}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={[styles.nameText, {color: colors.text}]}>{name}</Text>
        <Text style={[styles.emailText, {color: colors.text}]}>{email}</Text>
        {image ? (
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Image source={{uri: image}} style={styles.image} />
          </TouchableOpacity>
        ) : null}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(!modalVisible);
          }}>
          <View
            style={{
              flex: 1,
              backgroundColor: 'rgba(0, 0, 0, 0.55)',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Image
              style={{width: '100%', height: '100%', resizeMode: 'contain'}}
              source={{uri: image}}
            />
            <Pressable
              style={{position: 'absolute', top: 50, right: 20}}
              onPress={() => setModalVisible(false)}>
              <Text style={{color: 'white', fontSize: 30}}>X</Text>
            </Pressable>
          </View>
        </Modal>
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
          <View style={styles.imageContainer}>
            <Image source={{uri: newImage}} style={styles.selectedImage} />
            <TouchableOpacity
              style={styles.deselectButton}
              onPress={() => setNewImage('')}>
              <Text style={styles.deselectButtonText}>X</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Text style={[styles.noImageText, {color: colors.text}]}>
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
          style={({pressed}) => [
            {
              backgroundColor: pressed ? '#2a9d8f' : '#34C759',
            },
            styles.updateDetailsButton,
          ]}
          onPress={() => {
            if (userId) {
              updateUserDetails(userId, newName, newEmail, newImage);
            } else {
              Alert.alert('Error', 'User ID is null');
            }
          }}>
          <Text style={[styles.updateDetailsButtonText, {color: colors.text}]}>
            Update Details
          </Text>
        </Pressable>
        <Text style={styles.warningText}>
          Warning: This action will permanently delete your account.
        </Text>
        <Pressable
          style={({pressed}) => [
            {
              backgroundColor: pressed ? '#cc0000' : '#ff0000',
            },
            styles.deleteButton,
          ]}
          onPress={() => {
            if (userId) {
              deleteAccount(userId);
            } else {
              Alert.alert('Error', 'User ID is null');
            }
          }}>
          <Text style={[styles.deleteButtonText, {color: colors.text}]}>
            Delete Account
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nameText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    paddingTop: 20,
  },
  emailText: {
    fontSize: 16,
    marginBottom: 10,
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
    marginBottom: 20,
  },
  deselectButton: {
    position: 'absolute',
    top: 0,
    right: 0,
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
    marginBottom: 20,
    alignItems: 'center',
  },
  selectImageButtonText: {
    color: '#000',
    fontSize: 14,
  },
  updateDetailsButton: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginBottom: 20,
    width: '75%',
    alignItems: 'center',
  },
  updateDetailsButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  warningText: {
    color: 'red',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 150,
    marginBottom: 10,
  },
  deleteButton: {
    marginBottom: 200,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 5,
    width: '90%',
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
