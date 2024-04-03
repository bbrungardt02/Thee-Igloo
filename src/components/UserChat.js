import {StyleSheet, Text, View, Pressable, Image} from 'react-native';
import React, {useContext} from 'react';
import {UserType} from '../../UserContext';
import {useNavigation} from '@react-navigation/native';

const UserChat = ({item}) => {
  const {userId} = useContext(UserType);
  const navigation = useNavigation();

  // Filter out the current user from the participants array
  const otherParticipants = item.participants.filter(
    participant => participant._id !== userId,
  );
  // Select the first participant that is not the current user
  const firstOtherParticipant = otherParticipants[0];

  const lastMessage = item.messages[item.messages.length - 1];

  // Check if the last message has been read by the current user
  const isUnread = !lastMessage.readBy.includes(userId);

  return (
    <Pressable
      onPress={() =>
        navigation.navigate('Messages', {
          recipientId: firstOtherParticipant._id,
          conversationId: item._id,
        })
      }
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        borderWidth: 0.7,
        borderColor: '#d0d0d0',
        borderTopWidth: 0,
        borderLeftWidth: 0,
        borderRightWidth: 0,
        padding: 10,
        backgroundColor: '#DDD',
      }}>
      <Image
        style={{width: 50, height: 50, borderRadius: 25, resizeMode: 'cover'}}
        source={{uri: firstOtherParticipant?.image}}
      />
      <View style={{flex: 1}}>
        <Text style={{fontSize: 15, fontWeight: isUnread ? 'bold' : '500'}}>
          {item?.name ? item?.name : firstOtherParticipant?.name}
        </Text>
        <Text style={{marginTop: 3, color: 'gray', fontWeight: '500'}}>
          {lastMessage?.text}
        </Text>
      </View>

      {isUnread && (
        <View
          style={{
            backgroundColor: 'red',
            borderRadius: 10,
            width: 10,
            height: 10,
            marginRight: 10,
          }}
        />
      )}

      <View>
        <Text style={{fontSize: 11, fontWeight: '400', color: '#585858'}}>
          {new Date(lastMessage?.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
    </Pressable>
  );
};

export default UserChat;

const styles = StyleSheet.create({});
