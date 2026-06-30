/* ================================================
   demo-data.js
   Datos de muestra para la version de demostracion
   SIN backend ni base de datos.
   Todo vive en este archivo en memoria.
   ================================================ */

const DEMO_PRODUCTOS = [
    {
        id: 1,
        nombre: "Samsung Galaxy S24",
        categoria: "Tecnologia",
        precio: 899.99,
        precioOriginal: null,
        badge: "nuevo",
        imagen: "Samsung Galaxy S24.jpg",
        descripcion: "Smartphone de ultima generacion con conectividad 5G, pantalla Dynamic AMOLED 2X de 6.2 pulgadas y procesador Snapdragon 8 Gen 3.",
        specs: [
            { clave: "Almacenamiento", valor: "256 GB" },
            { clave: "RAM", valor: "8 GB" },
            { clave: "Pantalla", valor: "6.2\" AMOLED" },
            { clave: "Bateria", valor: "4000 mAh" }
        ]
    },
    {
        id: 2,
        nombre: "MacBook Air M2",
        categoria: "Tecnologia",
        precio: 1199.00,
        precioOriginal: null,
        badge: null,
        imagen: "MacBook Air Apple.webp",
        descripcion: "Laptop ultradelgada con el chip M2 de Apple. Rendimiento profesional con hasta 18 horas de bateria.",
        specs: [
            { clave: "Procesador", valor: "Apple M2" },
            { clave: "SSD", valor: "256 GB" },
            { clave: "Pantalla", valor: "13.6\" Liquid Retina" },
            { clave: "Bateria", valor: "18 horas" }
        ]
    },
    {
        id: 3,
        nombre: "Sony WH-1000XM5",
        categoria: "Accesorios",
        precio: 349.99,
        precioOriginal: 399.99,
        badge: "oferta",
        imagen: "Sony WH.jpg",
        descripcion: "Audifonos premium con cancelacion de ruido lider en la industria. Hasta 30 horas de reproduccion.",
        specs: [
            { clave: "Bateria", valor: "30 horas" },
            { clave: "Conexion", valor: "Bluetooth 5.2" },
            { clave: "Cancelacion", valor: "Activa (ANC)" },
            { clave: "Driver", valor: "30 mm" }
        ]
    },
    {
        id: 4,
        nombre: "Apple Watch Series 9",
        categoria: "Tecnologia",
        precio: 399.00,
        precioOriginal: null,
        badge: null,
        imagen: "Apple Watch.jpg",
        descripcion: "Smartwatch con chip S9, pantalla Always-On Retina mas brillante y nuevas funciones de salud.",
        specs: [
            { clave: "Pantalla", valor: "Always-On Retina" },
            { clave: "GPS", valor: "Integrado" },
            { clave: "Resistencia", valor: "WR50" },
            { clave: "Bateria", valor: "18 horas" }
        ]
    },
    {
        id: 5,
        nombre: "iPad Air",
        categoria: "Tecnologia",
        precio: 599.99,
        precioOriginal: null,
        badge: null,
        imagen: "Apple iPad Air.jpg",
        descripcion: "Tablet versatil con chip M1, pantalla Liquid Retina de 10.9 pulgadas y soporte para Apple Pencil.",
        specs: [
            { clave: "Procesador", valor: "Apple M1" },
            { clave: "Almacenamiento", valor: "64 GB" },
            { clave: "Pantalla", valor: "10.9\" Liquid Retina" },
            { clave: "Conectividad", valor: "Wi-Fi 6" }
        ]
    },
    {
        id: 6,
        nombre: "Nintendo Switch 2",
        categoria: "Tecnologia",
        precio: 220.00,
        precioOriginal: 649.99,
        badge: "oferta",
        imagen: "Nintendo Switch.jpg",
        descripcion: "Nueva consola con soporte 4K, 256 GB de almacenamiento, chat integrado y compatible con juegos de Switch.",
        specs: [
            { clave: "Resolucion", valor: "4K (dock)" },
            { clave: "Almacenamiento", valor: "256 GB" },
            { clave: "Pantalla", valor: "7\" OLED" },
            { clave: "Bateria", valor: "4-9 horas" }
        ]
    },
    {
        id: 7,
        nombre: "JBL Wave Beam",
        categoria: "Accesorios",
        precio: 176.00,
        precioOriginal: 220.00,
        badge: "oferta",
        imagen: "oferta.jpg",
        descripcion: "Audifonos True Wireless Stereo intra-auditivos con Deep Bass Sound y hasta 32 horas de reproduccion.",
        specs: [
            { clave: "Bateria", valor: "32 horas" },
            { clave: "Conexion", valor: "Bluetooth 5.2" },
            { clave: "Resistencia", valor: "IP54" }
        ]
    },
    {
        id: 8,
        nombre: "AirPods Pro",
        categoria: "Accesorios",
        precio: 212.49,
        precioOriginal: 249.99,
        badge: "oferta",
        imagen: "AirProds Pro.jpg",
        descripcion: "Audifonos inalambricos con audio espacial personalizado y cancelacion activa de ruido.",
        specs: [
            { clave: "Bateria", valor: "6h + 30h estuche" },
            { clave: "ANC", valor: "Activa" },
            { clave: "Chip", valor: "H2" },
            { clave: "Audio", valor: "Espacial personalizado" }
        ]
    },
    {
        id: 9,
        nombre: "Logitech G502",
        categoria: "Accesorios",
        precio: 89.99,
        precioOriginal: null,
        badge: null,
        imagen: "mouse-gamer.jpg",
        descripcion: "Mouse gamer con sensor HERO 25K, 11 botones programables e iluminacion RGB personalizable.",
        specs: [
            { clave: "DPI", valor: "100 - 25,600" },
            { clave: "Botones", valor: "11 programables" },
            { clave: "Peso", valor: "121 g" }
        ]
    },
    {
        id: 10,
        nombre: "Hisense Televisor 55\"",
        categoria: "Tecnologia",
        precio: 649.99,
        precioOriginal: null,
        badge: "nuevo",
        imagen: "Hisense Televisor.jpg",
        descripcion: "Smart TV 55 pulgadas con resolucion 4K Ultra HD, HDR10+ y sistema operativo VIDAA.",
        specs: [
            { clave: "Pantalla", valor: "55\" 4K UHD" },
            { clave: "HDR", valor: "HDR10+" },
            { clave: "SO", valor: "VIDAA U6" }
        ]
    }
];

const DEMO_CATEGORIAS = [
    { id: 1, nombre: "Tecnologia", totalProductos: 6 },
    { id: 2, nombre: "Accesorios", totalProductos: 4 }
];

const DEMO_USUARIOS = [
    { id: 1, nombre: "Admin Principal", correo: "admin@ryctech.com", rol: "Administrador" },
    { id: 2, nombre: "Rodrigo Hurtado", correo: "rodrigo@ryctech.com", rol: "Empleado" }
];

// Credenciales validas para el login de demo
const DEMO_CREDENCIALES = [
    { correo: "admin@ryctech.com", password: "admin123", nombre: "Admin Principal", rol: "Administrador" },
    { correo: "rodrigo@ryctech.com", password: "empleado123", nombre: "Rodrigo Hurtado", rol: "Empleado" }
];
