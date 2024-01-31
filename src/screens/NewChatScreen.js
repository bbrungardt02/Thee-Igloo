import {
  StyleSheet,
  Text,
  View,
  Button,
  TextInput,
  Modal,
  TouchableOpacity,
} from 'react-native';
import React, {useEffect, useContext} from 'react';
import {useNavigation} from '@react-navigation/native';
import API from '../config/API';
import {UserType} from '../../UserContext';
import MultiSelect from 'react-native-multiple-select';
import Toast from 'react-native-toast-message';

const NewChatScreen = () => {
  const {userId, setUserId} = useContext(UserType);
  const [recipientId, setRecipientId] = React.useState('');
  const [friends, setFriends] = React.useState([]);
  const [selectedFriends, setSelectedFriends] = React.useState([]);
  const navigation = useNavigation();
  const [groupName, setGroupName] = React.useState('');
  const [isModalVisible, setModalVisible] = React.useState(false);
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  const onSelectedItemsChange = selectedItems => {
    setSelectedFriends(selectedItems);
  };

  const onSubmit = () => {
    if (selectedFriends.length >= 2) {
      setModalVisible(true);
      setIsSubmitted(true);
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setIsSubmitted(false);
  };

  const createNewChat = async () => {
    if (selectedFriends.length === 0) {
      Toast.show({
        type: 'error',
        position: 'bottom',
        text1: 'Warning',
        text2: 'No friends selected',
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 30,
        bottomOffset: 40,
      });
      return;
    }

    try {
      const response = await API.post(`/chats/conversation`, {
        senderId: userId,
        recipientIds: selectedFriends,
        name: groupName,
      });

      if (response.status === 200) {
        if (response.data.conversation._id) {
          navigation.replace('Messages', {
            conversationId: response.data.conversation._id,
            recipientId: selectedFriends[0],
          });
          Toast.show({
            type: 'success',
            position: 'bottom',
            text1: 'Success',
            text2: 'New chat created',
            visibilityTime: 3000,
            autoHide: true,
            topOffset: 30,
            bottomOffset: 40,
          });
        } else {
          console.log('No conversationId in response', response.data);
        }
      } else {
        console.log('Failed to create new chat', response.data);
      }
    } catch (error) {
      console.log('Error creating new chat', error);
    }
  };

  useEffect(() => {
    const friendsList = async () => {
      try {
        const response = await API.get(`/friends/${userId}`);

        if (response.status === 200) {
          setFriends(response.data);
          // console.log('Friends list:', response.data);
        }
      } catch (error) {
        console.log('error fetching friends list', error);
      }
    };
    friendsList();
  }, []);

  return (
    <View>
      {/* //! this needs better styling it is very bad  */}
      <View style={{padding: 10, paddingTop: 20}}>
        <MultiSelect
          hideTags
          items={friends}
          uniqueKey="_id"
          ref={component => {
            multiSelect = component;
          }}
          onSelectedItemsChange={onSelectedItemsChange}
          selectedItems={selectedFriends}
          selectText="Pick Friends"
          textColor="#000"
          tagRemoveIconColor="#D3D3D3"
          tagBorderColor="#D3D3D3"
          tagTextColor="#D3D3D3"
          selectedItemTextColor="#000"
          selectedItemIconColor="#000"
          itemTextColor="#A9A9A9"
          searchInputStyle={{color: '#000'}}
          submitButtonColor="#87CEFA"
          submitButtonText="Submit"
          onToggleList={onSubmit}
          styleMainWrapper={{
            backgroundColor: '#D0E6F7',
            borderRadius: 10,
            borderColor: '#D3D3D3',
            borderWidth: 2,
            paddingHorizontal: 10,
            paddingTop: 10,
          }}
          styleDropdownMenuSubsection={{
            backgroundColor: '#D0E6F7',
            borderRadius: 10,
          }}
          styleListContainer={{backgroundColor: '#D0E6F7'}}
        />
      </View>

      <TouchableOpacity onPress={() => onSubmit()}>
        {groupName ? (
          <Text style={{padding: 10, fontSize: 20, textAlign: 'center'}}>
            {groupName}
          </Text>
        ) : null}
      </TouchableOpacity>

      <Button title="Create New Chat" onPress={createNewChat} />

      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible && isSubmitted}
        onRequestClose={closeModal}>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            // backgroundColor: 'transparent',
          }}>
          <View
            style={{
              backgroundColor: 'white',
              padding: 20,
              borderRadius: 20,
              width: '80%',
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
            }}>
            <Text style={{fontSize: 20, fontWeight: 'bold', marginBottom: 20}}>
              Enter Group Chat Name:
            </Text>
            <TextInput
              style={{
                height: 40,
                borderColor: 'gray',
                borderWidth: 1,
                width: '100%',
                marginBottom: 20,
                borderRadius: 10,
                paddingLeft: 10,
              }}
              onChangeText={text => setGroupName(text)}
              value={groupName}
            />
            <Button title="Done" onPress={closeModal} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default NewChatScreen;

const styles = StyleSheet.create({});
