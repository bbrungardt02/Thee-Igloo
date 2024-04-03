import React from 'react';
import {
  ScrollView,
  View,
  Text,
  Button,
  StyleSheet,
  Linking,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useTheme} from '@react-navigation/native';
import Toast from 'react-native-toast-message';

const TermsScreen = ({navigation}: {navigation: any}) => {
  const {colors} = useTheme();

  const acceptTerms = async () => {
    try {
      await AsyncStorage.setItem('termsAccepted', 'true');
      Toast.show({
        type: 'success',
        position: 'bottom',
        text1: 'Welcome!',
        text2: 'You have accepted the terms.',
      });
      navigation.replace('Login');
    } catch (error) {
      console.error('Error saving terms acceptance status:', error);
    }
  };

  const openURL = (url: string) => {
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        console.log(`Don't know how to open URL: ${url}`);
      }
    });
  };

  const terms = [
    {
      title: 'Acceptance of Terms',
      content:
        'By downloading, installing, or using Thee Igloo, you agree to comply with and be bound by this EULA. If you do not agree to these terms, please do not access or use Thee Igloo.',
    },
    {
      title: 'Use of Thee Igloo',
      content:
        'Thee Igloo is intended for personal non-commercial use only. You may use Thee Igloo to connect with friends, engage in conversations, and share content in accordance with our Community Guidelines.',
    },
    {
      title: 'Community Guidelines',
      content:
        'Thee Igloo maintains a zero-tolerance policy for objectionable content and abusive behavior. Users are prohibited from engaging in any activity that violates our Community Guidelines, including but not limited to: Posting or sharing objectionable or inappropriate content. Engaging in harassment, bullying, or any form of abusive behavior towards other users. Violating the privacy or rights of others.',
    },
    {
      title: 'User Conduct',
      content:
        'You are solely responsible for your conduct and interactions on Thee Igloo. You agree to use Thee Igloo in compliance with all applicable laws and regulations.',
    },
    {
      title: 'Privacy',
      content:
        'We respect your privacy and are committed to protecting your personal information. Please refer to our Privacy Policy for details on how we collect, use, and disclose your information.',
      link: 'https://www.privacypolicies.com/live/2adecd04-1bd5-4885-991a-646c24d1fbcf',
    },
    {
      title: 'Updates and Changes',
      content:
        'We may update or modify Thee Igloo from time to time to improve functionality or address security issues. By continuing to use Thee Igloo after such updates, you agree to be bound by the revised terms.',
    },
    {
      title: 'Termination',
      content:
        'We reserve the right to terminate or suspend your access to Thee Igloo at any time without prior notice if you violate this EULA or our Community Guidelines.',
    },
    {
      title: 'Disclaimer of Warranties',
      content:
        'Thee Igloo is provided "as is" and "as available" without warranties of any kind, express or implied. We do not warrant that Thee Igloo will be error-free or uninterrupted.',
    },
    {
      title: 'Limitation of Liability',
      content:
        'In no event shall Thee Igloo or its affiliates be liable for any indirect, incidental, special, or consequential damages arising out of or in connection with your use of Thee Igloo.',
    },
    {
      title: 'Governing Law',
      content:
        'This EULA shall be governed by and construed in accordance with the laws of [Your Jurisdiction], without regard to its conflict of law provisions.',
    },
    {
      title: 'Contact Us',
      content:
        'If you have any questions or concerns about this EULA, please contact us at bbrungardt02@gmail.com.',
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={[styles.title, {color: colors.text}]}>
        End User License Agreement (EULA) for Thee Igloo
      </Text>
      <Text style={[styles.paragraph, {color: colors.text}]}>
        Welcome to Thee Igloo, a friendly messaging application for adding
        friends, engaging in one-on-one conversations, and participating in
        group conversations. Before you begin using our app, please read this
        End User License Agreement (EULA) carefully. By accessing or using Thee
        Igloo, you agree to be bound by the terms and conditions outlined below.
      </Text>
      {terms.map((term, index) => (
        <View key={index}>
          {term.link ? (
            <Text
              style={[styles.link, {color: colors.text}]}
              onPress={() => openURL(term.link)}>
              {index + 1}. Privacy Policy
            </Text>
          ) : (
            <Text style={[styles.termTitle, {color: colors.text}]}>
              {index + 1}. {term.title}
            </Text>
          )}
          <Text style={[styles.paragraph, {color: colors.text}]}>
            {term.content}
          </Text>
        </View>
      ))}
      <View style={styles.buttonContainer}>
        <Button title="I Agree" onPress={acceptTerms} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    marginBottom: 70,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  termTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  paragraph: {
    fontSize: 16,
    marginBottom: 20,
    lineHeight: 24,
  },
  buttonContainer: {
    marginBottom: 20,
  },
  link: {
    textDecorationLine: 'underline',
    color: 'blue',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});

export default TermsScreen;
