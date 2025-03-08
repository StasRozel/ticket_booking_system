-- Создание таблицы Roles
CREATE TABLE Roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL
);

-- Создание таблицы Routes
CREATE TABLE Routes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    starting_point VARCHAR(100) NOT NULL,
    ending_point VARCHAR(100) NOT NULL,
    stops TEXT,
    distance DECIMAL(10, 2),
    price DECIMAL(10, 2) NOT NULL
);

-- Создание таблицы Buses
CREATE TABLE Buses (
    id SERIAL PRIMARY KEY,
    bus_number VARCHAR(20) NOT NULL,
    capacity INTEGER NOT NULL,
    type VARCHAR(50),
    available BOOLEAN DEFAULT TRUE
);

-- Создание таблицы Schedules
CREATE TABLE Schedules (
    id SERIAL PRIMARY KEY,
    route_id INTEGER NOT NULL,
    departure_time TIMESTAMP NOT NULL,
    arrival_time TIMESTAMP NOT NULL,
    FOREIGN KEY (route_id) REFERENCES Routes(id)
);

-- Создание таблицы Users
CREATE TABLE Users (
    id SERIAL PRIMARY KEY,
    role_id INTEGER NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    is_blocked BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (role_id) REFERENCES Roles(id)
);

-- Создание таблицы BusSchedules
CREATE TABLE BusSchedules (
    id SERIAL PRIMARY KEY,
    schedule_id INTEGER NOT NULL,
    bus_id INTEGER NOT NULL,
    operating_days VARCHAR(100),
    FOREIGN KEY (schedule_id) REFERENCES Schedules(id),
    FOREIGN KEY (bus_id) REFERENCES Buses(id)
);

-- Создание таблицы Bookings
CREATE TABLE Bookings (
    id SERIAL PRIMARY KEY,
    bus_schedule_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (bus_schedule_id) REFERENCES BusSchedules(id),
    FOREIGN KEY (user_id) REFERENCES Users(id)
);

-- Создание таблицы Tickets
CREATE TABLE Tickets (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER NOT NULL,
    seat_number INTEGER NOT NULL,
    is_child BOOLEAN DEFAULT FALSE,
    price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (booking_id) REFERENCES Bookings(id)
);


SELECT * FROM Tickets