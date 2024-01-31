import {StyleSheet, Text, View, ScrollView} from 'react-native';
import React, {useLayoutEffect, useContext, useEffect} from 'react';
import {useNavigation} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {UserType} from '../../UserContext';
import API from '../config/API';
import User from '../components/User';
import * as Keychain from 'react-native-keychain';

const HomeScreen = () => {
  const navigation = useNavigation();
  const {userId, setUserId} = useContext(UserType);
  const [users, setUsers] = React.useState([]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <MaterialIcons
          onPress={() => navigation.navigate('Profile')}
          name="person-outline"
          size={24}
          color="black"
          style={{marginLeft: 10}}
        />
      ),
      headerTitle: () => (
        <Text style={{fontSize: 16, fontWeight: 'bold'}}>Igloo Chat</Text>
      ),
      headerRight: () => (
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
          <Ionicons
            onPress={() => navigation.navigate('Chats')}
            name="chatbox-ellipses-outline"
            size={24}
            color="black"
          />
          <MaterialIcons
            onPress={() => navigation.navigate('Friend Requests')}
            name="people-outline"
            size={24}
            color="black"
          />
        </View>
      ),
    });
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      const credentials = await Keychain.getGenericPassword();
      if (credentials) {
        const {username: userId} = credentials;
        setUserId(userId);
        const URL = `/users/${userId}`;
        API.get(URL)
          .then(response => {
            setUsers(response.data);
          })
          .catch(error => {
            console.log('error retrieving users', error);
          });
      }
    };

    fetchUsers();
  }, []);

  return (
    <View>
      <ScrollView>
        <View style={{padding: 10}}>
          {users.map((item, index) => (
            <User key={index} item={item} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({});
