import {StyleSheet, Text, View, Pressable, Image} from 'react-native';
import React, {useContext} from 'react';
import {UserType} from '../../UserContext';
import API from '../config/API';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/FontAwesome';

const User = ({item}) => {
  const {userId, setUserId} = useContext(UserType);
  const [requestSent, setRequestSent] = React.useState(false);

  const sendFriendRequest = async (currentUserId, selectedUserId) => {
    try {
      const response = await API.post(`/friends/request`, {
        currentUserId,
        selectedUserId,
      });
      if (response.status === 200) {
        setRequestSent(true);
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Friend request sent!',
        });
      } else {
        throw new Error('Failed to send friend request');
      }
    } catch (error) {
      console.log('error sending request', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to send friend request',
      });
    }
  };

  return (
    <Pressable
      style={{flexDirection: 'row', alignItems: 'center', marginVertical: 10}}>
      <View>
        <Image
          source={{uri: item.image}}
          style={{width: 50, height: 50, borderRadius: 25, resizeMode: 'cover'}}
        />
      </View>

      <View style={{marginLeft: 12, flex: 1}}>
        <Text style={{fontWeight: 'bold'}}>{item?.name}</Text>
        <Text style={{marginTop: 4, color: 'gray'}}>{item?.email}</Text>
      </View>

      <Pressable
        onPress={() => sendFriendRequest(userId, item._id)}
        style={{
          backgroundColor: '#69D2E7',
          padding: 10,
          borderRadius: 6,
          width: 105,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        {requestSent ? (
          <Icon name="check" size={24} color="white" />
        ) : (
          <Text style={{textAlign: 'center', color: 'white', fontSize: 13}}>
            Add Friend
          </Text>
        )}
      </Pressable>
    </Pressable>
  );
};

export default User;

const styles = StyleSheet.create({});
