import React from 'react';
import {
  ScrollView,
  Text,
  StyleSheet,
  TextInput,
  Button,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as MailComposer from 'react-native-email-link';
import {UserType} from '../../UserContext';
import {useRoute, useTheme} from '@react-navigation/native';

// Define a type for the route params
type ReportScreenRouteParams = {
  reportedName: string;
  reportedEmail: string;
};

const ReportScreen: React.FC = () => {
  const route = useRoute();
  const {reportedName, reportedEmail} = route.params as ReportScreenRouteParams;

  const user = React.useContext(UserType);
  const [message, setMessage] = React.useState('');
  const {colors} = useTheme();

  console.log('userName:', user?.userName);
  console.log('userEmail:', user?.userEmail);

  const handleSubmit = () => {
    MailComposer.openComposer({
      subject: 'Report User',
      body: `Reporter Name: ${user?.userName}\nReporter Email: ${user?.userEmail}\nReported User's Name: ${reportedName}\nReported User's Email: ${reportedEmail}\nMessage: ${message}`,
      to: 'bbrungardt5@gmail.com',
    });
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}>
        <ScrollView>
          <Text style={[styles.text, {color: colors.text}]}>Report User</Text>
          <Text style={[styles.name, {color: colors.text}]}>
            Reported User's Name:
          </Text>
          <Text style={[styles.input, {color: colors.text}]}>
            {reportedName}
          </Text>
          <Text style={[styles.name, {color: colors.text}]}>
            Reported User's Email:
          </Text>
          <Text style={[styles.input, {color: colors.text}]}>
            {reportedEmail}
          </Text>
          <TextInput
            style={[styles.messageBox, {color: colors.text}]}
            multiline
            numberOfLines={4}
            placeholder="Your Message"
            value={message}
            onChangeText={setMessage}
          />
          <Button title="Submit Report" onPress={handleSubmit} />
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
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
