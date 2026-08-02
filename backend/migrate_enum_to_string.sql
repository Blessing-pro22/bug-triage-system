-- Migration script to change ENUM columns to VARCHAR
-- Run this in your PostgreSQL database

-- First, drop the existing ENUM type if it exists
DROP TYPE IF EXISTS status CASCADE;
DROP TYPE IF EXISTS severity CASCADE;
DROP TYPE IF EXISTS team CASCADE;

-- Alter the columns to VARCHAR (they should already be VARCHAR in the model)
-- This ensures the database matches the model definition
ALTER TABLE bugs ALTER COLUMN status TYPE VARCHAR(50);
ALTER TABLE bugs ALTER COLUMN predicted_severity TYPE VARCHAR(50);
ALTER TABLE bugs ALTER COLUMN predicted_team TYPE VARCHAR(50);
ALTER TABLE bugs ALTER COLUMN final_severity TYPE VARCHAR(50);
ALTER TABLE bugs ALTER COLUMN final_team TYPE VARCHAR(50);
