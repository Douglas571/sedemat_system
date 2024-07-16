USE sedemat;

CREATE TABLE Payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    business_name VARCHAR(255) NOT NULL,
    dni VARCHAR(15) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    reference VARCHAR(255) NOT NULL UNIQUE,
    account VARCHAR(30) NOT NULL,
    paymentDate DATE NOT NULL,
    isVerified BOOLEAN DEFAULT false,
    image VARCHAR(255),
    state VARCHAR(30)
);

CREATE TABLE Businesses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    business_name VARCHAR(255) UNIQUE NOT NULL,
    dni VARCHAR(30) NOT NULL,
    email VARCHAR(50),
    establishment_date DATE, -- the day that the business was registered
    expiration_date DATE, -- the day that the business will be disolved
    board_expiration_date DATE, -- the day that the business board will be disolved

    filcal_id INT
);

-- Insert dummy data into the Payments table
INSERT INTO Payments (business_name, amount, reference, dni, account, paymentDate) VALUES ('CASA CHEN, C.A', 100.50, '122345', 'E-8228509-0', '0102-0123-4500-0001', '2024-01-01');
INSERT INTO Payments (business_name, amount, reference, dni, account, paymentDate) VALUES ('COMERCIAL SOL CARIBE', 200.75, '677890', 'E-82288744-1', '0102-0123-4500-0002', '2024-02-01');
INSERT INTO Payments (business_name, amount, reference, dni, account, paymentDate) VALUES ('CARNICERIA TAICO', 50.00, '115121', 'E-84417324-8', '0102-0123-4500-0003', '2024-03-01');
INSERT INTO Payments (business_name, amount, reference, dni, account, paymentDate) VALUES ('ALCALDÍA DE ZAMORA', 300.20, '141251', 'G-200006366', '0102-0123-4500-0004', '2024-04-01');
INSERT INTO Payments (business_name, amount, reference, dni, account, paymentDate) VALUES ('BANCO BICENTENARIO DEL PUEBLO DE LA CLASE OBRERA, MUJER Y COMUNAS, BANCO UNIVERSAL, C.A', 120.99, '161371', 'G-20009148-7', '0102-0123-4500-0005', '2024-05-01');


-- Insert dummy data into the Businesses table
INSERT INTO Businesses (business_name, dni, email, establishment_date, expiration_date, board_expiration_date) 
VALUES 
    ('CASA CHEN, C.A', 'E-8228509-0', 'contact@casachen.com', '2000-01-01', '2025-01-01', '2024-01-01'),
    ('COMERCIAL SOL CARIBE', 'E-82288744-1', 'info@solcaribe.com', '2010-05-15', '2030-05-15', '2028-05-15'),
    ('CARNICERIA TAICO', 'E-84417324-8', 'support@taico.com', '2012-07-20', '2032-07-20', '2030-07-20'),
    ('ALCALDÍA DE ZAMORA', 'G-200006366', 'contact@zamora.gob.ve', '1998-10-10', '2048-10-10', '2045-10-10'),
    ('BANCO BICENTENARIO DEL PUEBLO DE LA CLASE OBRERA, MUJER Y COMUNAS, BANCO UNIVERSAL, C.A', 'G-20009148-7', 'bicentenario@banco.com', '2005-02-14', '2055-02-14', '2050-02-14'),
    ('BANCO DE VENEZUELA AGENCIA 769 PUERTO CUMAREBO, C.A', 'G-20009997-6', 'venezuela@banco.com', '1995-03-12', '2045-03-12', '2040-03-12'),
    ('INDUSTRIA VENEZOLANA DE CEMENTO (INVECEM), S.A.', 'G-20011588-2', 'contact@invecem.com', '2003-06-18', '2053-06-18', '2050-06-18'),
    ('CARBON ACTIVADO, C.A', 'J-00270015-7', 'info@carbonactivo.com', '2015-08-24', '2065-08-24', '2060-08-24'),
    ('TELEFONICA VENEZUELA, C.A', 'J-00343994-0', 'support@telefonica.com', '2000-11-05', '2050-11-05', '2048-11-05'),
    ('TRANSPORTE F-TADEO C.A', 'J-29394010-9', 'info@ftadeo.com', '2018-01-01', '2068-01-01', '2065-01-01');