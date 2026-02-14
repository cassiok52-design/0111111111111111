import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { getDatabase } from './database';

const LOCATION_TASK_NAME = 'background-location-task';

// Estado da sessão de localização (em memória)
let sessionState: {
  sessionId: number | null;
  initialKm: number;
  lastLatitude: number | null;
  lastLongitude: number | null;
  lastTimestamp: number | null;
  totalDistance: number; // em KM
  lastAccuracy: number | null;
} = {
  sessionId: null,
  initialKm: 0,
  lastLatitude: null,
  lastLongitude: null,
  lastTimestamp: null,
  totalDistance: 0,
  lastAccuracy: null,
};

// Constantes de validação
const MIN_DISTANCE_THRESHOLD = 0.01; // 10 metros em km
const MAX_ACCURACY_THRESHOLD = 50; // Máximo de 50 metros de acurácia
const MAX_SPEED_THRESHOLD = 150; // Máximo de 150 km/h (velocidade irreal = ruído)
const MIN_TIME_INTERVAL = 5000; // Mínimo de 5 segundos entre atualizações

/**
 * Calcula a distância entre duas coordenadas usando a fórmula de Haversine
 * @param lat1 Latitude do ponto 1
 * @param lon1 Longitude do ponto 1
 * @param lat2 Latitude do ponto 2
 * @param lon2 Longitude do ponto 2
 * @returns Distância em quilômetros
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Raio da Terra em km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
}

/**
 * Valida se a leitura de GPS é confiável
 * @param accuracy Acurácia do GPS em metros
 * @param distance Distância calculada em km
 * @param timeInterval Intervalo de tempo em ms
 * @returns true se a leitura é válida
 */
function isValidGPSReading(
  accuracy: number | null,
  distance: number,
  timeInterval: number
): boolean {
  // Rejeitar se acurácia for muito ruim (> 50 metros)
  if (accuracy !== null && accuracy > MAX_ACCURACY_THRESHOLD) {
    console.warn(`GPS accuracy too poor: ${accuracy}m, rejecting update`);
    return false;
  }
  
  // Rejeitar se distância for muito pequena (< 10 metros)
  if (distance < MIN_DISTANCE_THRESHOLD) {
    return false;
  }
  
  // Calcular velocidade implícita (km/h)
  const speedKmh = (distance / (timeInterval / 3600000));
  
  // Rejeitar se velocidade for irreal (> 150 km/h = ruído GPS)
  if (speedKmh > MAX_SPEED_THRESHOLD) {
    console.warn(`Unrealistic speed detected: ${speedKmh.toFixed(1)} km/h, rejecting update`);
    return false;
  }
  
  return true;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Define a tarefa de background para rastreamento de localização
 */
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }: any) => {
  if (error) {
    console.error('Location task error:', error);
    return;
  }

  if (data) {
    const { locations } = data;
    
    if (locations && locations.length > 0 && sessionState.sessionId) {
      const location = locations[0];
      const { latitude, longitude, accuracy } = location.coords;
      const currentTimestamp = Date.now();
      
      // Se houver uma posição anterior, calcular distância
      if (sessionState.lastLatitude !== null && sessionState.lastLongitude !== null && sessionState.lastTimestamp !== null) {
        const timeInterval = currentTimestamp - sessionState.lastTimestamp;
        
        // Rejeitar se intervalo de tempo for muito pequeno (< 5 segundos)
        if (timeInterval < MIN_TIME_INTERVAL) {
          console.warn(`Time interval too short: ${timeInterval}ms, skipping update`);
          return;
        }
        
        const distance = calculateDistance(
          sessionState.lastLatitude,
          sessionState.lastLongitude,
          latitude,
          longitude
        );
        
        // Validar leitura de GPS antes de adicionar distância
        if (isValidGPSReading(accuracy, distance, timeInterval)) {
          sessionState.totalDistance += distance;
          console.log(`Valid GPS update: ${distance.toFixed(3)}km, accuracy: ${accuracy}m, speed: ${((distance / (timeInterval / 3600000))).toFixed(1)}km/h`);
          
          // Atualizar distância no banco de dados
          try {
            const db = getDatabase();
            await db.runAsync(
              'UPDATE work_sessions SET distance_traveled = ? WHERE id = ?',
              [sessionState.totalDistance, sessionState.sessionId]
            );
          } catch (dbError) {
            console.error('Error updating distance in database:', dbError);
          }
        } else {
          console.log(`Invalid GPS reading rejected: distance=${distance.toFixed(3)}km, accuracy=${accuracy}m`);
        }
      }
      
      // Atualizar última posição e timestamp
      sessionState.lastLatitude = latitude;
      sessionState.lastLongitude = longitude;
      sessionState.lastTimestamp = currentTimestamp;
      sessionState.lastAccuracy = accuracy || null;
    }
  }
});

