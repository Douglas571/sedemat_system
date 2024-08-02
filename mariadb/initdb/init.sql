USE sedemat;

CREATE TABLE economic_activities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    alicuota DECIMAL(5, 2) NOT NULL,
    minimum_tax DECIMAL(10, 2) NOT NULL
);


CREATE TABLE people (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dni VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    phone VARCHAR(50),
    whatsapp VARCHAR(50),
    email VARCHAR(255),
    profile_picture_url VARCHAR(255)
);

CREATE TABLE payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    business_name VARCHAR(255) NOT NULL,
    dni VARCHAR(15) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    reference VARCHAR(255) NOT NULL UNIQUE,
    account VARCHAR(30) NOT NULL,
    payment_date DATE NOT NULL,
    is_verified BOOLEAN DEFAULT false,
    image VARCHAR(255),
    state VARCHAR(30)
);

CREATE TABLE businesses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    business_name VARCHAR(255) UNIQUE NOT NULL,
    dni VARCHAR(30) NOT NULL,
    email VARCHAR(50),
    company_incorporation_date DATE, -- the day that the business was registered
    company_expiration_date DATE, -- the day that the business will be disolved
    directors_board_expiration_date DATE, -- the day that the business board will be disolved

    economic_activity_id INT NOT NULL,

    owner_person_id INT,
    accountant_person_id INT,
    administrator_person_id INT,

    preferred_channel VARCHAR(30),
    send_calculos_to VARCHAR(30),
    preferred_contact VARCHAR(30),

    reminder_interval INT,

    filcal_id INT,
    FOREIGN KEY (economic_activity_id) REFERENCES economic_activities(id),
    FOREIGN KEY (owner_person_id) REFERENCES people(id),
    FOREIGN KEY (accountant_person_id) REFERENCES people(id),
    FOREIGN KEY (administrator_person_id) REFERENCES people(id)
);

CREATE TABLE branch_offices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    address VARCHAR(255) NOT NULL,
    zone VARCHAR(200) NOT NULL,
    phone VARCHAR(30),
    business_id INT NOT NULL, 
    dimensions INT NOT NULL,
    type VARCHAR(30),
    origin VARCHAR(30), -- convert into some kind of constant
    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE economic_licenses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    branch_office_id INT NOT NULL,
    economic_activity_id INT NOT NULL,
    open_at TIME,
    close_at TIME,
    issued_date DATE NOT NULL,
    expiration_date DATE NOT NULL,
    FOREIGN KEY (branch_office_id) REFERENCES branch_offices(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (economic_activity_id) REFERENCES economic_activities(id) ON UPDATE CASCADE
);


INSERT INTO economic_activities (code, title, alicuota, minimum_tax) VALUES (1001, 'Comercio al por menor', 1.50, 5.00);
INSERT INTO economic_activities (code, title, alicuota, minimum_tax) VALUES (1002, 'Comercio al por mayor', 2.00, 6.00);
INSERT INTO economic_activities (code, title, alicuota, minimum_tax) VALUES (1003, 'Servicios financieros', 2.50, 7.00);
INSERT INTO economic_activities (code, title, alicuota, minimum_tax) VALUES (1004, 'Transporte y almacenamiento', 1.75, 5.50);
INSERT INTO economic_activities (code, title, alicuota, minimum_tax) VALUES (1005, 'Construcción', 2.25, 6.50);
INSERT INTO economic_activities (code, title, alicuota, minimum_tax) VALUES (1006, 'Servicios profesionales', 3.00, 8.00);
INSERT INTO economic_activities (code, title, alicuota, minimum_tax) VALUES (1007, 'Educación', 1.00, 5.00);
INSERT INTO economic_activities (code, title, alicuota, minimum_tax) VALUES (1008, 'Salud', 2.75, 9.00);
INSERT INTO economic_activities (code, title, alicuota, minimum_tax) VALUES (1009, 'Agricultura', 1.25, 5.75);
INSERT INTO economic_activities (code, title, alicuota, minimum_tax) VALUES (1010, 'Tecnología de la información', 2.50, 10.00);

-- Insert dummy data into the Payments table
INSERT INTO payments (business_name, amount, reference, dni, account, payment_date) VALUES ('CASA CHEN, C.A', 100.50, '122345', 'E-8228509-0', '0102-0123-4500-0001', '2024-01-01');
INSERT INTO payments (business_name, amount, reference, dni, account, payment_date) VALUES ('COMERCIAL SOL CARIBE', 200.75, '677890', 'E-82288744-1', '0102-0123-4500-0002', '2024-02-01');
INSERT INTO payments (business_name, amount, reference, dni, account, payment_date) VALUES ('CARNICERIA TAICO', 50.00, '115121', 'E-84417324-8', '0102-0123-4500-0003', '2024-03-01');
INSERT INTO payments (business_name, amount, reference, dni, account, payment_date) VALUES ('ALCALDÍA DE ZAMORA', 300.20, '141251', 'G-200006366', '0102-0123-4500-0004', '2024-04-01');
INSERT INTO payments (business_name, amount, reference, dni, account, payment_date) VALUES ('BANCO BICENTENARIO DEL PUEBLO DE LA CLASE OBRERA, MUJER Y COMUNAS, BANCO UNIVERSAL, C.A', 120.99, '161371', 'G-20009148-7', '0102-0123-4500-0005', '2024-05-01');

-- Insert dummy data into the Businesses table
INSERT INTO businesses (business_name, dni, email, company_incorporation_date, company_expiration_date, directors_board_expiration_date, economic_activity_id) 
VALUES 
    ('CASA CHEN, C.A', 'E-8228509-0', 'contact@casachen.com', '2000-01-01', '2025-01-01', '2024-01-01', 1),
    ('COMERCIAL SOL CARIBE', 'E-82288744-1', 'info@solcaribe.com', '2010-05-15', '2030-05-15', '2028-05-15', 1);
    -- ('CARNICERIA TAICO', 'E-84417324-8', 'support@taico.com', '2012-07-20', '2032-07-20', '2030-07-20', 1),
    -- ('ALCALDÍA DE ZAMORA', 'G-200006366', 'contact@zamora.gob.ve', '1998-10-10', '2048-10-10', '2045-10-10', 1),
    -- ('BANCO BICENTENARIO DEL PUEBLO DE LA CLASE OBRERA, MUJER Y COMUNAS, BANCO UNIVERSAL, C.A', 'G-20009148-7', 'bicentenario@banco.com', '2005-02-14', '2055-02-14', '2050-02-14', 2),
    -- ('BANCO DE VENEZUELA AGENCIA 769 PUERTO CUMAREBO, C.A', 'G-20009997-6', 'venezuela@banco.com', '1995-03-12', '2045-03-12', '2040-03-12', 2),
    -- ('INDUSTRIA VENEZOLANA DE CEMENTO (INVECEM), S.A.', 'G-20011588-2', 'contact@invecem.com', '2003-06-18', '2053-06-18', '2050-06-18', 2),
    -- ('CARBON ACTIVADO, C.A', 'J-00270015-7', 'info@carbonactivo.com', '2015-08-24', '2065-08-24', '2060-08-24', 3),
    -- ('TELEFONICA VENEZUELA, C.A', 'J-00343994-0', 'support@telefonica.com', '2000-11-05', '2050-11-05', '2048-11-05', 3),
    -- ('TRANSPORTE F-TADEO C.A', 'J-29394010-9', 'info@ftadeo.com', '2018-01-01', '2068-01-01', '2065-01-01', 3);