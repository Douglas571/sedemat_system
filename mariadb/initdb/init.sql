-- CREATE DATABASE my_database;
-- USE my_database;

-- CREATE TABLE users (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     name VARCHAR(255) NOT NULL,
--     email VARCHAR(255) NOT NULL UNIQUE
-- );

-- INSERT INTO users (name, email) VALUES ('John Doe', 'john@example.com');
-- INSERT INTO users (name, email) VALUES ('Jane Doe', 'jane@example.com');

--  CREATE USER "sedemat_server"@"%" IDENTIFIED BY "12345";
-- GRANT ALL ON "sedemat.*" TO "sedemat_server";


select 'This is a comment' AS '';

-- DROP DATABASE testingdb;

-- CREATE DATABASE testingdb;

-- USE testingdb;

USE sedemat;

CREATE TABLE Payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    amount DECIMAL(10, 2) NOT NULL,
    reference VARCHAR(255) NOT NULL UNIQUE,
    dni VARCHAR(15) NOT NULL,
    account VARCHAR(30) NOT NULL,
    paymentDate DATE NOT NULL,
    image VARCHAR(255),
    state VARCHAR(50),
    business_name VARCHAR(255)
);

-- Insert dummy data into the Payments table
INSERT INTO Payments (amount, reference, dni, account, paymentDate) VALUES (100.50, '122345', 'V-12345678', '0102-0123-4500-0001', '2024-01-01');
INSERT INTO Payments (amount, reference, dni, account, paymentDate) VALUES (200.75, '677890', 'E-87654321', '0102-0123-4500-0002', '2024-02-01');
INSERT INTO Payments (amount, reference, dni, account, paymentDate) VALUES (50.00, '115121', 'V-45678912', '0102-0123-4500-0003', '2024-03-01');
INSERT INTO Payments (amount, reference, dni, account, paymentDate) VALUES (300.20, '141251', 'E-21436587', '0102-0123-4500-0004', '2024-04-01');
INSERT INTO Payments (amount, reference, dni, account, paymentDate) VALUES (120.99, '161371', 'V-78912345', '0102-0123-4500-0005', '2024-05-01');