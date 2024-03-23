import {StyleSheet, Text, View, FlatList, Image, Alert} from 'react-native';
import React, {useEffect, useLayoutEffect, useContext} from 'react';
import * as Keychain from 'react-native-keychain';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {useNavigation} from '@react-navigation/native';
import {UserType} from '../../UserContext';
import API from '../config/API';
import {socket} from '../components/Socket';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <MaterialIcons onPress={logout} name="logout" size={24} color="black" />
      ),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderFriend = ({item}) => (
    <View style={styles.friendContainer}>
      <Image source={{uri: item.image}} style={styles.friendImage} />
      <View style={styles.friendInfo}>
        <Text style={styles.friendName}>{item.name}</Text>
      </View>
    </View>
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
});
