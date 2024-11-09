CREATE DATABASE slotdb;
\c slotdb;


CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    balance DECIMAL(10, 2) DEFAULT 0.00,
    win_rate DECIMAL(5, 2) DEFAULT NULL, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE admins (
    admin_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE spins (
    spin_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    bet_amount DECIMAL(10, 2) NOT NULL,
    win_amount DECIMAL(10, 2) DEFAULT 0.00,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE game_settings (
    setting_id SERIAL PRIMARY KEY,
    reels INT NOT NULL,
    rows INT NOT NULL,
    rtp DECIMAL(5, 2) NOT NULL,
    win_rate DECIMAL(5, 2) DEFAULT 30.00 
);


CREATE TABLE transactions (
    transaction_id SERIAL PRIMARY KEY,
    admin_id INT REFERENCES admins(admin_id),
    user_id INT REFERENCES users(id),
    amount DECIMAL(10, 2) DEFAULT 0.00,
    action_type VARCHAR(50) NOT NULL, 
    new_win_rate DECIMAL(5, 2) DEFAULT NULL,
    previous_win_rate DECIMAL(5, 2) DEFAULT NULL, 
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE player_statistics (
    user_id INT PRIMARY KEY REFERENCES users(id),
    total_spins INT DEFAULT 0,            
    total_wins INT DEFAULT 0,            
    total_win_amount DECIMAL(10, 2) DEFAULT 0.00, 
    last_win_date TIMESTAMP               
);


CREATE TABLE pokemon (
    pokemon_id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,   
    image_url TEXT NOT NULL,            
    reward DECIMAL(10, 2) DEFAULT 0.00, 
    role VARCHAR(20) DEFAULT 'regular'  
);


INSERT INTO users (username, password) VALUES ('admin', 'admin');


INSERT INTO pokemon (name, image_url, reward, role) VALUES
    ('Pikachu', 'https://img.pokemondb.net/artwork/large/pikachu.jpg', 100, 'bonus'),
    ('Bulbasaur', 'https://img.pokemondb.net/artwork/large/bulbasaur.jpg', 20, 'regular'),
    ('Charmander', 'https://img.pokemondb.net/artwork/large/charmander.jpg', 25, 'regular'),
    ('Squirtle', 'https://img.pokemondb.net/artwork/large/squirtle.jpg', 30, 'regular'),
    ('Jigglypuff', 'https://img.pokemondb.net/artwork/large/jigglypuff.jpg', 15, 'wild'),
    ('Meowth', 'https://img.pokemondb.net/artwork/large/meowth.jpg', 20, 'regular'),
    ('Psyduck', 'https://img.pokemondb.net/artwork/large/psyduck.jpg', 15, 'regular'),
    ('Snorlax', 'https://img.pokemondb.net/artwork/large/snorlax.jpg', 40, 'regular'),
    ('Eevee', 'https://img.pokemondb.net/artwork/large/eevee.jpg', 35, 'regular'),
    ('Vulpix', 'https://img.pokemondb.net/artwork/large/vulpix.jpg', 20, 'regular'),
    ('Oddish', 'https://img.pokemondb.net/artwork/large/oddish.jpg', 15, 'regular'),
    ('Machop', 'https://img.pokemondb.net/artwork/large/machop.jpg', 25, 'regular'),
    ('Geodude', 'https://img.pokemondb.net/artwork/large/geodude.jpg', 20, 'regular'),
    ('Slowpoke', 'https://img.pokemondb.net/artwork/large/slowpoke.jpg', 10, 'regular'),
    ('Rattata', 'https://img.pokemondb.net/artwork/large/rattata.jpg', 10, 'regular');
