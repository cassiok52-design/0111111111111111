import React, { createContext, useContext, useEffect, useState } from 'react';
import { initDatabase, createUser, getFirstUser, User } from './database';

interface DatabaseContextType {
  isReady: boolean;
  currentUser: User | null;
}

const DatabaseContext = createContext<DatabaseContextType>({
  isReady: false,
  currentUser: null,
});

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    async function setup() {
      try {
        // Inicializar banco de dados
        await initDatabase();
        
        // Buscar ou criar usuário padrão (app local, single-user)
        let user = await getFirstUser();
        if (!user) {
          const userId = await createUser('Motorista', 'motorista@driverprofit.app');
          user = await getFirstUser();
        }
        
        setCurrentUser(user);
        setIsReady(true);
      } catch (error) {
        console.error('Error setting up database:', error);
      }
    }

    setup();
  }, []);

  return (
    <DatabaseContext.Provider value={{ isReady, currentUser }}>
      {children}
    </DatabaseContext.Provider>
  );
}

export function useDatabase() {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase must be used within DatabaseProvider');
  }
  return context;
}
