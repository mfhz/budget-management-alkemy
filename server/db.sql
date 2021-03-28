---- Tabla de Usuarios
CREATE TABLE users (
  user_id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR (60) NOT NULL,
  lastname VARCHAR (60) NOT NULL,
  mail VARCHAR(60) NOT NULL,
  password VARCHAR (60) NOT NULL,
  admin BOOLEAN NOT NULL DEFAULT FALSE,
  disabled BOOLEAN DEFAULT FALSE
);

---- Tabla de Tipo Movimientos
CREATE TABLE actions (
  action_id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR (60) NOT NULL,
  disabled BOOLEAN DEFAULT FALSE
);

---- Tabla de Ingresos y Egresos 
CREATE TABLE accounting (
  accounting_id INT PRIMARY KEY AUTO_INCREMENT,
  concept VARCHAR (60) NOT NULL,
  price FLOAT NOT NULL,
  date DATETIME NOT NULL,
  action_id INT NOT NULL,
  user_id INT NOT NULL,
  disabled BOOLEAN DEFAULT FALSE,
  FOREIGN KEY(action_id) REFERENCES actions(action_id),
  FOREIGN KEY(user_id) REFERENCES users(user_id)
);



---- Creación de Usuarios
INSERT INTO
  users
VALUES
  (
    NULL,
    "Martin",
    "Henriquez",
    "martin@martin.com",
    "Mh2020-+",
    FALSE,
    FALSE
  );

INSERT INTO
  users
VALUES
  (
    NULL,
    "Ana",
    "Giraldo",
    "ana@ana.com",
    "Mh2020-+",
    FALSE,
    FALSE
  );

INSERT INTO
  users
VALUES
  (
    NULL,
    "admin",
    "admin",
    "admin@admin.com",
    "admin",
    TRUE,
    FALSE
  );



---- Creación de Tipo de movimientos
INSERT INTO
  actions
VALUES
  (
    NULL,
    "Ingreso",
    FALSE
  );

INSERT INTO
  actions
VALUES
  (
    NULL,
    "Egreso",
    FALSE
  );



---- Creación de ingresos y egresos
INSERT INTO
  accounting
VALUES
  (
    NULL,
    "Formateo de equipo de computo",
    120000,
    NOW(),
    1,
    1,
    FALSE
  ),
  (
    NULL,
    "Mantenimientos preventivo",
    80000,
    NOW(),
    1,
    1,
    FALSE
  ),
  (
    NULL,
    "Soporte técnico",
    600000,
    NOW(),
    1,
    1,
    FALSE
  ),
  (
    NULL,
    "Formateo de equipo de computo",
    120000,
    NOW(),
    1,
    1,
    FALSE
  ),
  (
    NULL,
    "Pasajes",
    40000,
    NOW(),
    2,
    1,
    FALSE
  ),
  (
    NULL,
    "Kit de limpieza",
    100000,
    NOW(),
    2,
    1,
    FALSE
  )
  (
    NULL,
    "Kit de limpieza",
    100000,
    NOW(),
    2,
    1,
    FALSE
  )
  (
    NULL,
    "Kit de limpieza",
    100000,
    NOW(),
    2,
    1,
    FALSE
  )
  (
    NULL,
    "Kit de limpieza",
    100000,
    NOW(),
    2,
    1,
    FALSE
  );