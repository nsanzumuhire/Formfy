-- Add auth provider fields to users table
ALTER TABLE users
ADD COLUMN auth_provider VARCHAR(20),
ADD COLUMN provider_user_id VARCHAR(255),
ADD COLUMN profile_data JSONB;
 
-- Create a unique constraint on provider + provider_user_id
CREATE UNIQUE INDEX users_provider_id_idx ON users (auth_provider, provider_user_id); 