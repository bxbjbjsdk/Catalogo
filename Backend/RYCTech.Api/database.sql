-- ================================================
-- RYC TECH - Script de base de datos
-- Base de datos: PI_RYC
--
-- INSTRUCCIONES:
-- 1. Abre SQL Server Management Studio
-- 2. Abre este archivo o copia el contenido
-- 3. Ejecuta todo el script (F5 o boton Execute)
-- 4. Listo, las tablas y datos de prueba se crean solos
-- ================================================

-- Crear la base de datos si no existe
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'PI_RYC')
BEGIN
    CREATE DATABASE PI_RYC;
END
GO

USE PI_RYC;
GO

-- ================================================
-- TABLA: Roles
-- Puede ser "Administrador" o "Empleado"
-- ================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Roles')
BEGIN
    CREATE TABLE Roles (
        Id        INT IDENTITY(1,1) PRIMARY KEY,
        Nombre    VARCHAR(50) NOT NULL UNIQUE,
        CreadoEn  DATETIME DEFAULT GETDATE()
    );
END
GO

-- ================================================
-- TABLA: Usuarios (empleados de la tienda)
-- ================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Usuarios')
BEGIN
    CREATE TABLE Usuarios (
        Id           INT IDENTITY(1,1) PRIMARY KEY,
        Nombre       VARCHAR(100)  NOT NULL,
        Correo       VARCHAR(150)  NOT NULL UNIQUE,
        -- Guardamos el hash SHA-256, nunca la contrasena en texto plano
        PasswordHash VARCHAR(255)  NOT NULL,
        RolId        INT           NOT NULL,
        Activo       BIT           DEFAULT 1,
        CreadoEn     DATETIME      DEFAULT GETDATE(),
        FOREIGN KEY (RolId) REFERENCES Roles(Id)
    );
END
GO

-- ================================================
-- TABLA: Categorias
-- ================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Categorias')
BEGIN
    CREATE TABLE Categorias (
        Id        INT IDENTITY(1,1) PRIMARY KEY,
        Nombre    VARCHAR(100) NOT NULL UNIQUE,
        Activa    BIT          DEFAULT 1,
        CreadoEn  DATETIME     DEFAULT GETDATE()
    );
END
GO

-- ================================================
-- TABLA: Productos
-- ================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Productos')
BEGIN
    CREATE TABLE Productos (
        Id             INT IDENTITY(1,1) PRIMARY KEY,
        Nombre         VARCHAR(200)   NOT NULL,
        Descripcion    TEXT,
        -- Precio con hasta 10 digitos y 2 decimales
        Precio         DECIMAL(10,2)  NOT NULL CHECK (Precio >= 0),
        -- PrecioOriginal es NULL si el producto no esta en oferta
        PrecioOriginal DECIMAL(10,2)  NULL,
        -- Ruta relativa de la imagen, ej: "imagenes/Samsung.jpg"
        Imagen         VARCHAR(300),
        -- Badge puede ser: "nuevo", "oferta" o NULL
        Badge          VARCHAR(20)    NULL,
        CategoriaId    INT            NOT NULL,
        Activo         BIT            DEFAULT 1,
        CreadoEn       DATETIME       DEFAULT GETDATE(),
        ActualizadoEn  DATETIME       DEFAULT GETDATE(),
        FOREIGN KEY (CategoriaId) REFERENCES Categorias(Id)
    );
END
GO

-- ================================================
-- TABLA: Especificaciones tecnicas de productos
-- Ej: ProductoId=1, Clave="RAM", Valor="8GB"
-- ================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ProductoEspecificaciones')
BEGIN
    CREATE TABLE ProductoEspecificaciones (
        Id          INT IDENTITY(1,1) PRIMARY KEY,
        ProductoId  INT          NOT NULL,
        Clave       VARCHAR(100) NOT NULL,
        Valor       VARCHAR(200) NOT NULL,
        FOREIGN KEY (ProductoId) REFERENCES Productos(Id) ON DELETE CASCADE
    );
END
GO

-- ================================================
-- DATOS DE PRUEBA
-- ================================================

-- Roles
IF NOT EXISTS (SELECT * FROM Roles)
BEGIN
    INSERT INTO Roles (Nombre) VALUES ('Administrador'), ('Empleado');
END
GO

-- Categorias
IF NOT EXISTS (SELECT * FROM Categorias)
BEGIN
    INSERT INTO Categorias (Nombre) VALUES
        ('Tecnologia'),
        ('Accesorios');
END
GO

-- Usuarios de prueba
-- Las contrasenas son hashes SHA-256:
--   admin123    -> 240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9
--   empleado123 -> ya no lo ponemos aqui, calcula con el backend
IF NOT EXISTS (SELECT * FROM Usuarios)
BEGIN
    INSERT INTO Usuarios (Nombre, Correo, PasswordHash, RolId) VALUES
    (
        'Admin Principal',
        'admin@ryctech.com',
        -- Hash SHA-256 de "admin123"
        '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9',
        1  -- Administrador
    ),
    (
        'Carlos Mendoza',
        'carlos@ryctech.com',
        -- Hash SHA-256 de "empleado123"
        'f2d81a260dea8a100dd517984e53c56a7523d96942a834b9cdc249bd4e8c7aa9',
        2  -- Empleado
    );
END
GO

