import React from 'react';
import {View, Text, Image, Pressable} from 'react-native';
import IonIcons from 'react-native-vector-icons/Ionicons';

const ChatHeader = ({navigation, recipientsData, groupName, colors}) => {
  return (
    <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
      <Pressable onPress={() => navigation.goBack()}>
        {({pressed}) => (
          <IonIcons
            name="arrow-back"
            size={24}
            color={pressed ? 'rgba(0, 0, 0, 0.1)' : colors.text}
          />
        )}
      </Pressable>

      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        {recipientsData.map((recipient, index) => (
          <Image
            key={index}
            style={{
              width: recipientsData.length > 1 ? 17 : 30,
              height: recipientsData.length > 1 ? 17 : 30,
              borderRadius: recipientsData.length > 1 ? 5 : 15,
              resizeMode: 'cover',
              left: index * 5,
            }}
            source={{uri: recipient.image}}
          />
        ))}
        <Text
          style={{
            marginLeft: recipientsData.length > 1 ? 15 : 5,
            fontSize: 15,
            fontWeight: 'bold',
            color: colors.text,
          }}>
          {groupName ? groupName : recipientsData[0]?.name}
        </Text>
      </View>
    </View>
  );
};

export default ChatHeader;
