-- Drop tables if they exist (be careful with this in production!)
DROP TABLE IF EXISTS favorite_tokens;
DROP TABLE IF EXISTS users;

-- Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    public_key VARCHAR(44) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create favorite_tokens table
CREATE TABLE favorite_tokens (
    id SERIAL PRIMARY KEY,
    public_key VARCHAR(44) NOT NULL,
    token_address VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (public_key) REFERENCES users(public_key) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX idx_favorite_tokens_public_key ON favorite_tokens(public_key);
CREATE INDEX idx_favorite_tokens_token_address ON favorite_tokens(token_address);

-- Create unique constraint to prevent duplicate favorites
CREATE UNIQUE INDEX idx_unique_favorite ON favorite_tokens(public_key, token_address);