-- Productos de prueba
IF NOT EXISTS (SELECT * FROM Productos)
BEGIN
    INSERT INTO Productos (Nombre, Descripcion, Precio, PrecioOriginal, Imagen, Badge, CategoriaId) VALUES
    (
        'Samsung Galaxy S24',
        'Smartphone de ultima generacion con conectividad 5G, pantalla Dynamic AMOLED 2X de 6.2 pulgadas y procesador Snapdragon 8 Gen 3.',
        899.99, NULL, 'imagenes/Samsung Galaxy S24.jpg', 'nuevo', 1
    ),
    (
        'MacBook Air M2',
        'Laptop ultradelgada con el chip M2 de Apple. Rendimiento profesional con hasta 18 horas de bateria.',
        1199.00, NULL, 'imagenes/MacBook Air Apple.webp', NULL, 1
    ),
    (
        'Sony WH-1000XM5',
        'Audifonos premium con cancelacion de ruido lider en la industria. Hasta 30 horas de reproduccion.',
        349.99, 399.99, 'imagenes/Sony WH.jpg', 'oferta', 2
    ),
    (
        'Apple Watch Series 9',
        'Smartwatch con chip S9, pantalla Always-On Retina mas brillante y nuevas funciones de salud.',
        399.00, NULL, 'imagenes/Apple Watch.jpg', NULL, 1
    ),
    (
        'iPad Air',
        'Tablet versatil con chip M1, pantalla Liquid Retina de 10.9 pulgadas y soporte para Apple Pencil.',
        599.99, NULL, 'imagenes/Apple iPad Air.jpg', NULL, 1
    ),
    (
        'Nintendo Switch 2',
        'Nueva consola con soporte 4K, 256 GB de almacenamiento, chat integrado y compatible con juegos de Switch.',
        220.00, 649.99, 'imagenes/Nintendo Switch.jpg', 'oferta', 1
    ),
    (
        'JBL Wave Beam',
        'Audifonos True Wireless Stereo intra-auditivos con Deep Bass Sound y hasta 32 horas de reproduccion.',
        176.00, 220.00, 'imagenes/oferta.jpg', 'oferta', 2
    ),
    (
        'AirPods Pro',
        'Audifonos inalambricos con audio espacial personalizado y cancelacion activa de ruido.',
        212.49, 249.99, 'imagenes/AirProds Pro.jpg', 'oferta', 2
    ),
    (
        'Logitech G502',
        'Mouse gamer con sensor HERO 25K, 11 botones programables e iluminacion RGB personalizable.',
        89.99, NULL, 'imagenes/mouse-gamer.jpg', NULL, 2
    ),
    (
        'Hisense Televisor 55"',
        'Smart TV 55 pulgadas con resolucion 4K Ultra HD, HDR10+ y sistema operativo VIDAA.',
        649.99, NULL, 'imagenes/Hisense Televisor.jpg', 'nuevo', 1
    );
END
GO

-- Especificaciones tecnicas
IF NOT EXISTS (SELECT * FROM ProductoEspecificaciones)
BEGIN
    -- Samsung Galaxy S24 (Id = 1)
    INSERT INTO ProductoEspecificaciones (ProductoId, Clave, Valor) VALUES
    (1, 'Almacenamiento', '256 GB'),
    (1, 'RAM', '8 GB'),
    (1, 'Pantalla', '6.2" AMOLED'),
    (1, 'Bateria', '4000 mAh');

    -- MacBook Air M2 (Id = 2)
    INSERT INTO ProductoEspecificaciones (ProductoId, Clave, Valor) VALUES
    (2, 'Procesador', 'Apple M2'),
    (2, 'SSD', '256 GB'),
    (2, 'Pantalla', '13.6" Liquid Retina'),
    (2, 'Bateria', '18 horas');

    -- Sony WH-1000XM5 (Id = 3)
    INSERT INTO ProductoEspecificaciones (ProductoId, Clave, Valor) VALUES
    (3, 'Bateria', '30 horas'),
    (3, 'Conexion', 'Bluetooth 5.2'),
    (3, 'Cancelacion', 'Activa (ANC)'),
    (3, 'Driver', '30 mm');

    -- AirPods Pro (Id = 8)
    INSERT INTO ProductoEspecificaciones (ProductoId, Clave, Valor) VALUES
    (8, 'Bateria', '6h + 30h estuche'),
    (8, 'ANC', 'Activa'),
    (8, 'Chip', 'H2'),
    (8, 'Audio', 'Espacial personalizado');

    -- Logitech G502 (Id = 9)
    INSERT INTO ProductoEspecificaciones (ProductoId, Clave, Valor) VALUES
    (9, 'DPI', '100 - 25,600'),
    (9, 'Botones', '11 programables'),
    (9, 'Peso', '121 g'),
    (9, 'Iluminacion', 'RGB LIGHTSYNC');
END
GO

-- ================================================
-- Verificar que todo se creo correctamente
-- ================================================
SELECT 'Roles'      AS Tabla, COUNT(*) AS Registros FROM Roles
UNION ALL
SELECT 'Usuarios',    COUNT(*) FROM Usuarios
UNION ALL
SELECT 'Categorias',  COUNT(*) FROM Categorias
UNION ALL
SELECT 'Productos',   COUNT(*) FROM Productos
UNION ALL
SELECT 'Specs',       COUNT(*) FROM ProductoEspecificaciones;
GO
