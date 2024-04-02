import React, {useContext, useState} from 'react';
import {View, Text, StyleSheet, TextInput, Button} from 'react-native';
import * as MailComposer from 'react-native-email-link';
import {UserType} from '../../UserContext';
import {useRoute} from '@react-navigation/native';
import {useTheme} from '@react-navigation/native';

// Define a type for the route params
type ReportScreenRouteParams = {
  reportedName: string;
  reportedEmail: string;
};

const ReportScreen: React.FC = () => {
  const route = useRoute();
  const {reportedName, reportedEmail} = route.params as ReportScreenRouteParams;

  const user = useContext(UserType);
  const [message, setMessage] = useState('');
  const {colors} = useTheme();

  const handleSubmit = () => {
    MailComposer.openComposer({
      subject: 'Report User',
      body: `Reporter Name: ${user?.userName}\nReporter Email: ${user?.userEmail}\nReported User's Name: ${reportedName}\nReported User's Email: ${reportedEmail}\nMessage: ${message}`,
      to: 'bbrungardt5@gmail.com',
    });
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.text, {color: colors.text}]}>Report User</Text>
      <Text style={[styles.name, {color: colors.text}]}>
        Reported User's Name:
      </Text>
      <Text style={[styles.input, {color: colors.text}]}>{reportedName}</Text>
      <Text style={[styles.name, {color: colors.text}]}>
        Reported User's Email:
      </Text>
      <Text style={[styles.input, {color: colors.text}]}>{reportedEmail}</Text>
      <TextInput
        style={[styles.messageBox, {color: colors.text}]}
        multiline
        numberOfLines={4}
        placeholder="Your Message"
        value={message}
        onChangeText={setMessage}
      />
      <Button title="Submit Report" onPress={handleSubmit} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  text: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  name: {
    fontSize: 18,
    marginBottom: 10,
  },
  input: {
    fontSize: 16,
    marginBottom: 20,
  },
  messageBox: {
    height: 150,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    padding: 10,
    borderRadius: 5,
  },
});

export default ReportScreen;
