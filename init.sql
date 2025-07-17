-- TaskMaster UI Database Initialization
-- This script ensures the database is properly initialized

-- Create database if it doesn't exist (this is usually handled by POSTGRES_DB)
-- The database is created automatically by the postgres Docker image

-- Grant necessary permissions
GRANT ALL PRIVILEGES ON DATABASE taskmaster_dev TO taskmaster;

-- Enable necessary extensions if needed
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Note: Prisma will handle all table creation and migrations
-- This file just ensures the database is ready for Prisma