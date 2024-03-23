/* eslint-disable react-hooks/exhaustive-deps */
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  KeyboardAvoidingView,
  TextInput,
  Pressable,
  Image,
  SafeAreaView,
} from 'react-native';
import React, {useContext, useEffect, useLayoutEffect, useRef} from 'react';
import {UserType} from '../../UserContext';
import Entypo from 'react-native-vector-icons/Entypo';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import IonIcons from 'react-native-vector-icons/Ionicons';
import {useRoute} from '@react-navigation/native';
import {useNavigation} from '@react-navigation/native';
// import * as ImagePicker from 'react-native-image-picker';
import {
  joinConversation,
  sendMessage,
  onMessageReceived,
  leaveConversation,
} from '../components/Socket';
import API from '../config/API';
import {Platform} from 'react-native';

const ChatMessagesScreen = () => {
  const {userId, userName} = useContext(UserType);
  const [message, setMessage] = React.useState('');
  const [messages, setMessages] = React.useState([]);
  const route = useRoute();
  const {conversationId} = route.params;
  const [selectedImage, setSelectedImage] = React.useState('');
  const navigation = useNavigation();
  const [recipientsData, setRecipientsData] = React.useState([]);
  const isJoined = React.useRef(false);
  const [groupName, setGroupName] = React.useState('');

  const scrollViewRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (scrollViewRef.current) {
      if (Platform.OS === 'ios') {
        scrollViewRef.current.scrollToEnd({animated: false});
      } else if (Platform.OS === 'android') {
        setTimeout(() => {
          scrollViewRef.current.scrollTo({y: 1000000, animated: false});
        }, 100);
      }
    }
  };

  useEffect(() => {
    if (!isJoined.current) {
      // Access the current value of the ref
      joinConversation(conversationId, userId);
      isJoined.current = true; // Update the ref
    }
    // Clean up the effect when the component unmounts
    return () => {
      leaveConversation(conversationId, userId);
      isJoined.current = false; // Reset the ref
    };
  }, [conversationId]); // Remove isJoined from the dependency array

  const fetchMessages = async conversationId => {
    try {
      const response = await API.get(`/chats/messages/${conversationId}`);
      if (response.status === 200) {
        setMessages(response.data);
      }
    } catch (error) {
      console.error('Error fetching messages', error);
    }
  };

  useEffect(() => {
    fetchMessages(conversationId);
  }, []);

  useEffect(() => {
    onMessageReceived(message => {
      setMessages(prevMessages => [...prevMessages, message]);
    });
  }, []);

  const handleSend = async () => {
    // If message is an empty string, return immediately
    if (!message.trim()) {
      return;
    }

    try {
      const newMessage = {
        conversationId: conversationId,
        userId: {
          _id: userId,
          name: userName,
        },
        text: message,
        timestamp: new Date().toISOString(),
      };

      sendMessage(newMessage);
      // Clear the message input
      setMessage('');
    } catch (error) {
      console.log('error sending message', error);
    }
  };

  const formatTime = time => {
    const options = {hour: 'numeric', minute: 'numeric'};
    return new Date(time).toLocaleString([], options);
  };

  // S3 bucket needed for ImagePicker

  // const pickImage = () => {
  //   ImagePicker.launchImageLibrary(
  //     {
  //       mediaType: 'photo',
  //       includeBase64: false,
  //       maxHeight: 200,
  //       maxWidth: 200,
  //     },
  //     response => {
  //       console.log(response);
  //       if (response.didCancel) {
  //         console.log('User cancelled image picker');
  //       } else if (response.error) {
  //         console.log('ImagePicker Error: ', response.error);
  //       } else {
  //         const source = {uri: response.assets[0].uri};
  //         console.log(source);
  //         setSelectedImage(response.assets[0].uri); // only set the selected image URI to state
  //       }
  //     },
  //   );
  // };

  useEffect(() => {
    const fetchRecipientsData = async () => {
      try {
        const response = await API.get(`/chats/conversation/${conversationId}`);
        if (response.status === 200) {
          let recipientsData;
          if (response.data.participants.length > 2) {
            recipientsData = response.data.participants; // Don't filter out the user if it's a group chat
          } else {
            recipientsData = response.data.participants.filter(
              participant => participant._id !== userId,
            );
          }
          setRecipientsData(recipientsData);
          setGroupName(response.data.name);
        }
      } catch (error) {
        console.log('error fetching recipient data', error);
      }
    };

    fetchRecipientsData();
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: '',
      headerLeft: () => (
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
          <IonIcons
            onPress={() => navigation.goBack()}
            name="arrow-back"
            size={24}
            color="black"
          />

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
              }}>
              {groupName ? groupName : recipientsData[0]?.name}
            </Text>
          </View>
        </View>
      ),
    });
  }, [recipientsData, groupName]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
      style={{flex: 1}}>
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={{flexGrow: 1}}
        onContentSizeChange={scrollToBottom}>
        {messages.map((item, index) => {
          if (item.text) {
            return (
              <Pressable
                key={index}
                style={[
                  item?.userId?._id === userId
                    ? {
                        alignSelf: 'flex-end',
                        backgroundColor: '#D0E7F9',
                        padding: 8,
                        maxWidth: '60%',
                        borderRadius: 7,
                        margin: 10,
                      }
                    : {
                        alignSelf: 'flex-start',
                        backgroundColor: 'white',
                        padding: 8,
                        maxWidth: '60%',
                        borderRadius: 7,
                        margin: 10,
                      },
                ]}>
                <Text style={{fontSize: 13, textAlign: 'left'}}>
                  {item?.text}
                </Text>
                <Text style={{fontSize: 10, color: 'gray'}}>
                  Sent by: {item?.userId?.name}
                </Text>
                <Text
                  style={{
                    textAlign: 'right',
                    fontSize: 9,
                    color: 'gray',
                    marginTop: 5,
                  }}>
                  {formatTime(item.timestamp)}
                </Text>
              </Pressable>
            );
          }

          if (item.images && item.images.length > 0) {
            return (
              <Pressable
                key={index}
                style={[
                  item?.userId?._id === userId
                    ? {
                        alignSelf: 'flex-end',
                        backgroundColor: '#D0E7F9',
                        padding: 8,
                        maxWidth: '60%',
                        borderRadius: 7,
                        margin: 10,
                      }
                    : {
                        alignSelf: 'flex-start',
                        backgroundColor: 'white',
                        padding: 8,
                        maxWidth: '60%',
                        borderRadius: 7,
                        margin: 10,
                      },
                ]}>
                <View>
                  <Image
                    style={{
                      width: 200,
                      height: 200,
                      resizeMode: 'cover',
                    }}
                    source={{uri: item?.images[0]}}
                  />
                  <Text
                    style={{
                      textAlign: 'right',
                      fontSize: 9,
                      color: 'gray',
                      position: 'absolute',
                      marginTop: 5,
                      right: 10,
                      bottom: 7,
                    }}>
                    {formatTime(item.timestamp)}
                  </Text>
                </View>
              </Pressable>
            );
          }
        })}
      </ScrollView>

      {/* Image to be sent */}
      {selectedImage ? (
        <View style={{alignItems: 'center', margin: 10}}>
          <Image
            source={{uri: selectedImage}}
            style={{width: 200, height: 200}}
          />
          <Text>Selected Image</Text>
          <Pressable onPress={() => setSelectedImage('')}>
            <Text>Remove Image</Text>
          </Pressable>
        </View>
      ) : null}

      <SafeAreaView>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 10,
            paddingVertical: 10,
            borderTopWidth: 0.25,
            borderTopColor: 'F8F8F8',
          }}>
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
            {/* <FontAwesome
              // onPress={pickImage}
              name="camera"
              size={24}
              color="gray"
            /> */}
            <Entypo name="mic" size={24} color="gray" />
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
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default ChatMessagesScreen;

const styles = StyleSheet.create({});
