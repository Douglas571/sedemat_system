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

INSERT INTO Payments (business_name, amount, reference, dni, account, paymentDate) VALUES ('CASA CHEN, C.A', 100.50, '122345', 'E-8228509-0', '0102-0123-4500-0001', '2024-01-01');
INSERT INTO Payments (business_name, amount, reference, dni, account, paymentDate) VALUES ('COMERCIAL SOL CARIBE', 200.75, '677890', 'E-82288744-1', '0102-0123-4500-0002', '2024-02-01');
INSERT INTO Payments (business_name, amount, reference, dni, account, paymentDate) VALUES ('CARNICERIA TAICO', 50.00, '115121', 'E-84417324-8', '0102-0123-4500-0003', '2024-03-01');
INSERT INTO Payments (business_name, amount, reference, dni, account, paymentDate) VALUES ('ALCALDÍA DE ZAMORA', 300.20, '141251', 'G-200006366', '0102-0123-4500-0004', '2024-04-01');
INSERT INTO Payments (business_name, amount, reference, dni, account, paymentDate) VALUES ('BANCO BICENTENARIO DEL PUEBLO DE LA CLASE OBRERA, MUJER Y COMUNAS, BANCO UNIVERSAL, C.A', 120.99, '161371', 'G-20009148-7', '0102-0123-4500-0005', '2024-05-01');