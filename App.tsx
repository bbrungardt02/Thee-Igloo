import React from 'react';

import {UserContext} from './UserContext';
import StackNavigator from './StackNavigator';
import Toast from 'react-native-toast-message';

function App(): React.JSX.Element {
  return (
    <>
      <UserContext>
        <StackNavigator />
      </UserContext>
      <Toast />
    </>
  );
}

export default App;
