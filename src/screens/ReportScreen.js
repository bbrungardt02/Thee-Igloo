import {StyleSheet, Text, View, Button} from 'react-native';
import React from 'react';
import {openComposer} from 'react-native-email-link';

const ReportScreen = () => {
  const sendEmail = () => {
    openComposer({
      to: 'bbrungardt5@gmail.com',
      body: 'Describe your issue here',
    });
  };

  return (
    <View>
      <Text>ReportScreen</Text>
      <Button title="Report Issue" onPress={sendEmail} />
    </View>
  );
};

export default ReportScreen;

const styles = StyleSheet.create({});
