// ================================================
// UsuariosController.cs
// Maneja login, CRUD de empleados
// ================================================

using Microsoft.Data.SqlClient;
using System.Security.Cryptography;
using System.Text;

public static class UsuariosController
{
    public static void MapUsuarios(this WebApplication app)
    {
        app.MapPost("/api/usuarios/login",   Login);
        app.MapGet("/api/usuarios",          ObtenerTodos);
        app.MapGet("/api/usuarios/{id}",     ObtenerPorId);
        app.MapPost("/api/usuarios",         Agregar);
        app.MapPut("/api/usuarios/{id}",     Editar);
        app.MapDelete("/api/usuarios/{id}",  Eliminar);
    }

    // ------------------------------------------------
    // POST /api/usuarios/login
    // Valida las credenciales del empleado
    // Igual que en tu formulario: recibe DTO, consulta DB, regresa resultado
    // ------------------------------------------------
    static IResult Login(LoginDTO dto, ConexionDB db)
    {
        try
        {
            // Convertir la contrasena a hash SHA-256 antes de comparar
            string passwordHash = HashPassword(dto.Password);

            using (var conexion = db.ObtenerConexion())
            {
                string query = @"
                    SELECT u.Id, u.Nombre, u.Correo, r.Nombre AS Rol
                    FROM Usuarios u
                    INNER JOIN Roles r ON u.RolId = r.Id
                    WHERE u.Correo = @Correo
                      AND u.PasswordHash = @PasswordHash
                      AND u.Activo = 1";

                using (var comando = new SqlCommand(query, conexion))
                {
                    comando.Parameters.AddWithValue("@Correo",       dto.Correo);
                    comando.Parameters.AddWithValue("@PasswordHash", passwordHash);

                    conexion.Open();

                    using (var lector = comando.ExecuteReader())
                    {
                        if (lector.Read())
                        {
                            // Credenciales correctas: regresar datos del usuario
                            var usuario = new
                            {
                                id     = (int)lector["Id"],
                                nombre = lector["Nombre"].ToString(),
                                correo = lector["Correo"].ToString(),
                                rol    = lector["Rol"].ToString()
                            };
                            return Results.Ok(usuario);
                        }
                        else
                        {
                            // Credenciales incorrectas
                            return Results.Unauthorized();
                        }
                    }
                }
            }
        }
        catch (Exception ex)
        {
            return Results.Problem($"Error en el backend: {ex.Message}");
        }
    }

    // ------------------------------------------------
    // GET /api/usuarios
    // Regresa todos los empleados (sin contrasenas)
    // ------------------------------------------------
    static IResult ObtenerTodos(ConexionDB db)
    {
        try
        {
            var usuarios = new List<Usuario>();

            using (var conexion = db.ObtenerConexion())
            {
                string query = @"
                    SELECT u.Id, u.Nombre, u.Correo, r.Nombre AS Rol
                    FROM Usuarios u
                    INNER JOIN Roles r ON u.RolId = r.Id
                    WHERE u.Activo = 1
                    ORDER BY u.Id";

                using (var comando = new SqlCommand(query, conexion))
                {
                    conexion.Open();
                    using (var lector = comando.ExecuteReader())
                    {
                        while (lector.Read())
                        {
                            usuarios.Add(new Usuario
                            {
                                Id     = (int)lector["Id"],
                                Nombre = lector["Nombre"].ToString()!,
                                Correo = lector["Correo"].ToString()!,
                                Rol    = lector["Rol"].ToString()!
                            });
                        }
                    }
                }
            }

            return Results.Ok(usuarios);
        }
        catch (Exception ex)
        {
            return Results.Problem($"Error en el backend: {ex.Message}");
        }
    }

    // ------------------------------------------------
    // GET /api/usuarios/{id}
    // ------------------------------------------------
    static IResult ObtenerPorId(int id, ConexionDB db)
    {
        try
        {
            using (var conexion = db.ObtenerConexion())
            {
                string query = @"
                    SELECT u.Id, u.Nombre, u.Correo, r.Nombre AS Rol
                    FROM Usuarios u
                    INNER JOIN Roles r ON u.RolId = r.Id
                    WHERE u.Id = @Id AND u.Activo = 1";

                using (var comando = new SqlCommand(query, conexion))
                {
                    comando.Parameters.AddWithValue("@Id", id);
                    conexion.Open();

                    using (var lector = comando.ExecuteReader())
                    {
                        if (lector.Read())
                        {
                            return Results.Ok(new Usuario
                            {
                                Id     = (int)lector["Id"],
                                Nombre = lector["Nombre"].ToString()!,
                                Correo = lector["Correo"].ToString()!,
                                Rol    = lector["Rol"].ToString()!
                            });
                        }
                    }
                }
            }

            return Results.NotFound(new { mensaje = "Usuario no encontrado." });
        }
        catch (Exception ex)
        {
            return Results.Problem($"Error en el backend: {ex.Message}");
        }
    }

