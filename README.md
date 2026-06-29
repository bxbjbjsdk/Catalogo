# RYC Tech v3 — Instrucciones

## Que hay de nuevo en esta version

- Sin errores de URL_BACKEND duplicada
- Subida de imagenes desde el formulario (el empleado selecciona el archivo)
- Campo de Badge (Nuevo / Oferta) en el formulario de productos
- Campo de Precio Original para mostrar descuentos
- Configurado para correr en red local (192.168.100.16)

---

## Estructura

```
RYCTech_v3/
├── Frontend/          <- Abrir index.html en el navegador
│   ├── css/
│   ├── js/
│   │   ├── utils.js      <- URL del backend y funciones compartidas
│   │   ├── login.js      <- Inicio de sesion
│   │   ├── productos.js  <- Catalogo publico
│   │   └── admin.js      <- Panel de administracion
│   └── imagenes/
└── Backend/
    └── RYCTech.Api/
        ├── Controllers/
        ├── Models/
        ├── Data/
        ├── Program.cs
        └── database.sql
```

---

## Pasos para correr el proyecto

### Paso 1 — Base de datos
1. Abre SQL Server Management Studio
2. Abre `Backend/RYCTech.Api/database.sql`
3. Presiona F5 para ejecutar

### Paso 2 — Cadena de conexion
Abre `Backend/RYCTech.Api/Data/ConexionDB.cs` y cambia:
```
Server=TU_PC\SQLEXPRESS  →  Server=RODRIGO\SQLEXPRESS01
```

### Paso 3 — Correr el backend
```
cd Backend\RYCTech.Api
dotnet run
```
Debe aparecer: `Now listening on: http://0.0.0.0:5000`

### Paso 4 — Abrir el frontend
Abre `Frontend/index.html` en el navegador o con Live Server.

---

## Red local

El backend corre en `http://0.0.0.0:5000` lo que significa que
acepta conexiones de cualquier computadora en la misma red WiFi.

Las otras computadoras abren el frontend y el JS se conecta a:
`http://192.168.100.16:5000/api`

Si tu IP cambia, actualiza esa linea en `Frontend/js/utils.js`.

---

## Credenciales de prueba

| Correo                  | Contrasena   | Rol           |
|-------------------------|--------------|---------------|
| admin@ryctech.com       | admin123     | Administrador |
| carlos@ryctech.com      | empleado123  | Empleado      |

---

## Como agregar un producto con imagen

1. Inicia sesion en el panel admin
2. Da clic en "Agregar producto"
3. Llena el formulario
4. En el campo "Imagen del producto" da clic en "Seleccionar archivo"
5. Elige una imagen desde tu computadora
6. Aparecera una vista previa de la imagen
7. Da clic en "Guardar producto"

La imagen se sube automaticamente al backend y se guarda en la
carpeta `Frontend/imagenes/` con un nombre unico.

---

## Si algo no funciona

**Los productos no cargan:**
- Verifica que el backend este corriendo con `dotnet run`
- Abre F12 en el navegador y revisa la consola

**Error al subir imagen:**
- Verifica que la carpeta `Frontend/imagenes/` exista
- Verifica que el backend tenga permisos de escritura en esa carpeta

**Las otras computadoras no pueden conectarse:**
- Verifica que esten en la misma red WiFi
- Verifica que el firewall de Windows no este bloqueando el puerto 5000
  Para abrir el puerto: Panel de control → Firewall → Reglas de entrada → Puerto 5000
