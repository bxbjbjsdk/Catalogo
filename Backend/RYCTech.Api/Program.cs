// ================================================
// Program.cs
// Punto de entrada del backend.
// Configurado para correr en red local (192.168.100.16)
// ================================================

var builder = WebApplication.CreateBuilder(args);

// Registrar la conexion a la base de datos
builder.Services.AddSingleton<ConexionDB>();

// Habilitar CORS para que el frontend pueda llamar al backend
// desde cualquier computadora en la red
builder.Services.AddCors();

var app = builder.Build();

// Permitir peticiones desde cualquier origen en la red local
app.UseCors(opciones =>
    opciones.AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader()
);

// Registrar todos los endpoints
app.MapProductos();
app.MapUsuarios();
app.MapCategorias();
app.MapEstadisticas();
app.MapImagenes();

// Correr en todas las interfaces de red para que otras
// computadoras en la misma red puedan conectarse
// Tu IP en la red es: 192.168.100.16
app.Run("http://0.0.0.0:5000");
