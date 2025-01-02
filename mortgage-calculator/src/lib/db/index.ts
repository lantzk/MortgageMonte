import Database from 'better-sqlite3';
import path from 'path';

// Database configuration
const DB_PATH = path.join(process.cwd(), 'mortgage-calculator.db');
const CURRENT_DB_VERSION = 1;  // Increment this when making breaking schema changes

// Custom error class for database operations
export class DatabaseError extends Error {
  constructor(message: string, public originalError?: Error) {
    super(message);
    this.name = 'DatabaseError';
  }
}

interface DbVersion {
  id: number;
  version: number;
  updated_at: string;
}

// Database singleton instance
let dbInstance: Database.Database | null = null;

// Initialize database with proper error handling
export const getDb = (): Database.Database => {
  if (dbInstance) return dbInstance;
  
  try {
    dbInstance = new Database(DB_PATH);
    dbInstance.pragma('foreign_keys = ON');
    dbInstance.pragma('journal_mode = WAL'); // Better concurrent access
    
    // Create version table if it doesn't exist
    dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS db_version (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        version INTEGER NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Check/initialize version
    const versionRow = dbInstance.prepare('SELECT version FROM db_version WHERE id = 1').get() as Pick<DbVersion, 'version'> | undefined;
    if (!versionRow) {
      // New database, initialize version
      dbInstance.prepare('INSERT INTO db_version (id, version) VALUES (1, ?)').run(CURRENT_DB_VERSION);
    } else if (versionRow.version !== CURRENT_DB_VERSION) {
      // Version mismatch - in this case, we'll reset the database
      // This is safe for a local calculator app, but would need proper migrations for a production app
      dbInstance.exec('DROP TABLE IF EXISTS simulation_results');
      dbInstance.exec('DROP TABLE IF EXISTS user_preferences');
      dbInstance.prepare('UPDATE db_version SET version = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1')
        .run(CURRENT_DB_VERSION);
    }

    initializeTables(dbInstance);
    return dbInstance;
  } catch (error) {
    throw new DatabaseError('Failed to initialize database', error as Error);
  }
};

// Cleanup function to be called when shutting down
export const closeDb = () => {
  if (dbInstance) {
    try {
      dbInstance.close();
      dbInstance = null;
    } catch (error) {
      console.error('Error closing database:', error);
    }
  }
};

// Initialize tables with proper error handling
const initializeTables = (db: Database.Database) => {
  try {
    db.exec(`
      -- User preferences table
      CREATE TABLE IF NOT EXISTS user_preferences (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        extra_payment REAL NOT NULL,
        investment_return REAL NOT NULL,
        salary_growth REAL NOT NULL,
        market_volatility REAL NOT NULL,
        inflation_rate REAL NOT NULL,
        liquidity_needed REAL NOT NULL,
        job_loss_prob REAL NOT NULL,
        refi_prob REAL NOT NULL,
        emergency_prob REAL NOT NULL,
        ibond_limit REAL NOT NULL,
        mega_backdoor_amount REAL NOT NULL,
        stress_test_factor REAL NOT NULL,
        ibond_base_rate REAL NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Simulation results table
      CREATE TABLE IF NOT EXISTS simulation_results (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        preferences_id INTEGER NOT NULL,
        scenario_type TEXT NOT NULL CHECK(scenario_type IN ('mortgage', 'investment')),
        year INTEGER NOT NULL,
        balance REAL NOT NULL,
        equity REAL NOT NULL,
        home_value REAL NOT NULL,
        taxable_investments REAL NOT NULL,
        retirement_401k REAL NOT NULL,
        total_investments REAL NOT NULL,
        net_worth REAL NOT NULL,
        pmi_paid REAL NOT NULL,
        taxes_paid REAL NOT NULL,
        salary REAL NOT NULL,
        liquidity_ratio REAL NOT NULL,
        mortgage_rate REAL NOT NULL,
        confidence_interval REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (preferences_id) REFERENCES user_preferences(id)
      );

      -- Create indexes for better query performance
      CREATE INDEX IF NOT EXISTS idx_simulation_results_preferences 
        ON simulation_results(preferences_id);
      CREATE INDEX IF NOT EXISTS idx_simulation_results_scenario 
        ON simulation_results(scenario_type);
    `);
  } catch (error) {
    throw new DatabaseError('Failed to initialize database tables', error as Error);
  }
};

// Prepared statements with proper error handling
const prepareStatements = (db: Database.Database) => {
  try {
    return {
      insertPreferences: db.prepare(`
        INSERT INTO user_preferences (
          extra_payment, investment_return, salary_growth,
          market_volatility, inflation_rate, liquidity_needed,
          job_loss_prob, refi_prob, emergency_prob,
          ibond_limit, mega_backdoor_amount, stress_test_factor,
          ibond_base_rate
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `),

      insertSimulationResult: db.prepare(`
        INSERT INTO simulation_results (
          preferences_id, scenario_type, year,
          balance, equity, home_value,
          taxable_investments, retirement_401k, total_investments,
          net_worth, pmi_paid, taxes_paid,
          salary, liquidity_ratio, mortgage_rate,
          confidence_interval
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `),

      getLatestPreferences: db.prepare(`
        SELECT * FROM user_preferences 
        ORDER BY created_at DESC 
        LIMIT 1
      `),

      getSimulationResults: db.prepare(`
        SELECT * FROM simulation_results 
        WHERE preferences_id = ? AND scenario_type = ?
        ORDER BY year
      `),

      deletePreferences: db.prepare(`
        DELETE FROM user_preferences WHERE id = ?
      `),

      deleteSimulationResults: db.prepare(`
        DELETE FROM simulation_results WHERE preferences_id = ?
      `)
    };
  } catch (error) {
    throw new DatabaseError('Failed to prepare database statements', error as Error);
  }
};

// Types for our database models
export interface UserPreferences {
  id?: number;
  extra_payment: number;
  investment_return: number;
  salary_growth: number;
  market_volatility: number;
  inflation_rate: number;
  liquidity_needed: number;
  job_loss_prob: number;
  refi_prob: number;
  emergency_prob: number;
  ibond_limit: number;
  mega_backdoor_amount: number;
  stress_test_factor: number;
  ibond_base_rate: number;
  created_at?: string;
  updated_at?: string;
}

export interface SimulationResult {
  id?: number;
  preferences_id: number;
  scenario_type: 'mortgage' | 'investment';
  year: number;
  balance: number;
  equity: number;
  home_value: number;
  taxable_investments: number;
  retirement_401k: number;
  total_investments: number;
  net_worth: number;
  pmi_paid: number;
  taxes_paid: number;
  salary: number;
  liquidity_ratio: number;
  mortgage_rate: number;
  confidence_interval?: number;
  created_at?: string;
}

// Database operations with transaction support and error handling
export const savePreferences = (preferences: Omit<UserPreferences, 'id' | 'created_at' | 'updated_at'>): number => {
  const db = getDb();
  const stmt = prepareStatements(db);
  
  try {
    const result = stmt.insertPreferences.run(
      preferences.extra_payment,
      preferences.investment_return,
      preferences.salary_growth,
      preferences.market_volatility,
      preferences.inflation_rate,
      preferences.liquidity_needed,
      preferences.job_loss_prob,
      preferences.refi_prob,
      preferences.emergency_prob,
      preferences.ibond_limit,
      preferences.mega_backdoor_amount,
      preferences.stress_test_factor,
      preferences.ibond_base_rate
    );
    return result.lastInsertRowid as number;
  } catch (error) {
    throw new DatabaseError('Failed to save preferences', error as Error);
  }
};

export const saveSimulationResults = (results: Omit<SimulationResult, 'id' | 'created_at'>[]): void => {
  const db = getDb();
  const stmt = prepareStatements(db);
  
  try {
    const transaction = db.transaction((results) => {
      for (const result of results) {
        stmt.insertSimulationResult.run(
          result.preferences_id,
          result.scenario_type,
          result.year,
          result.balance,
          result.equity,
          result.home_value,
          result.taxable_investments,
          result.retirement_401k,
          result.total_investments,
          result.net_worth,
          result.pmi_paid,
          result.taxes_paid,
          result.salary,
          result.liquidity_ratio,
          result.mortgage_rate,
          result.confidence_interval
        );
      }
    });
    
    transaction(results);
  } catch (error) {
    throw new DatabaseError('Failed to save simulation results', error as Error);
  }
};

export const getLastPreferences = (): UserPreferences | undefined => {
  try {
    const db = getDb();
    const stmt = prepareStatements(db);
    return stmt.getLatestPreferences.get() as UserPreferences | undefined;
  } catch (error) {
    throw new DatabaseError('Failed to get latest preferences', error as Error);
  }
};

export const getResultsByPreferences = (
  preferencesId: number,
  scenarioType: 'mortgage' | 'investment'
): SimulationResult[] => {
  try {
    const db = getDb();
    const stmt = prepareStatements(db);
    return stmt.getSimulationResults.all(preferencesId, scenarioType) as SimulationResult[];
  } catch (error) {
    throw new DatabaseError('Failed to get simulation results', error as Error);
  }
};

// Utility function to delete preferences and associated results
export const deletePreferencesAndResults = (preferencesId: number): void => {
  const db = getDb();
  const stmt = prepareStatements(db);
  
  try {
    const transaction = db.transaction(() => {
      stmt.deleteSimulationResults.run(preferencesId);
      stmt.deletePreferences.run(preferencesId);
    });
    
    transaction();
  } catch (error) {
    throw new DatabaseError('Failed to delete preferences and results', error as Error);
  }
};

// Export database instance for direct access if needed
export const db = getDb(); 