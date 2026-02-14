import * as SQLite from 'expo-sqlite';

// Tipos do banco de dados
export interface User {
  id: number;
  name: string;
  email: string;
}

export interface Vehicle {
  id: number;
  user_id: number;
  model: string;
  fuel_type: string;
  average_consumption: number; // KM/L
  maintenance_percentage: number; // Percentual (ex: 10 para 10%)
  is_active: number; // 0 ou 1 (boolean)
}

export interface Goal {
  id: number;
  user_id: number;
  reference_date: string; // YYYY-MM-DD
  daily_target_value: number; // Valor em reais
}

export interface WorkSession {
  id: number;
  user_id: number;
  vehicle_id: number;
  start_date: string; // ISO timestamp
  end_date: string | null; // ISO timestamp
  fuel_price_per_liter: number;
  initial_km: number;
  final_km: number | null;
  gross_revenue: number;
  fuel_cost: number;
  maintenance_reserve: number;
  net_profit: number;
  distance_traveled: number; // KM calculado
}

export interface EarningsEntry {
  id: number;
  session_id: number;
  amount: number;
  timestamp: string; // ISO timestamp
}

// Instância do banco de dados
let db: SQLite.SQLiteDatabase | null = null;

/**
 * Inicializa o banco de dados e cria as tabelas se não existirem
 */
