import { createContext, useContext, useState } from 'react';

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  profileImage?: string;
};

type UserContextType = {
  user: User;
  updateUser: (newUser: Partial<User>) => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>({
    id: 1,
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'Administrator',
    profileImage: '/default-avatar.png'
  });

  const updateUser = (newUser: Partial<User>) => {
    setUser(prev => ({ ...prev, ...newUser }));
  };

  return (
    <UserContext.Provider value={{ user, updateUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}