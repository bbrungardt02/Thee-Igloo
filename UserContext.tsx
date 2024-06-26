import React, {createContext, useState, ReactNode} from 'react';

interface UserContextType {
  userId: string;
  setUserId: React.Dispatch<React.SetStateAction<string>>;
  userName: string;
  setUserName: React.Dispatch<React.SetStateAction<string>>;
  userEmail: string;
  setUserEmail: React.Dispatch<React.SetStateAction<string>>;
}

const UserType = createContext<UserContextType | undefined>(undefined);

interface UserContextProps {
  children: ReactNode;
}

const UserContext: React.FC<UserContextProps> = ({children}) => {
  const [userId, setUserId] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  return (
    <UserType.Provider
      value={{
        userId,
        setUserId,
        userName,
        setUserName,
        userEmail,
        setUserEmail,
      }}>
      {children}
    </UserType.Provider>
  );
};

export {UserType, UserContext};
