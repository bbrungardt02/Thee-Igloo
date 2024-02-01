import React, {createContext, useState} from 'react';

const UserType = createContext();

const UserContext = ({children}) => {
  const [userId, setUserId] = useState('');
  const [userName, setUserName] = useState('');
  return (
    <UserType.Provider value={{userId, setUserId, userName, setUserName}}>
      {children}
    </UserType.Provider>
  );
};

export {UserType, UserContext};