/**
 * Solicita permissões de localização (foreground e background)
 */
export async function requestLocationPermissions(): Promise<boolean> {
  try {
    // Solicitar permissão de foreground primeiro
    const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
    
    if (foregroundStatus !== 'granted') {
      console.log('Foreground location permission denied');
      return false;
    }
    
    // Solicitar permissão de background
    const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
    
    if (backgroundStatus !== 'granted') {
      console.log('Background location permission denied');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error requesting location permissions:', error);
    return false;
  }
}

/**
 * Verifica se as permissões de localização foram concedidas
 */
export async function hasLocationPermissions(): Promise<boolean> {
  try {
    const { status: foregroundStatus } = await Location.getForegroundPermissionsAsync();
    const { status: backgroundStatus } = await Location.getBackgroundPermissionsAsync();
    
    return foregroundStatus === 'granted' && backgroundStatus === 'granted';
  } catch (error) {
    console.error('Error checking location permissions:', error);
    return false;
  }
}

/**
 * Inicia o rastreamento de localização em background
 */
export async function startLocationTracking(sessionId: number, initialKm: number): Promise<void> {
  try {
    // Verificar permissões
    const hasPermissions = await hasLocationPermissions();
    if (!hasPermissions) {
      throw new Error('Location permissions not granted');
    }
    
    // Inicializar estado da sessão
    sessionState = {
      sessionId,
      initialKm,
      lastLatitude: null,
      lastLongitude: null,
      lastTimestamp: null,
      totalDistance: 0,
      lastAccuracy: null,
    };
    
    // Obter localização atual para inicializar
    const currentLocation = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });
    
    sessionState.lastLatitude = currentLocation.coords.latitude;
    sessionState.lastLongitude = currentLocation.coords.longitude;
    sessionState.lastTimestamp = Date.now();
    sessionState.lastAccuracy = currentLocation.coords.accuracy || null;
    
    // Iniciar rastreamento em background
    await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
      accuracy: Location.Accuracy.High,
      timeInterval: 10000, // Atualizar a cada 10 segundos
      distanceInterval: 10, // Ou quando mover 10 metros
      foregroundService: {
        notificationTitle: 'DriverProfit',
        notificationBody: 'Rastreando seu turno de trabalho',
        notificationColor: '#0A84FF',
      },
      pausesUpdatesAutomatically: false,
      activityType: Location.ActivityType.AutomotiveNavigation,
      showsBackgroundLocationIndicator: true,
    });
    
    console.log('Location tracking started for session:', sessionId);
  } catch (error) {
    console.error('Error starting location tracking:', error);
    throw error;
  }
}

/**
 * Para o rastreamento de localização em background
 */
export async function stopLocationTracking(): Promise<number> {
  try {
    const totalDistance = sessionState.totalDistance;
    
    // Parar rastreamento
    const isTracking = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
    if (isTracking) {
      await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
    }
    
    // Resetar estado
    sessionState = {
      sessionId: null,
      initialKm: 0,
      lastLatitude: null,
      lastLongitude: null,
      lastTimestamp: null,
      totalDistance: 0,
      lastAccuracy: null,
    };
    
    console.log('Location tracking stopped. Total distance:', totalDistance, 'km');
    return totalDistance;
  } catch (error) {
    console.error('Error stopping location tracking:', error);
    throw error;
  }
}

/**
 * Retorna a distância total percorrida na sessão atual
 */
export function getCurrentDistance(): number {
  return sessionState.totalDistance;
}

/**
 * Verifica se o rastreamento está ativo
 */
export async function isTrackingActive(): Promise<boolean> {
  try {
    return await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
  } catch (error) {
    console.error('Error checking tracking status:', error);
    return false;
  }
}
