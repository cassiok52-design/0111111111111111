import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  WorkSession,
  getActiveSession,
  startWorkSession,
  endWorkSession,
  addEarning,
  getWorkSession,
} from './database';
import {
  startLocationTracking,
  stopLocationTracking,
  getCurrentDistance,
  requestLocationPermissions,
} from './location-service';
import { useDatabase } from './database-provider';

interface SessionContextType {
  activeSession: WorkSession | null;
  isLoading: boolean;
  startSession: (vehicleId: number, initialKm: number, fuelPrice: number) => Promise<void>;
  endSession: (finalKm: number) => Promise<void>;
  addSessionEarning: (amount: number) => Promise<void>;
  refreshSession: () => Promise<void>;
  currentDistance: number;
}

const SessionContext = createContext<SessionContextType>({
  activeSession: null,
  isLoading: false,
  startSession: async () => {},
  endSession: async () => {},
  addSessionEarning: async () => {},
  refreshSession: async () => {},
  currentDistance: 0,
});

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const { currentUser, isReady } = useDatabase();
  const [activeSession, setActiveSession] = useState<WorkSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentDistance, setCurrentDistance] = useState(0);

  // Carregar sessão ativa ao inicializar
  useEffect(() => {
    if (isReady && currentUser) {
      loadActiveSession();
    }
  }, [isReady, currentUser]);

  // Atualizar distância atual periodicamente
  useEffect(() => {
    if (activeSession) {
      // Atualizar distância a cada 3 segundos para reflexão mais rápida
      const interval = setInterval(() => {
        const distance = getCurrentDistance();
        setCurrentDistance(distance);
      }, 3000);

      return () => clearInterval(interval);
    } else {
      setCurrentDistance(0);
    }
  }, [activeSession]);

  async function loadActiveSession() {
    if (!currentUser) return;

    try {
      const session = await getActiveSession(currentUser.id);
      setActiveSession(session);
      
      if (session) {
        // Se houver sessão ativa, inicializar distância
        setCurrentDistance(session.distance_traveled);
      }
    } catch (error) {
      console.error('Error loading active session:', error);
    }
  }

  async function startSession(
    vehicleId: number,
    initialKm: number,
    fuelPrice: number
  ): Promise<void> {
    if (!currentUser) {
      throw new Error('User not found');
    }

    setIsLoading(true);
    try {
      // Solicitar permissões de localização
      const hasPermissions = await requestLocationPermissions();
      if (!hasPermissions) {
        throw new Error('Location permissions not granted');
      }

      // Criar sessão no banco de dados
      const sessionId = await startWorkSession(
        currentUser.id,
        vehicleId,
        initialKm,
        fuelPrice
      );

      // Iniciar rastreamento de localização
      await startLocationTracking(sessionId, initialKm);

      // Recarregar sessão ativa
      await loadActiveSession();
    } catch (error) {
      console.error('Error starting session:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  async function endSession(finalKm: number): Promise<void> {
    if (!activeSession) {
      throw new Error('No active session');
    }

    setIsLoading(true);
    try {
      // Parar rastreamento e obter distância total
      const totalDistance = await stopLocationTracking();

      // Finalizar sessão no banco de dados
      await endWorkSession(activeSession.id, finalKm, totalDistance);

      // Limpar sessão ativa
      setActiveSession(null);
      setCurrentDistance(0);
    } catch (error) {
      console.error('Error ending session:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  async function addSessionEarning(amount: number): Promise<void> {
    if (!activeSession) {
      throw new Error('No active session');
    }

    try {
      await addEarning(activeSession.id, amount);
      
      // Recarregar sessão para atualizar faturamento
      await refreshSession();
    } catch (error) {
      console.error('Error adding earning:', error);
      throw error;
    }
  }

  async function refreshSession(): Promise<void> {
    if (!activeSession) return;

    try {
      const updated = await getWorkSession(activeSession.id);
      if (updated) {
        setActiveSession(updated);
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
    }
  }

  return (
    <SessionContext.Provider
      value={{
        activeSession,
        isLoading,
        startSession,
        endSession,
        addSessionEarning,
        refreshSession,
        currentDistance,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within SessionProvider');
  }
  return context;
}
