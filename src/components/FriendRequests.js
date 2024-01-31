import {StyleSheet, Text, View, Pressable, Image} from 'react-native';
import React, {useContext} from 'react';
import {UserType} from '../../UserContext';
import {useNavigation} from '@react-navigation/native';
import API from '../config/API';
import Icon from 'react-native-vector-icons/FontAwesome';

const FriendRequests = ({item, friendRequests, setFriendRequests}) => {
  const {userId, setUserId} = useContext(UserType);
  const navigation = useNavigation();

  const acceptRequest = async friendRequestId => {
    try {
      const response = await API.post(`/friends/accept`, {
        senderId: friendRequestId,
        recipientId: userId,
      });
      if (response.status === 200) {
        setFriendRequests(
          friendRequests.filter(response => response._id !== friendRequestId),
          navigation.replace('Chats'),
        );
      }
    } catch (error) {
      console.log('error accepting request', error);
    }
  };

  const rejectRequest = async friendRequestId => {
    try {
      const response = await API.post(`/friends/reject`, {
        senderId: friendRequestId,
        recipientId: userId,
      });
      if (response.status === 200) {
        setFriendRequests(
          friendRequests.filter(response => response._id !== friendRequestId),
        );
      }
    } catch (error) {
      console.log('error rejecting request', error);
    }
  };

  return (
    <Pressable
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginVertical: 10,
      }}>
      <Image
        style={{width: 50, height: 50, borderRadius: 25}}
        source={{uri: item.image}}
      />

      <Text style={{fontSize: 15, fontWeight: 'bold', marginLeft: 10, flex: 1}}>
        {item?.name} sent a friend request!
      </Text>

      <View style={{flexDirection: 'row'}}>
        <Pressable
          onPress={() => rejectRequest(item._id)}
          style={{
            backgroundColor: '#FF0000',
            padding: 10,
            borderRadius: 6,
            marginRight: 10,
          }}>
          <Icon name="times" size={24} color="white" />
        </Pressable>

        <Pressable
          onPress={() => acceptRequest(item._id)}
          style={{backgroundColor: '#007BFF', padding: 10, borderRadius: 6}}>
          <Icon name="check" size={24} color="white" />
        </Pressable>
      </View>
    </Pressable>
  );
};

export default FriendRequests;

const styles = StyleSheet.create({});
