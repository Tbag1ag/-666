
import { neon } from '@neondatabase/serverless';

// 注入 Netlify 环境变量
const databaseUrl = process.env.DATABASE_URL || '';

export const isDbConfigured = !!databaseUrl;

// 创建 SQL 执行器
export const sql = isDbConfigured ? neon(databaseUrl) : null;

/**
 * 核心初始化函数：确保生产环境数据库表结构就绪
 */
export const initDatabase = async () => {
  if (!sql) {
    console.warn("Database URL not found. Running in local-only mode.");
    return;
  }
  
  try {
    // 每日洞察表
    await sql`
      CREATE TABLE IF NOT EXISTS insights (
        id TEXT PRIMARY KEY,
        symbol TEXT NOT NULL,
        category TEXT,
        status TEXT,
        focus_points TEXT,
        strategy TEXT,
        entry_level TEXT,
        updated_at BIGINT,
        completion_status TEXT DEFAULT '进行中'
      );
    `;
    
    // 信息瀑布流表
    await sql`
      CREATE TABLE IF NOT EXISTS journals (
        id TEXT PRIMARY KEY,
        title TEXT,
        content TEXT NOT NULL,
        mood TEXT,
        type TEXT,
        source TEXT,
        date BIGINT
      );
    `;
    
    // 通知中心表
    await sql`
      CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        title TEXT,
        message TEXT,
        timestamp BIGINT,
        is_read BOOLEAN DEFAULT FALSE,
        type TEXT
      );
    `;
    console.log("Neon Database initialized successfully.");
  } catch (error) {
    console.error("Critical: Database initialization failed:", error);
    throw error;
  }
};
