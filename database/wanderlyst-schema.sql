CREATE TABLE users (
    username VARCHAR(25) PRIMARY KEY,
    password TEXT NOT NULL,
    email TEXT NOT NULL CHECK (position('@' IN email) > 1),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    location TEXT,
    bio TEXT,
    profile_pic TEXT,
    created_at DATE NOT NULL DEFAULT CURRENT_DATE,
    is_admin BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE itineraries (
    id SERIAL PRIMARY KEY,
    username VARCHAR(25) REFERENCES users ON DELETE CASCADE,
    title TEXT NOT NULL,
    duration INT NOT NULL,
    city TEXT NOT NULL,
    country TEXT NOT NULL,
    description TEXT NOT NULL, 
    created_at DATE NOT NULL DEFAULT CURRENT_DATE
);

CREATE TABLE places (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    latitude DECIMAL(9,6) NOT NULL,
    longitude DECIMAL(9,6) NOT NULL
);

CREATE TABLE itin_places (
    id SERIAL PRIMARY KEY,
    itin_id INT REFERENCES itineraries ON DELETE CASCADE,
    place_id INT REFERENCES places,
    sequence INT NOT NULL,
    image TEXT
);

CREATE TABLE likes (
    username VARCHAR(25)  REFERENCES users ON DELETE CASCADE,
    itin_id INT REFERENCES itineraries ON DELETE CASCADE,
    PRIMARY KEY (username, itin_id)
);

CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT 
);

CREATE TABLE itin_tags (
    itin_id INT REFERENCES itineraries ON DELETE CASCADE,
    tag_id INT REFERENCES tags ON DELETE CASCADE, 
    PRIMARY KEY (itin_id, tag_id)
);