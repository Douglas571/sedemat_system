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