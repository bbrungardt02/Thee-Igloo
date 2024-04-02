/* eslint-disable react-hooks/exhaustive-deps */
import {StyleSheet, Text, View, ScrollView} from 'react-native';
import React, {useLayoutEffect, useContext, useEffect} from 'react';
import {useNavigation, useTheme} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {UserType} from '../../UserContext';
import API from '../config/API';
import User from '../components/User';
import * as Keychain from 'react-native-keychain';

const HomeScreen = () => {
  const navigation = useNavigation();
  const {userId, setUserId, userName, setUserName} = useContext(UserType);
  const [users, setUsers] = React.useState([]);
  const {colors} = useTheme();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <MaterialIcons
          onPress={() => navigation.navigate('Profile')}
          name="person-outline"
          size={24}
          color={colors.text}
          style={{marginLeft: 10}}
        />
      ),
      headerTitle: () => (
        <Text style={{fontSize: 16, fontWeight: 'bold', color: colors.text}}>
          Igloo Chat
        </Text>
      ),
      headerRight: () => (
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
          <Ionicons
            onPress={() => navigation.navigate('Chats')}
            name="chatbox-ellipses-outline"
            size={24}
            color={colors.text}
          />
          <MaterialIcons
            onPress={() => navigation.navigate('Friend Requests')}
            name="people-outline"
            size={24}
            color={colors.text}
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
            const loggedInUser = response.data.find(
              user => user._id === userId,
            );
            if (loggedInUser) {
              setUserName(loggedInUser.name);
            }
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
          {users
            .filter(user => user._id !== userId)
            .map((item, index) => (
              <User key={index} item={item} />
            ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({});
