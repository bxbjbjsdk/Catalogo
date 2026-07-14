
using Microsoft.Data.SqlClient;

public static class CategoriasController
{
    public static void MapCategorias(this WebApplication app)
    {
        app.MapGet("/api/categorias",          ObtenerTodas);
        app.MapPost("/api/categorias",         Agregar);
        app.MapDelete("/api/categorias/{id}",  Eliminar);
    }

    static IResult ObtenerTodas(ConexionDB db)
    {
        try
        {
            var categorias = new List<Categoria>();

            using (var conexion = db.ObtenerConexion())
            {
                string query = @"
                    SELECT c.Id, c.Nombre,
                           COUNT(p.Id) AS TotalProductos
                    FROM Categorias c
                    LEFT JOIN Productos p ON p.CategoriaId = c.Id AND p.Activo = 1
                    WHERE c.Activa = 1
                    GROUP BY c.Id, c.Nombre
                    ORDER BY c.Nombre";

                using (var comando = new SqlCommand(query, conexion))
                {
                    conexion.Open();
                    using (var lector = comando.ExecuteReader())
                    {
                        while (lector.Read())
                        {
                            categorias.Add(new Categoria
                            {
                                Id             = (int)lector["Id"],
                                Nombre         = lector["Nombre"].ToString()!,
                                TotalProductos = (int)lector["TotalProductos"]
                            });
                        }
                    }
                }
            }

            return Results.Ok(categorias);
        }
        catch (Exception ex)
        {
            return Results.Problem($"Error en el backend: {ex.Message}");
        }
    }

    static IResult Agregar(CategoriaDTO dto, ConexionDB db)
    {
        try
        {
            using (var conexion = db.ObtenerConexion())
            {
                string query = "INSERT INTO Categorias (Nombre) VALUES (@Nombre)";

                using (var comando = new SqlCommand(query, conexion))
                {
                    comando.Parameters.AddWithValue("@Nombre", dto.Nombre);
                    conexion.Open();
                    comando.ExecuteNonQuery();
                }
            }

            return Results.Ok(new { mensaje = "Categoria agregada correctamente." });
        }
        catch (Exception ex)
        {
            return Results.Problem($"Error en el backend: {ex.Message}");
        }
    }

    static IResult Eliminar(int id, ConexionDB db)
    {
        try
        {
            using (var conexion = db.ObtenerConexion())
            {
                // Verificar que no tenga productos
                string queryVerificar = "SELECT COUNT(*) FROM Productos WHERE CategoriaId = @Id";
                using (var cmdV = new SqlCommand(queryVerificar, conexion))
                {
                    cmdV.Parameters.AddWithValue("@Id", id);
                    int total = (int)cmdV.ExecuteScalar();
                    if (total > 0)
                        return Results.BadRequest(new { mensaje = "No se puede eliminar porque tiene productos asociados." });
                }

                // Si no tiene productos eliminar
                string query = "DELETE FROM Categorias WHERE Id = @Id";
    

                using (var comando = new SqlCommand(query, conexion))
                {
                    comando.Parameters.AddWithValue("@Id", id);
                    conexion.Open();
                    int filas = comando.ExecuteNonQuery();
                    if (filas == 0) return Results.NotFound(new { mensaje = "Categoria no encontrada." });
                }
            }

            return Results.Ok(new { mensaje = "Categoria eliminada correctamente." });
        }
        catch (Exception ex)
        {
            return Results.Problem($"Error en el backend: {ex.Message}");
        }
    }
}

// ================================================
// EstadisticasController.cs
// Regresa los conteos para las tarjetas del admin
// ================================================
public static class EstadisticasController
{
    public static void MapEstadisticas(this WebApplication app)
    {
        app.MapGet("/api/estadisticas", Obtener);
    }

    static IResult Obtener(ConexionDB db)
    {
        try
        {
            var stats = new Estadisticas();

            using (var conexion = db.ObtenerConexion())
            {
                string query = @"
                    SELECT
                        (SELECT COUNT(*) FROM Productos  WHERE Activo = 1)          AS TotalProductos,
                        (SELECT COUNT(*) FROM Categorias WHERE Activa = 1)          AS TotalCategorias,
                        (SELECT COUNT(*) FROM Usuarios   WHERE Activo = 1)          AS TotalUsuarios,
                        (SELECT COUNT(*) FROM Productos  WHERE Badge = 'oferta'
                                                           AND Activo = 1)          AS EnOferta";

                using (var comando = new SqlCommand(query, conexion))
                {
                    conexion.Open();
                    using (var lector = comando.ExecuteReader())
                    {
                        if (lector.Read())
                        {
                            stats.TotalProductos  = (int)lector["TotalProductos"];
                            stats.TotalCategorias = (int)lector["TotalCategorias"];
                            stats.TotalUsuarios   = (int)lector["TotalUsuarios"];
                            stats.EnOferta        = (int)lector["EnOferta"];
                        }
                    }
                }
            }

            return Results.Ok(stats);
        }
        catch (Exception ex)
        {
            return Results.Problem($"Error en el backend: {ex.Message}");
        }
    }
}
