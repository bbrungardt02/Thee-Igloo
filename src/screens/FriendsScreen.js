import {StyleSheet, Text, View, Alert} from 'react-native';
import React, {useEffect, useContext} from 'react';
import {UserType} from '../../UserContext';
import FriendRequests from '../components/FriendRequests';
import API from '../config/API';

const FriendsScreen = () => {
  const {userId, setUserId} = useContext(UserType);
  const [friendRequests, setFriendRequests] = React.useState([]);

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
  }, []);

  return (
    <View style={{padding: 10, marginHorizontal: 12}}>
      {friendRequests.length > 0 ? (
        <>
          <Text>Friend Requests</Text>
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
          <Text style={styles.noRequestsText}>No Friend Requests</Text>
          <Text style={styles.noRequestsSubText}>
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