    // ------------------------------------------------
    // POST /api/usuarios
    // Agrega un empleado nuevo
    // ------------------------------------------------
    static IResult Agregar(UsuarioDTO dto, ConexionDB db)
    {
        try
        {
            using (var conexion = db.ObtenerConexion())
            {
                // Buscar el id del rol
                int rolId = 0;
                string queryRol = "SELECT Id FROM Roles WHERE Nombre = @Nombre";
                using (var cmd = new SqlCommand(queryRol, conexion))
                {
                    cmd.Parameters.AddWithValue("@Nombre", dto.Rol);
                    conexion.Open();
                    var res = cmd.ExecuteScalar();
                    if (res == null) return Results.BadRequest(new { mensaje = "Rol no valido." });
                    rolId = (int)res;
                }

                string query = @"
                    INSERT INTO Usuarios (Nombre, Correo, PasswordHash, RolId)
                    VALUES (@Nombre, @Correo, @PasswordHash, @RolId)";

                using (var comando = new SqlCommand(query, conexion))
                {
                    comando.Parameters.AddWithValue("@Nombre",       dto.Nombre);
                    comando.Parameters.AddWithValue("@Correo",       dto.Correo);
                    comando.Parameters.AddWithValue("@PasswordHash", HashPassword(dto.Password));
                    comando.Parameters.AddWithValue("@RolId",        rolId);

                    comando.ExecuteNonQuery();
                }
            }

            return Results.Ok(new { mensaje = "Empleado agregado correctamente." });
        }
        catch (Exception ex)
        {
            return Results.Problem($"Error en el backend: {ex.Message}");
        }
    }

    // ------------------------------------------------
    // PUT /api/usuarios/{id}
    // ------------------------------------------------
    static IResult Editar(int id, UsuarioDTO dto, ConexionDB db)
    {
        try
        {
            using (var conexion = db.ObtenerConexion())
            {
                int rolId = 0;
                string queryRol = "SELECT Id FROM Roles WHERE Nombre = @Nombre";
                using (var cmd = new SqlCommand(queryRol, conexion))
                {
                    cmd.Parameters.AddWithValue("@Nombre", dto.Rol);
                    conexion.Open();
                    var res = cmd.ExecuteScalar();
                    if (res == null) return Results.BadRequest(new { mensaje = "Rol no valido." });
                    rolId = (int)res;
                }

                // Si mandan password, actualizarla. Si no, dejarla igual.
                string query;
                SqlCommand comando;

                if (!string.IsNullOrEmpty(dto.Password))
                {
                    query = @"
                        UPDATE Usuarios
                        SET Nombre = @Nombre, Correo = @Correo,
                            PasswordHash = @PasswordHash, RolId = @RolId
                        WHERE Id = @Id";

                    comando = new SqlCommand(query, conexion);
                    comando.Parameters.AddWithValue("@PasswordHash", HashPassword(dto.Password));
                }
                else
                {
                    query = @"
                        UPDATE Usuarios
                        SET Nombre = @Nombre, Correo = @Correo, RolId = @RolId
                        WHERE Id = @Id";

                    comando = new SqlCommand(query, conexion);
                }

                comando.Parameters.AddWithValue("@Nombre", dto.Nombre);
                comando.Parameters.AddWithValue("@Correo", dto.Correo);
                comando.Parameters.AddWithValue("@RolId",  rolId);
                comando.Parameters.AddWithValue("@Id",     id);

                int filas = comando.ExecuteNonQuery();
                comando.Dispose();

                if (filas == 0)
                    return Results.NotFound(new { mensaje = "Usuario no encontrado." });
            }

            return Results.Ok(new { mensaje = "Empleado actualizado correctamente." });
        }
        catch (Exception ex)
        {
            return Results.Problem($"Error en el backend: {ex.Message}");
        }
    }

    // ------------------------------------------------
    // DELETE /api/usuarios/{id}
    // ------------------------------------------------
    static IResult Eliminar(int id, ConexionDB db)
    {
        try
        {
            using (var conexion = db.ObtenerConexion())
            {
                string query = "UPDATE Usuarios SET Activo = 0 WHERE Id = @Id";

                using (var comando = new SqlCommand(query, conexion))
                {
                    comando.Parameters.AddWithValue("@Id", id);
                    conexion.Open();

                    int filas = comando.ExecuteNonQuery();
                    if (filas == 0)
                        return Results.NotFound(new { mensaje = "Usuario no encontrado." });
                }
            }

            return Results.Ok(new { mensaje = "Empleado eliminado correctamente." });
        }
        catch (Exception ex)
        {
            return Results.Problem($"Error en el backend: {ex.Message}");
        }
    }

    // ------------------------------------------------
    // HASH DE CONTRASENA con SHA-256
    // Nunca guardamos contrasenas en texto plano
    // ------------------------------------------------
    public static string HashPassword(string password)
    {
        using (var sha256 = SHA256.Create())
        {
            byte[] bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
            // Convertir los bytes a una cadena hexadecimal
            return BitConverter.ToString(bytes).Replace("-", "").ToLower();
        }
    }
}
