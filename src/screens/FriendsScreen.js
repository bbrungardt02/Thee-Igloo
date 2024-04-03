import {StyleSheet, Text, View, Alert} from 'react-native';
import React, {useEffect, useContext} from 'react';
import {UserType} from '../../UserContext';
import FriendRequests from '../components/FriendRequests';
import API from '../config/API';
import {useTheme} from '@react-navigation/native';

const FriendsScreen = () => {
  const {userId} = useContext(UserType);
  const [friendRequests, setFriendRequests] = React.useState([]);
  const {colors} = useTheme();

  useEffect(() => {
    const fetchFriendRequests = async () => {
      try {
        const response = await API.get(`/friends/requests/${userId}`);
        if (response.status === 200) {
          const friendRequestsData = response.data.map(friendRequest => ({
            _id: friendRequest._id,
            name: friendRequest.name,
            email: friendRequest.email,
            image: friendRequest.image,
          }));
          setFriendRequests(friendRequestsData);
        }
      } catch (error) {
        console.log('error fetching friend requests', error);
      }
    };

    fetchFriendRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={{padding: 10, marginHorizontal: 12}}>
      {friendRequests.length > 0 ? (
        <>
          <Text style={{color: colors.text}}>Friend Requests</Text>
          {friendRequests.map((item, index) => (
            <FriendRequests
              key={index}
              item={item}
              friendRequests={friendRequests}
              setFriendRequests={setFriendRequests}
            />
          ))}
        </>
      ) : (
        <View style={styles.noRequestsContainer}>
          <Text style={[styles.noRequestsText, {color: colors.text}]}>
            No Friend Requests
          </Text>
          <Text style={[styles.noRequestsSubText, {color: colors.text}]}>
            When you have friend requests, you'll see them here.
          </Text>
        </View>
      )}
    </View>
  );
};

export default FriendsScreen;

const styles = StyleSheet.create({
  noRequestsContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noRequestsText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  noRequestsSubText: {
    fontSize: 16,
    color: 'gray',
    marginTop: 10,
  },
});
