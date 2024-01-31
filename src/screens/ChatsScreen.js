import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import React, {useContext, useEffect, useLayoutEffect} from 'react';
import {UserType} from '../../UserContext';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import UserChat from '../components/UserChat';
import Icon from 'react-native-vector-icons/Ionicons';
import API from '../config/API';
import Toast from 'react-native-toast-message';
import {SwipeListView} from 'react-native-swipe-list-view';

const HeaderRight = ({onPress}) => (
  <Icon
    name="add-circle-outline"
    size={30}
    color="#000"
    style={styles.iconStyle}
    onPress={onPress}
  />
);

const ChatsScreen = () => {
  const [conversations, setConversations] = React.useState([]);
  const {userId} = useContext(UserType);
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <HeaderRight onPress={() => navigation.navigate('New Chat')} />
      ),
    });
  }, [navigation]);

  useFocusEffect(
    React.useCallback(() => {
      const conversationsList = async () => {
        try {
          const response = await API.get(`/chats/users/${userId}`);
          if (response.status === 200) {
            setConversations(response.data);
          }
        } catch (error) {
          console.log('error fetching conversations list', error);
        }
      };
      conversationsList();
    }, [userId]),
  );

  const leaveConversation = async (conversationId, userId) => {
    try {
      const response = await API.delete(
        `/chats/conversations/${conversationId}/users/${userId}`,
      );

      if (response.status === 200) {
        Toast.show({
          type: 'success',
          position: 'bottom',
          text1: "You've left the conversation",
          visibilityTime: 3000,
          autoHide: true,
          topOffset: 30,
          bottomOffset: 40,
        });
        // Remove the conversation from the local state
        setConversations(
          conversations.filter(
            conversation => conversation._id !== conversationId,
          ),
        );
      }
    } catch (error) {
      console.error('Error leaving the conversation', error);
      Toast.show({
        type: 'error',
        position: 'bottom',
        text1: 'Error leaving the conversation',
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 30,
        bottomOffset: 40,
      });
    }
  };

  return (
    <SwipeListView
      data={conversations}
      renderItem={({item}) => <UserChat item={item} />}
      renderHiddenItem={({item}, rowMap) => (
        <View style={styles.rowBack}>
          <TouchableOpacity
            style={[styles.backRightBtn, styles.backRightBtnRight]}
            onPress={() => leaveConversation(item._id, userId)}>
            <Text style={styles.backTextWhite}>Leave</Text>
          </TouchableOpacity>
        </View>
      )}
      rightOpenValue={-75}
      previewRowKey={'0'}
      previewOpenValue={-40}
      previewOpenDelay={3000}
    />
  );
};

export default ChatsScreen;

const styles = StyleSheet.create({
  iconStyle: {
    marginRight: 10,
  },
  rowBack: {
    alignItems: 'center',
    backgroundColor: '#DDD',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 15,
  },
  backRightBtn: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    width: 75,
  },
  backRightBtnRight: {
    backgroundColor: 'red',
    right: 0,
  },
  backTextWhite: {
    color: '#FFF',
  },
});
