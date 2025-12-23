-- Roles table
CREATE TABLE Roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL
);

-- Routes table
CREATE TABLE Routes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    starting_point VARCHAR(100) NOT NULL,
    ending_point VARCHAR(100) NOT NULL,
    stops TEXT,
    distance DECIMAL(10, 2),
    price DECIMAL(10, 2) NOT NULL
);

-- Buses table
CREATE TABLE Buses (
    id SERIAL PRIMARY KEY,
    bus_number VARCHAR(20) NOT NULL,
    capacity INTEGER[] NOT NULL,
    type VARCHAR(50),
    available BOOLEAN DEFAULT TRUE
);

-- Schedules table
CREATE TABLE Schedules (
    id SERIAL PRIMARY KEY,
    route_id INTEGER NOT NULL,
    departure_time TIME NOT NULL,
    arrival_time TIME NOT NULL,
    FOREIGN KEY (route_id) REFERENCES Routes(id) ON DELETE CASCADE
);

-- Users table
CREATE TABLE Users (
    id SERIAL PRIMARY KEY,
    role_id INTEGER NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20) DEFAULT '',
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    count_trips INTEGER DEFAULT 0,
    is_blocked BOOLEAN DEFAULT FALSE,
    refresh_token VARCHAR(255),
    FOREIGN KEY (role_id) REFERENCES Roles(id)
);

-- BusSchedules table
CREATE TABLE BusSchedules (
    id SERIAL PRIMARY KEY,
    schedule_id INTEGER NOT NULL,
    bus_id INTEGER NOT NULL,
    operating_days DATE,
    visited_stops JSON DEFAULT '[]',
    FOREIGN KEY (schedule_id) REFERENCES Schedules(id) ON DELETE CASCADE,
    FOREIGN KEY (bus_id) REFERENCES Buses(id)
);

-- Bookings table
CREATE TABLE Bookings (
    id SERIAL PRIMARY KEY,
    bus_schedule_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) NOT NULL,
    FOREIGN KEY (bus_schedule_id) REFERENCES BusSchedules(id),
    FOREIGN KEY (user_id) REFERENCES Users(id)
);

-- Tickets table
CREATE TABLE Tickets (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER NOT NULL,
    seat_number INTEGER NOT NULL,
    is_child BOOLEAN DEFAULT FALSE,
    price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (booking_id) REFERENCES Bookings(id)
);

-- Drivers table
CREATE TABLE Drivers (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    bus_id INTEGER DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES Users(id),
    FOREIGN KEY (bus_id) REFERENCES Buses(id)
);

-- UrgentCalls table
CREATE TABLE UrgentCalls (
    id SERIAL PRIMARY KEY,
    bus_schedule_id INTEGER NOT NULL,
    driver_id INTEGER NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    accepted BOOLEAN DEFAULT false,
    FOREIGN KEY (bus_schedule_id) REFERENCES BusSchedules(id),
    FOREIGN KEY (driver_id) REFERENCES Drivers(id)
);

-- DriverComplaints table
CREATE TABLE DriverComplaints (
    id SERIAL PRIMARY KEY,
    driver_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    complaint_text TEXT NOT NULL,
    FOREIGN KEY (driver_id) REFERENCES Drivers(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);