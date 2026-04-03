-- Add 'list' column to Deck table if it doesn't exist
ALTER TABLE public."Deck"
ADD COLUMN IF NOT EXISTS list TEXT;

-- Update the schema cache by viewing the table
-- (This helps Supabase PostgREST recognize the new column)
SELECT * FROM information_schema.columns 
WHERE table_name = 'Deck' AND column_name = 'list';
