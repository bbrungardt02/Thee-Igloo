import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  Alert,
  TouchableOpacity,
  Button,
} from 'react-native';
import React, {useEffect, useLayoutEffect, useContext} from 'react';
import * as Keychain from 'react-native-keychain';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {useNavigation} from '@react-navigation/native';
import {UserType} from '../../UserContext';
import API from '../config/API';
import {socket} from '../components/Socket';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {openComposer} from 'react-native-email-link';
import Toast from 'react-native-toast-message';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const {userId, setUserId} = useContext(UserType);
  const [friends, setFriends] = React.useState([]);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const response = await API.get(`/friends/${userId}`);
        if (response.status === 200) {
          setFriends(response.data);
        }
      } catch (error) {
        console.log('error fetching friends', error);
      }
    };

    fetchFriends();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const deleteAccount = async userId => {
    Alert.alert('PERMANENTLY DELETE ACCOUNT', 'Are you sure?', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {
        text: 'Confirm',
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

  const removeFriend = async friendId => {
    try {
      const response = await API.delete(`/friends/${userId}/${friendId}`);
      if (response.status === 200) {
        setFriends(friends.filter(friend => friend._id !== friendId));
        Toast.show({
          type: 'success',
          text1: 'Friend removed & blocked successfully',
        });
      } else {
        throw new Error('Error removing & blocking friend');
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error removing & blocking friend',
      });
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <MaterialIcons onPress={logout} name="logout" size={24} color="black" />
      ),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sendEmail = () => {
    openComposer({
      to: 'bbrungardt5@gmail.com',
      body: 'Describe your issue here',
    });
  };

  const renderFriend = ({item}) => (
    <TouchableOpacity
      onPress={() =>
        Alert.alert('Block Friend', 'Are you sure? This may remove messages.', [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Block',
            onPress: () => removeFriend(item._id),
            style: 'destructive',
          },
        ])
      }>
      <View style={styles.friendContainer}>
        <Image source={{uri: item.image}} style={styles.friendImage} />
        <View style={styles.friendInfo}>
          <Text style={styles.friendName}>{item.name}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{padding: 10, marginHorizontal: 12}}>
      <Text style={styles.friendsHeader}>Friends</Text>
      {friends.length > 0 ? (
        <FlatList
          data={friends}
          renderItem={renderFriend}
          keyExtractor={(item, index) => item._id + index}
        />
      ) : (
        <View style={styles.noFriendsContainer}>
          <Text style={styles.noFriendsText}>You have no friends</Text>
          <Text style={styles.noFriendsSubText}>
            Go find them, they'll appear here.
          </Text>
        </View>
      )}

      <Button title="Report Issue" onPress={sendEmail} />

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteAccount(userId)}>
        <Text style={styles.deleteButtonText}>Delete Account</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  friendContainer: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  friendName: {
    fontSize: 16,
    color: '#000',
  },
  friendsHeader: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000',
  },
  friendImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  friendInfo: {
    flex: 1,
  },
  noFriendsContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noFriendsText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  noFriendsSubText: {
    fontSize: 16,
    color: 'gray',
    marginTop: 10,
  },
  deleteButton: {
    backgroundColor: '#ff0000',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 10,
    alignSelf: 'center',
  },
  deleteButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
});