export async function initDatabase(): Promise<void> {
  try {
    db = await SQLite.openDatabaseAsync('driverprofit.db');
    
    // Criar tabelas
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE
      );
      
      CREATE TABLE IF NOT EXISTS vehicles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        model TEXT NOT NULL,
        fuel_type TEXT NOT NULL,
        average_consumption REAL NOT NULL,
        maintenance_percentage REAL NOT NULL,
        is_active INTEGER DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
      
      CREATE TABLE IF NOT EXISTS goals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        reference_date TEXT NOT NULL,
        daily_target_value REAL NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
      
      CREATE TABLE IF NOT EXISTS work_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        vehicle_id INTEGER NOT NULL,
        start_date TEXT NOT NULL,
        end_date TEXT,
        fuel_price_per_liter REAL NOT NULL,
        initial_km REAL NOT NULL,
        final_km REAL,
        gross_revenue REAL DEFAULT 0,
        fuel_cost REAL DEFAULT 0,
        maintenance_reserve REAL DEFAULT 0,
        net_profit REAL DEFAULT 0,
        distance_traveled REAL DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
      );
      
      CREATE TABLE IF NOT EXISTS earnings_entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id INTEGER NOT NULL,
        amount REAL NOT NULL,
        timestamp TEXT NOT NULL,
        FOREIGN KEY (session_id) REFERENCES work_sessions(id)
      );
      
      CREATE INDEX IF NOT EXISTS idx_work_sessions_user_date ON work_sessions(user_id, start_date);
      CREATE INDEX IF NOT EXISTS idx_earnings_entries_session ON earnings_entries(session_id);
    `);
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

/**
 * Retorna a instância do banco de dados
 */
export function getDatabase(): SQLite.SQLiteDatabase {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

// ============================================
// FUNÇÕES CRUD - USERS
// ============================================

export async function createUser(name: string, email: string): Promise<number> {
  const database = getDatabase();
  const result = await database.runAsync(
    'INSERT INTO users (name, email) VALUES (?, ?)',
    [name, email]
  );
  return result.lastInsertRowId;
}

export async function getUser(id: number): Promise<User | null> {
  const database = getDatabase();
  const result = await database.getFirstAsync<User>(
    'SELECT * FROM users WHERE id = ?',
    [id]
  );
  return result || null;
}

export async function getFirstUser(): Promise<User | null> {
  const database = getDatabase();
  const result = await database.getFirstAsync<User>(
    'SELECT * FROM users LIMIT 1'
  );
  return result || null;
}

// ============================================
// FUNÇÕES CRUD - VEHICLES
// ============================================

export async function createVehicle(
  userId: number,
  model: string,
  fuelType: string,
  averageConsumption: number,
  maintenancePercentage: number
): Promise<number> {
  const database = getDatabase();
  
  // Se for o primeiro veículo, marcar como ativo
  const existingVehicles = await database.getAllAsync<Vehicle>(
    'SELECT * FROM vehicles WHERE user_id = ?',
    [userId]
  );
  const isActive = existingVehicles.length === 0 ? 1 : 0;
  
  const result = await database.runAsync(
    'INSERT INTO vehicles (user_id, model, fuel_type, average_consumption, maintenance_percentage, is_active) VALUES (?, ?, ?, ?, ?, ?)',
    [userId, model, fuelType, averageConsumption, maintenancePercentage, isActive]
  );
  return result.lastInsertRowId;
}

export async function getVehicles(userId: number): Promise<Vehicle[]> {
  const database = getDatabase();
  const vehicles = await database.getAllAsync<Vehicle>(
    'SELECT * FROM vehicles WHERE user_id = ? ORDER BY is_active DESC, id DESC',
    [userId]
  );
  return vehicles;
}

export async function getActiveVehicle(userId: number): Promise<Vehicle | null> {
  const database = getDatabase();
  const result = await database.getFirstAsync<Vehicle>(
    'SELECT * FROM vehicles WHERE user_id = ? AND is_active = 1',
    [userId]
  );
  return result || null;
}

export async function setActiveVehicle(userId: number, vehicleId: number): Promise<void> {
  const database = getDatabase();
  await database.runAsync('UPDATE vehicles SET is_active = 0 WHERE user_id = ?', [userId]);
  await database.runAsync('UPDATE vehicles SET is_active = 1 WHERE id = ?', [vehicleId]);
}

export async function updateVehicle(
  id: number,
  model: string,
  fuelType: string,
  averageConsumption: number,
  maintenancePercentage: number
): Promise<void> {
  const database = getDatabase();
  await database.runAsync(
    'UPDATE vehicles SET model = ?, fuel_type = ?, average_consumption = ?, maintenance_percentage = ? WHERE id = ?',
    [model, fuelType, averageConsumption, maintenancePercentage, id]
  );
}

export async function deleteVehicle(id: number): Promise<void> {
  const database = getDatabase();
  await database.runAsync('DELETE FROM vehicles WHERE id = ?', [id]);
}

// ============================================
// FUNÇÕES CRUD - GOALS
// ============================================

export async function setDailyGoal(userId: number, targetValue: number): Promise<number> {
  const database = getDatabase();
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  
  // Verificar se já existe meta para hoje
  const existing = await database.getFirstAsync<Goal>(
    'SELECT * FROM goals WHERE user_id = ? AND reference_date = ?',
    [userId, today]
  );
  
  if (existing) {
    await database.runAsync(
      'UPDATE goals SET daily_target_value = ? WHERE id = ?',
      [targetValue, existing.id]
    );
    return existing.id;
  } else {
    const result = await database.runAsync(
      'INSERT INTO goals (user_id, reference_date, daily_target_value) VALUES (?, ?, ?)',
      [userId, today, targetValue]
    );
    return result.lastInsertRowId;
  }
}

export async function getDailyGoal(userId: number, date?: string): Promise<Goal | null> {
  const database = getDatabase();
  const targetDate = date || new Date().toISOString().split('T')[0];
  
  const result = await database.getFirstAsync<Goal>(
    'SELECT * FROM goals WHERE user_id = ? AND reference_date = ? ORDER BY id DESC LIMIT 1',
    [userId, targetDate]
  );
  
  // Se não houver meta para a data específica, buscar a meta mais recente
  if (!result) {
    const latestGoal = await database.getFirstAsync<Goal>(
      'SELECT * FROM goals WHERE user_id = ? ORDER BY reference_date DESC LIMIT 1',
      [userId]
    );
    return latestGoal || null;
  }
  
  return result;
}

// ============================================
// FUNÇÕES CRUD - WORK SESSIONS
// ============================================

export async function startWorkSession(
  userId: number,
  vehicleId: number,
  initialKm: number,
  fuelPricePerLiter: number
): Promise<number> {
  const database = getDatabase();
  const startDate = new Date().toISOString();
  
  const result = await database.runAsync(
    'INSERT INTO work_sessions (user_id, vehicle_id, start_date, initial_km, fuel_price_per_liter) VALUES (?, ?, ?, ?, ?)',
    [userId, vehicleId, startDate, initialKm, fuelPricePerLiter]
  );
  return result.lastInsertRowId;
}

export async function getActiveSession(userId: number): Promise<WorkSession | null> {
  const database = getDatabase();
  const result = await database.getFirstAsync<WorkSession>(
    'SELECT * FROM work_sessions WHERE user_id = ? AND end_date IS NULL ORDER BY id DESC LIMIT 1',
    [userId]
  );
  return result || null;
}

export async function endWorkSession(
  sessionId: number,
  finalKm: number,
  distanceTraveled: number
): Promise<void> {
  const database = getDatabase();
  const endDate = new Date().toISOString();
  
  // Buscar sessão e veículo
  const session = await database.getFirstAsync<WorkSession>(
    'SELECT * FROM work_sessions WHERE id = ?',
    [sessionId]
  );
  
  if (!session) {
    throw new Error('Session not found');
  }
  
  const vehicle = await database.getFirstAsync<Vehicle>(
    'SELECT * FROM vehicles WHERE id = ?',
    [session.vehicle_id]
  );
  
  if (!vehicle) {
    throw new Error('Vehicle not found');
  }
  
  // Calcular custos
  const fuelConsumed = distanceTraveled / vehicle.average_consumption; // Litros
  const fuelCost = fuelConsumed * session.fuel_price_per_liter;
  const maintenanceReserve = session.gross_revenue * (vehicle.maintenance_percentage / 100);
  const netProfit = session.gross_revenue - fuelCost - maintenanceReserve;
  
  await database.runAsync(
    `UPDATE work_sessions 
     SET end_date = ?, final_km = ?, distance_traveled = ?, fuel_cost = ?, maintenance_reserve = ?, net_profit = ? 
     WHERE id = ?`,
    [endDate, finalKm, distanceTraveled, fuelCost, maintenanceReserve, netProfit, sessionId]
  );
}

export async function getWorkSessions(
  userId: number,
  startDate?: string,
  endDate?: string
): Promise<WorkSession[]> {
  const database = getDatabase();
  
  let query = 'SELECT * FROM work_sessions WHERE user_id = ?';
  const params: any[] = [userId];
  
  if (startDate) {
    query += ' AND start_date >= ?';
    params.push(startDate);
  }
  
  if (endDate) {
    query += ' AND start_date <= ?';
    params.push(endDate);
  }
  
  query += ' ORDER BY start_date DESC';
  
  const sessions = await database.getAllAsync<WorkSession>(query, params);
  return sessions;
}

export async function getWorkSession(sessionId: number): Promise<WorkSession | null> {
  const database = getDatabase();
  const result = await database.getFirstAsync<WorkSession>(
    'SELECT * FROM work_sessions WHERE id = ?',
    [sessionId]
  );
  return result || null;
}

// ============================================
// FUNÇÕES CRUD - EARNINGS ENTRIES
// ============================================

export async function addEarning(sessionId: number, amount: number): Promise<number> {
  const database = getDatabase();
  const timestamp = new Date().toISOString();
  
  // Adicionar entrada de ganho
  const result = await database.runAsync(
    'INSERT INTO earnings_entries (session_id, amount, timestamp) VALUES (?, ?, ?)',
    [sessionId, amount, timestamp]
  );
  
  // Atualizar faturamento bruto da sessão
  await database.runAsync(
    'UPDATE work_sessions SET gross_revenue = gross_revenue + ? WHERE id = ?',
    [amount, sessionId]
  );
  
  return result.lastInsertRowId;
}

export async function getEarnings(sessionId: number): Promise<EarningsEntry[]> {
  const database = getDatabase();
  const earnings = await database.getAllAsync<EarningsEntry>(
    'SELECT * FROM earnings_entries WHERE session_id = ? ORDER BY timestamp DESC',
    [sessionId]
  );
  return earnings;
}

// ============================================
// FUNÇÕES DE ESTATÍSTICAS
// ============================================

export async function getTodayStats(userId: number): Promise<{
  kmToday: number;
  grossRevenue: number;
  netProfit: number;
  efficiency: number;
}> {
  const database = getDatabase();
  const today = new Date().toISOString().split('T')[0];
  
  const result = await database.getFirstAsync<{
    total_km: number;
    total_gross: number;
    total_net: number;
  }>(
    `SELECT 
      COALESCE(SUM(distance_traveled), 0) as total_km,
      COALESCE(SUM(gross_revenue), 0) as total_gross,
      COALESCE(SUM(net_profit), 0) as total_net
     FROM work_sessions 
     WHERE user_id = ? AND DATE(start_date) = ?`,
    [userId, today]
  );
  
  const kmToday = result?.total_km || 0;
  const grossRevenue = result?.total_gross || 0;
  const netProfit = result?.total_net || 0;
  const efficiency = kmToday > 0 ? netProfit / kmToday : 0;
  
  return { kmToday, grossRevenue, netProfit, efficiency };
}

export async function getMonthlyStats(userId: number, year: number, month: number): Promise<{
  totalSessions: number;
  totalKm: number;
  totalGross: number;
  totalNet: number;
  averageDaily: number;
  daysWorked: number;
}> {
  const database = getDatabase();
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endDate = `${year}-${String(month).padStart(2, '0')}-31`;
  
  const result = await database.getFirstAsync<{
    session_count: number;
    total_km: number;
    total_gross: number;
    total_net: number;
    days_worked: number;
  }>(
    `SELECT 
      COUNT(*) as session_count,
      COALESCE(SUM(distance_traveled), 0) as total_km,
      COALESCE(SUM(gross_revenue), 0) as total_gross,
      COALESCE(SUM(net_profit), 0) as total_net,
      COUNT(DISTINCT DATE(start_date)) as days_worked
     FROM work_sessions 
     WHERE user_id = ? AND start_date >= ? AND start_date <= ? AND end_date IS NOT NULL`,
    [userId, startDate, endDate]
  );
  
  const totalSessions = result?.session_count || 0;
  const totalKm = result?.total_km || 0;
  const totalGross = result?.total_gross || 0;
  const totalNet = result?.total_net || 0;
  const daysWorked = result?.days_worked || 0;
  const averageDaily = daysWorked > 0 ? totalNet / daysWorked : 0;
  
  return { totalSessions, totalKm, totalGross, totalNet, averageDaily, daysWorked };
}

// ============================================
// FUNÇÕES DE HISTÓRICO
// ============================================

/**
 * Obtém sessões de trabalho concluídas (com end_date) para histórico
 */
export async function getCompletedSessions(
  userId: number,
  startDate?: string,
  endDate?: string
): Promise<WorkSession[]> {
  const database = getDatabase();
  
  let query = 'SELECT * FROM work_sessions WHERE user_id = ? AND end_date IS NOT NULL';
  const params: any[] = [userId];
  
  if (startDate) {
    query += ' AND DATE(start_date) >= ?';
    params.push(startDate);
  }
  
  if (endDate) {
    query += ' AND DATE(start_date) <= ?';
    params.push(endDate);
  }
  
  query += ' ORDER BY start_date DESC';
  
  const sessions = await database.getAllAsync<WorkSession>(query, params);
  console.log('[getCompletedSessions]', { userId, startDate, endDate, count: sessions.length });
  return sessions;
}

/**
 * Calcula estatísticas agregadas de sessões de trabalho
 */
export async function getSessionStatistics(
  userId: number,
  startDate?: string,
  endDate?: string
): Promise<{
  totalSessions: number;
  totalDistance: number;
  totalGrossRevenue: number;
  totalFuelCost: number;
  totalMaintenanceReserve: number;
  totalNetProfit: number;
  averageNetProfit: number;
  averageEfficiency: number; // R$/KM
}> {
  const database = getDatabase();
  
  let query = `
    SELECT 
      COUNT(*) as totalSessions,
      COALESCE(SUM(distance_traveled), 0) as totalDistance,
      COALESCE(SUM(gross_revenue), 0) as totalGrossRevenue,
      COALESCE(SUM(fuel_cost), 0) as totalFuelCost,
      COALESCE(SUM(maintenance_reserve), 0) as totalMaintenanceReserve,
      COALESCE(SUM(net_profit), 0) as totalNetProfit
    FROM work_sessions 
    WHERE user_id = ? AND end_date IS NOT NULL
  `;
  const params: any[] = [userId];
  
  if (startDate) {
    query += ' AND DATE(start_date) >= ?';
    params.push(startDate);
  }
  
  if (endDate) {
    query += ' AND DATE(start_date) <= ?';
    params.push(endDate);
  }
  
  const result = await database.getFirstAsync<any>(query, params);
  console.log('[getSessionStatistics]', { userId, startDate, endDate, result });
  
  if (!result) {
    return {
      totalSessions: 0,
      totalDistance: 0,
      totalGrossRevenue: 0,
      totalFuelCost: 0,
      totalMaintenanceReserve: 0,
      totalNetProfit: 0,
      averageNetProfit: 0,
      averageEfficiency: 0,
    };
  }
  
  const averageNetProfit = result.totalSessions > 0 ? result.totalNetProfit / result.totalSessions : 0;
  const averageEfficiency = result.totalDistance > 0 ? result.totalGrossRevenue / result.totalDistance : 0;
  
  return {
    totalSessions: result.totalSessions,
    totalDistance: result.totalDistance,
    totalGrossRevenue: result.totalGrossRevenue,
    totalFuelCost: result.totalFuelCost,
    totalMaintenanceReserve: result.totalMaintenanceReserve,
    totalNetProfit: result.totalNetProfit,
    averageNetProfit,
    averageEfficiency,
  };
}
