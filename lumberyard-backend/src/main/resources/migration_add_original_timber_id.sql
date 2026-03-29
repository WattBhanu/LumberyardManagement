-- Migration script to add original_timber_id column for tracking treated timber
-- Run this on your existing database to support the new timber tracking feature

ALTER TABLE timber 
ADD COLUMN original_timber_id BIGINT;

-- Add foreign key constraint (optional, but recommended for data integrity)
ALTER TABLE timber 
ADD CONSTRAINT fk_original_timber 
FOREIGN KEY (original_timber_id) REFERENCES timber(id);

-- Note: This column will be NULL for existing untreated timber records
-- and will contain the ID of the original untreated timber for new treated records
