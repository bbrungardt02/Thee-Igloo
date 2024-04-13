import React from 'react';
import {View, TextInput, Pressable, Text, Image} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {useTheme} from '@react-navigation/native';
import Video from 'react-native-video';

const ChatInput = ({
  handleSend,
  message,
  setMessage,
  handleSelectMedia,
  selectedImages,
  selectedVideos,
  selectedAudios,
}) => {
  const {colors} = useTheme();

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 10,
        borderTopWidth: 0.25,
        borderTopColor: 'F8F8F8',
      }}>
      <View style={{flexDirection: 'row', marginVertical: 10}}>
        {selectedImages.map((file, index) => (
          <Image
            key={index}
            source={{uri: file}}
            style={{width: 50, height: 50, marginRight: 10}}
          />
        ))}
        {selectedVideos.map((file, index) => (
          <Video
            key={index}
            source={{uri: file}}
            style={{width: 50, height: 50, marginRight: 10}}
          />
        ))}
        {/* You would need a component to display audios */}
      </View>
      <TextInput
        value={message}
        onChangeText={text => setMessage(text)}
        style={{
          flex: 1,
          height: 40,
          borderWidth: 1,
          borderColor: '#dddddd',
          borderRadius: 20,
          paddingHorizontal: 10,
          color: colors.text,
        }}
        placeholder="Igloo Message"
      />

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 7,
          marginHorizontal: 8,
        }}>
        <FontAwesome
          name="camera"
          size={24}
          color="gray"
          onPress={handleSelectMedia}
        />
        {/* //TODO Might need to use swift to record audios to be sent */}
        {/* <FontAwesome
          name="microphone"
          size={24}
          color="gray"
          onPress={() => handleSelectMedia('audio')}
        /> */}
      </View>

      <Pressable
        onPress={() => handleSend()}
        style={{
          backgroundColor: '#007bff',
          paddingVertical: 8,
          paddingHorizontal: 12,
          borderRadius: 20,
        }}>
        <Text style={{color: 'white', fontWeight: 'bold'}}>Send</Text>
      </Pressable>
    </View>
  );
};

export default ChatInput;
