import React from 'react';
import {Pressable, Text, Image, View, Modal, Alert} from 'react-native';
import Video from 'react-native-video';
import {CameraRoll} from '@react-native-camera-roll/camera-roll';
import RNFetchBlob from 'rn-fetch-blob';
import Icon from 'react-native-vector-icons/FontAwesome';
import Toast from 'react-native-toast-message';

const ChatRender = ({item, userId}) => {
  const [modalVisible, setModalVisible] = React.useState(false);
  const [selectedImage, setSelectedImage] = React.useState(null);

  const handleImagePress = imageUri => {
    setSelectedImage(imageUri);
    setModalVisible(true);
  };

  const formatTime = time => {
    const options = {hour: 'numeric', minute: 'numeric'};
    return new Date(time).toLocaleString([], options);
  };

  const handleDownload = async () => {
    if (selectedImage) {
      Alert.alert(
        'Save to Camera Roll',
        'Do you want to save this image to your camera roll?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'OK',
            onPress: async () => {
              // Download the image to a temporary file
              const res = await RNFetchBlob.config({
                fileCache: true,
                appendExt: 'jpg',
              }).fetch('GET', selectedImage);

              // Save the downloaded file to the camera roll
              const filePath = res.path();
              CameraRoll.saveAsset(filePath, {type: 'photo'})
                .then(() => {
                  Toast.show({
                    type: 'success',
                    text1: 'Success',
                    text2: 'Image saved to camera roll successfully!',
                  });
                })
                .catch(error => {
                  console.log(error);
                  Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: 'Failed to save the image to camera roll.',
                  });
                });
            },
          },
        ],
        {cancelable: false},
      );
    }
  };

  if (item.text) {
    return (
      <Pressable
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
        <Text style={{fontSize: 13, textAlign: 'left'}}>{item?.text}</Text>
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

  if (item.images && item.images.length > 0 && item.images[0]) {
    return (
      <>
        <Pressable
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
            <Pressable onPress={() => handleImagePress(item?.images[0])}>
              <Image
                style={{
                  width: 200,
                  height: 200,
                  resizeMode: 'cover',
                }}
                source={{uri: item?.images[0]}}
              />
            </Pressable>
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
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(!modalVisible);
          }}>
          <View
            style={{
              flex: 1,
              backgroundColor: 'rgba(0, 0, 0, 0.55)',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Image
              style={{width: '100%', height: '100%', resizeMode: 'contain'}}
              source={{uri: selectedImage}}
            />
            <Pressable
              style={{
                position: 'absolute',
                bottom: 50,
                right: 20,
                backgroundColor: '#4b9cd3',
                borderRadius: 10,
                padding: 10,
              }}
              onPress={handleDownload}>
              <Icon name="download" size={30} color="white" />
            </Pressable>
            <Pressable
              style={{position: 'absolute', top: 50, right: 20}}
              onPress={() => setModalVisible(false)}>
              <Text style={{color: 'white', fontSize: 30}}>X</Text>
            </Pressable>
          </View>
        </Modal>
      </>
    );
  }

  if (item.videos && item.videos.length > 0 && item.videos[0]) {
    return (
      <Pressable
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
          <Video
            source={{uri: item?.videos[0]}}
            style={{width: 200, height: 200}}
            controls={true}
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
};

export default ChatRender;
