import React, {useState, useEffect} from 'react';
import {StyleSheet, ImageBackground} from 'react-native';
import * as Animatable from 'react-native-animatable';

import {UserContext} from './UserContext';
import StackNavigator from './StackNavigator';
import Toast from 'react-native-toast-message';

function App(): React.JSX.Element {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setShowSplash(false);
    }, 3000); // hide the splash screen after 3 seconds
  }, []);

  if (showSplash) {
    return (
      <ImageBackground
        source={require('./src/images/TheIglooNoBackground.png')}
        style={styles.container}
        resizeMode="contain">
        <Animatable.Text animation="fadeIn" duration={3000} style={styles.text}>
          Thee Igloo
        </Animatable.Text>
      </ImageBackground>
    );
  }

  return (
    <>
      <UserContext>
        <StackNavigator />
      </UserContext>
      <Toast />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 30,
    fontWeight: 'bold',
  },
});

export default App;
