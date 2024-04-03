import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  ImageBackground,
  useColorScheme,
  View,
  Dimensions,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
// import {useTheme} from '@react-navigation/native';
import {UserContext} from './UserContext';
import StackNavigator from './StackNavigator';
import Toast from 'react-native-toast-message';

function App(): React.JSX.Element {
  const [showSplash, setShowSplash] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // const {colors} = useTheme();
  const scheme = useColorScheme();

  useEffect(() => {
    setTimeout(() => {
      setShowSplash(false);
    }, 5000);
  }, []);

  if (showSplash) {
    return (
      <ImageBackground
        source={require('./src/images/TheIglooNoBackground.png')}
        style={styles.container}
        resizeMode="contain">
        <View style={{flexDirection: 'row', justifyContent: 'center'}}>
          {Array.from('Thee Igloo').map((letter, index, arr) => (
            <Animatable.View
              key={index}
              animation={{
                from: {translateX: -Dimensions.get('window').width},
                to: {translateX: 0},
              }}
              duration={1000}
              delay={(arr.length - index) * 300}
              style={{
                position: 'relative',
                alignItems: 'center',
                padding: 3,
              }}>
              {[-1, 0, 1].map(dx =>
                [-1, 0, 1].map(dy => (
                  <Animatable.Text
                    key={`${dx}-${dy}`}
                    animation="fadeIn"
                    duration={3000}
                    style={{
                      position: 'absolute',
                      left: dx,
                      top: dy,
                      bottom: dy,
                      right: dx,
                      color: scheme === 'dark' ? 'black' : '#ADD8E6',
                      fontSize: 33,
                      fontWeight: '900',
                    }}>
                    {letter}
                  </Animatable.Text>
                )),
              )}
              <Animatable.Text
                animation="fadeIn"
                duration={3000}
                style={{
                  color: scheme === 'dark' ? '#ADD8E6' : 'black',
                  fontSize: 30,
                  fontWeight: '900',
                }}>
                {letter}
              </Animatable.Text>
            </Animatable.View>
          ))}
        </View>
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
});

export default App;
