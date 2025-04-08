-- Вставка в таблицу Routes
INSERT INTO Routes (name, starting_point, ending_point, stops, distance, price)
VALUES
    ('Downtown - Suburbs', 'Downtown Station', 'Suburb Center', 'Stop A, Stop B, Stop C', 15.50, 2.50),
    ('City Loop', 'Central Square', 'Central Square', 'Park, Museum, Library', 8.00, 1.80),
    ('Airport Express', 'City Terminal', 'Airport', NULL, 25.00, 5.00),
    ('East-West Line', 'East Station', 'West Station', 'Market, School', 12.30, 2.00),
    ('Night Route', 'Night Hub', 'Residential Area', 'Club, Cinema', 10.00, 3.00);

-- Вставка в таблицу Buses
INSERT INTO Buses (bus_number, capacity, type, available)
VALUES
    ('A123', 50, 'Standard', TRUE),
    ('B456', 40, 'Minibus', TRUE),
    ('C789', 60, 'Double Decker', FALSE),
    ('D012', 45, 'Standard', TRUE),
    ('E345', 55, 'Articulated', TRUE);

-- Вставка в таблицу Schedules
INSERT INTO Schedules (route_id, departure_time, arrival_time)
VALUES
    (22, '08:00:00', '08:45:00'),  -- Downtown - Suburbs
    (23, '09:00:00', '09:30:00'),  -- City Loop
    (25, '07:30:00', '08:15:00'),  -- Airport Express
    (22, '10:00:00', '10:40:00'),  -- East-West Line
    (23, '23:00:00', '23:35:00');  -- Night Route