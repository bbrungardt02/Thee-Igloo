/* eslint-disable react-hooks/exhaustive-deps */
import {
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  SafeAreaView,
  Alert,
  Text,
  FlatList,
  View,
} from 'react-native';
import React, {useContext, useEffect, useLayoutEffect} from 'react';
import {UserType} from '../../UserContext';
import {useRoute} from '@react-navigation/native';
import {useNavigation, useTheme} from '@react-navigation/native';
import {
  joinConversation,
  sendMessage,
  onMessageReceived,
  leaveConversation,
} from '../components/Socket';
import API from '../config/API';
import {Platform} from 'react-native';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import ChatInput from '../components/ChatInput';
import ChatRender from '../components/ChatRender';
import ChatHeader from '../components/ChatHeader';

const ChatMessagesScreen = () => {
  const {userId, userName} = useContext(UserType);
  const [message, setMessage] = React.useState('');
  const [messages, setMessages] = React.useState([]);
  const route = useRoute();
  const {conversationId} = route.params;
  const navigation = useNavigation();
  const [recipientsData, setRecipientsData] = React.useState([]);
  const isJoined = React.useRef(false);
  const [groupName, setGroupName] = React.useState('');
  const {colors} = useTheme();
  const [selectedImages, setSelectedImages] = React.useState([]);
  const [selectedVideos, setSelectedVideos] = React.useState([]);
  const [selectedAudios, setSelectedAudios] = React.useState([]);
  const [imageData, setImageData] = React.useState([]);
  const [videoData, setVideoData] = React.useState([]);
  const [audioData, setAudioData] = React.useState([]);
  const [uploadStatus, setUploadStatus] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(true);
  const [loading, setLoading] = React.useState(false);

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

  const fetchMessages = async (conversationId, page) => {
    setLoading(true);
    try {
      const response = await API.get(
        `/chats/messages/${conversationId}?page=${page}`,
      );
      if (response.status === 200) {
        setMessages(prevMessages => [...prevMessages, ...response.data]);
        if (response.data.length === 0) {
          setHasMore(false);
        } else {
          setPage(prevPage => prevPage + 1);
        }
      }
    } catch (error) {
      console.error('Error fetching messages', error);
    }
    setLoading(false);
  };

  const loadMoreMessages = () => {
    if (!loading && hasMore) {
      fetchMessages(conversationId, page);
    }
  };

  useEffect(() => {
    fetchMessages(conversationId, 1);
  }, []);

  useEffect(() => {
    onMessageReceived(message => {
      setMessages(prevMessages => [message, ...prevMessages]);
    });
  }, []);

  const handleSend = async () => {
    if (
      !message.trim() &&
      imageData.length === 0 &&
      videoData.length === 0 &&
      audioData.length === 0
    ) {
      return;
    }

    try {
      const uploadedImages = [];
      const uploadedVideos = [];
      const uploadedAudios = [];

      const uploadMedia = async (mediaData, uploadedMedia) => {
        const uploadPromises = mediaData.map(async data => {
          setUploadStatus('Uploading...');

          const uploadResponse = await API.post('/chats/upload', data, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });

          if (uploadResponse.status === 200) {
            uploadedMedia.push(uploadResponse.data.url);
            setUploadStatus('Upload successful');
            setTimeout(() => setUploadStatus(''), 2000); // Clear the status after 2 seconds
          } else {
            console.log('Failed to upload file', uploadResponse.data);
            setUploadStatus('Upload failed');
            setTimeout(() => setUploadStatus(''), 2000);
          }
        });

        await Promise.all(uploadPromises);
      };

      if (imageData.length > 0) {
        await uploadMedia(imageData, uploadedImages);
      }

      if (videoData.length > 0) {
        await uploadMedia(videoData, uploadedVideos);
      }

      if (audioData.length > 0) {
        await uploadMedia(audioData, uploadedAudios);
      }

      const newMessage = {
        conversationId: conversationId,
        userId: {
          _id: userId,
          name: userName,
        },
        text: message,
        images: uploadedImages,
        videos: uploadedVideos,
        audios: uploadedAudios,
        timestamp: new Date().toISOString(),
      };

      sendMessage(newMessage);
      setMessage('');
      setSelectedImages([]);
      setSelectedVideos([]);
      setSelectedAudios([]);
      setImageData([]);
      setVideoData([]);
      setAudioData([]);
    } catch (error) {
      console.log('error sending message', error);
      setUploadStatus('Upload failed');
      setTimeout(() => setUploadStatus(''), 2000);
    }
  };

  const handleSelectMedia = () => {
    // Clear the state so that multiple images/video are not sent in the same message
    //TODO This can be removed once sending multiple images is fully supported on UI and endpoint
    setSelectedImages([]);
    setSelectedVideos([]);
    setImageData([]);
    setVideoData([]);
    //TODO ---------------
    Alert.alert(
      'Select an option',
      '',
      [
        {
          text: 'Take Photo or Record',
          onPress: () => {
            launchCamera({mediaType: 'mixed'}, response => {
              if (response.didCancel) {
                console.log('User cancelled media picker');
              } else if (response.errorCode) {
                console.log('MediaPicker Error: ', response.errorMessage);
              } else {
                let formData = new FormData();
                formData.append('file', {
                  uri: response.assets[0].uri,
                  type: response.assets[0].type,
                  name: response.assets[0].fileName,
                });

                if (response.assets[0].type.startsWith('image/')) {
                  setSelectedImages([
                    ...selectedImages,
                    response.assets[0].uri,
                  ]);
                  setImageData([...imageData, formData]);
                } else if (response.assets[0].type.startsWith('video/')) {
                  setSelectedVideos([
                    ...selectedVideos,
                    response.assets[0].uri,
                  ]);
                  setVideoData([...videoData, formData]);
                }
              }
            });
          },
        },
        {
          text: 'Choose from Library',
          onPress: () => {
            launchImageLibrary({mediaType: 'mixed'}, response => {
              if (response.didCancel) {
                console.log('User cancelled media picker');
              } else if (response.errorCode) {
                console.log('MediaPicker Error: ', response.errorMessage);
              } else {
                let formData = new FormData();
                formData.append('file', {
                  uri: response.assets[0].uri,
                  type: response.assets[0].type,
                  name: response.assets[0].fileName,
                });

                if (response.assets[0].type.startsWith('image/')) {
                  setSelectedImages([
                    ...selectedImages,
                    response.assets[0].uri,
                  ]);
                  setImageData([...imageData, formData]);
                } else if (response.assets[0].type.startsWith('video/')) {
                  setSelectedVideos([
                    ...selectedVideos,
                    response.assets[0].uri,
                  ]);
                  setVideoData([...videoData, formData]);
                }
              }
            });
          },
        },
      ],
      {cancelable: true},
    );
  };

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
        <ChatHeader
          navigation={navigation}
          recipientsData={recipientsData}
          groupName={groupName}
          colors={colors}
        />
      ),
    });
  }, [recipientsData, groupName]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
      style={{flex: 1}}>
      <FlatList
        data={messages}
        keyExtractor={(item, index) => index.toString()} // Use index as the key
        renderItem={({item}) => <ChatRender item={item} userId={userId} />}
        inverted // This will start the list from the bottom
        onEndReached={loadMoreMessages} // Call 'loadMoreMessages' when the end of the list is reached
        onEndReachedThreshold={0.1} // Call 'loadMoreMessages' when the end of the list is within 10% of the viewport
        ListFooterComponent={
          loading ? (
            <View style={styles.activityIndicatorContainer}>
              <ActivityIndicator size="large" color="#0000ff" />
            </View>
          ) : null
        }
      />

      <SafeAreaView>
        <ChatInput
          handleSend={handleSend}
          message={message}
          setMessage={setMessage}
          handleSelectMedia={handleSelectMedia}
          selectedImages={selectedImages}
          selectedVideos={selectedVideos}
          selectedAudios={selectedAudios}
        />
        <Text style={styles.uploadStatus}>{uploadStatus}</Text>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default ChatMessagesScreen;

const styles = StyleSheet.create({
  activityIndicatorContainer: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadStatus: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
  },
});
