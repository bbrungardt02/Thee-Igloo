import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  Alert,
  TouchableOpacity,
  Button,
  ScrollView,
} from 'react-native';
import React, {useEffect, useContext} from 'react';
import * as Keychain from 'react-native-keychain';
import {useNavigation, useTheme} from '@react-navigation/native';
import {UserType} from '../../UserContext';
import API from '../config/API';
import {socket} from '../components/Socket';
import {openComposer} from 'react-native-email-link';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/Ionicons';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const {userId} = useContext(UserType);
  const [friends, setFriends] = React.useState([]);
  const {colors} = useTheme();

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

  // const deleteAccount = async userId => {
  //   Alert.alert('PERMANENTLY DELETE ACCOUNT', 'Are you sure?', [
  //     {
  //       text: 'Cancel',
  //       onPress: () => console.log('Cancel Pressed'),
  //       style: 'cancel',
  //     },
  //     {
  //       text: 'Confirm',
  //       style: 'destructive',
  //       onPress: async () => {
  //         try {
  //           // Disconnect the user from the socket
  //           if (socket) {
  //             socket.disconnect();
  //           }

  //           // Send a request to the delete endpoint
  //           const response = await API.delete(`/users/delete/${userId}`);
  //           if (response.status !== 200) {
  //             throw new Error('Error deleting account');
  //           }

  //           // Clear user credentials from Keychain
  //           await Keychain.resetGenericPassword();

  //           navigation.reset({
  //             index: 0,
  //             routes: [{name: 'Login'}],
  //           });
  //         } catch (error) {
  //           Alert.alert('Error', 'Error deleting account');
  //         }
  //       },
  //     },
  //   ]);
  // };

  const removeFriend = async friendId => {
    Alert.alert('Block User', 'Are you sure you want to block this user?', [
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
        },
      },
    ]);
  };

  const sendEmail = () => {
    openComposer({
      to: 'bbrungardt5@gmail.com',
      body: 'Describe your issue here',
    });
  };

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
          <Icon
            name="settings-outline"
            size={25}
            color={colors.text}
            style={{marginRight: 10}}
          />
        </TouchableOpacity>
      ),
    });
  }, [colors.text, navigation]);

  const renderFriend = ({item}) => (
    <TouchableOpacity
      onPress={() =>
        Alert.alert('Action', 'What do you want to do?', [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Report User',
            onPress: () =>
              navigation.navigate('Report', {
                reportedName: item.name,
                reportedEmail: item.email,
              }),
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
          <Text style={styles.friendEmail}>{item.email}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={{flex: 1, padding: 10, marginHorizontal: 12}}>
      <Text style={[styles.friendsHeader, {color: colors.text}]}>Friends</Text>
      {friends.length > 0 ? (
        <FlatList
          data={friends}
          renderItem={renderFriend}
          keyExtractor={(item, index) => item._id + index}
          scrollEnabled={false}
        />
      ) : (
        <View style={styles.noFriendsContainer}>
          <Text style={[styles.noFriendsText, {color: colors.text}]}>
            You have no friends
          </Text>
          <Text style={[styles.noFriendsSubText, {color: colors.text}]}>
            Go find them, they'll appear here.
          </Text>
        </View>
      )}

      <Button title="Report Issue" onPress={sendEmail} />

      {/* <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteAccount(userId)}>
        <Text style={styles.deleteButtonText}>Delete Account</Text>
      </TouchableOpacity> */}
    </ScrollView>
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
  friendEmail: {
    fontSize: 14,
    color: '#888',
    marginTop: 2,
  },
  friendsHeader: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
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
  // deleteButton: {
  //   backgroundColor: '#ff0000',
  //   paddingVertical: 10,
  //   paddingHorizontal: 20,
  //   borderRadius: 5,
  //   marginTop: 10,
  //   marginBottom: 200,
  //   alignSelf: 'center',
  // },
  // deleteButtonText: {
  //   color: '#ffffff',
  //   fontWeight: 'bold',
  // },
});
