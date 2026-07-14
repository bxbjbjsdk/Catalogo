// ================================================
// ProductosController.cs
// Version corregida - conexion se abre una sola vez
// ================================================

using Microsoft.Data.SqlClient;

public static class ProductosController
{
    public static void MapProductos(this WebApplication app)
    {
        app.MapGet("/api/productos",         ObtenerTodos);
        app.MapGet("/api/productos/{id}",    ObtenerPorId);
        app.MapPost("/api/productos",        Agregar);
        app.MapPut("/api/productos/{id}",    Editar);
        app.MapDelete("/api/productos/{id}", Eliminar);
    }

    static IResult ObtenerTodos(ConexionDB db)
    {
        try
        {
            var productos = new List<Producto>();
            using (var conexion = db.ObtenerConexion())
            {
                conexion.Open();
                string query = @"
                    SELECT p.Id, p.Nombre, p.Descripcion, p.Precio,
                           p.PrecioOriginal, p.Imagen, p.Badge,
                           c.Nombre AS Categoria, p.CategoriaId
                    FROM Productos p
                    INNER JOIN Categorias c ON p.CategoriaId = c.Id
                    WHERE p.Activo = 1
                    ORDER BY p.Id";
                using (var comando = new SqlCommand(query, conexion))
                using (var lector = comando.ExecuteReader())
                {
                    while (lector.Read())
                    {
                        productos.Add(new Producto
                        {
                            Id             = (int)lector["Id"],
                            Nombre         = lector["Nombre"].ToString()!,
                            Descripcion    = lector["Descripcion"].ToString()!,
                            Precio         = (decimal)lector["Precio"],
                            PrecioOriginal = lector["PrecioOriginal"] == DBNull.Value ? null : (decimal)lector["PrecioOriginal"],
                            Imagen         = lector["Imagen"].ToString()!,
                            Badge          = lector["Badge"] == DBNull.Value ? null : lector["Badge"].ToString(),
                            Categoria      = lector["Categoria"].ToString()!,
                            CategoriaId    = (int)lector["CategoriaId"]
                        });
                    }
                }
            }
            return Results.Ok(productos);
        }
        catch (Exception ex) { return Results.Problem($"Error: {ex.Message}"); }
    }

    static IResult ObtenerPorId(int id, ConexionDB db)
    {
        try
        {
            Producto? producto = null;
            using (var conexion = db.ObtenerConexion())
            {
                conexion.Open();
                string queryProducto = @"
                    SELECT p.Id, p.Nombre, p.Descripcion, p.Precio,
                           p.PrecioOriginal, p.Imagen, p.Badge,
                           c.Nombre AS Categoria, p.CategoriaId
                    FROM Productos p
                    INNER JOIN Categorias c ON p.CategoriaId = c.Id
                    WHERE p.Id = @Id AND p.Activo = 1";
                using (var comando = new SqlCommand(queryProducto, conexion))
                {
                    comando.Parameters.AddWithValue("@Id", id);
                    using (var lector = comando.ExecuteReader())
                    {
                        if (lector.Read())
                        {
                            producto = new Producto
                            {
                                Id             = (int)lector["Id"],
                                Nombre         = lector["Nombre"].ToString()!,
                                Descripcion    = lector["Descripcion"].ToString()!,
                                Precio         = (decimal)lector["Precio"],
                                PrecioOriginal = lector["PrecioOriginal"] == DBNull.Value ? null : (decimal)lector["PrecioOriginal"],
                                Imagen         = lector["Imagen"].ToString()!,
                                Badge          = lector["Badge"] == DBNull.Value ? null : lector["Badge"].ToString(),
                                Categoria      = lector["Categoria"].ToString()!,
                                CategoriaId    = (int)lector["CategoriaId"]
                            };
                        }
                    }
                }
                if (producto == null) return Results.NotFound(new { mensaje = "Producto no encontrado." });
                string querySpecs = "SELECT Clave, Valor FROM ProductoEspecificaciones WHERE ProductoId = @Id";
                using (var comando = new SqlCommand(querySpecs, conexion))
                {
                    comando.Parameters.AddWithValue("@Id", id);
                    using (var lector = comando.ExecuteReader())
                    {
                        while (lector.Read())
                            producto.Specs.Add(new Especificacion { Clave = lector["Clave"].ToString()!, Valor = lector["Valor"].ToString()! });
                    }
                }
            }
            return Results.Ok(producto);
        }
        catch (Exception ex) { return Results.Problem($"Error: {ex.Message}"); }
    }

    static IResult Agregar(ProductoDTO dto, ConexionDB db)
    {
        try
        {
            using (var conexion = db.ObtenerConexion())
            {
                conexion.Open();
                int categoriaId = 0;
                using (var cmd = new SqlCommand("SELECT Id FROM Categorias WHERE Nombre = @Nombre", conexion))
                {
                    cmd.Parameters.AddWithValue("@Nombre", dto.Categoria);
                    var res = cmd.ExecuteScalar();
                    if (res == null) return Results.BadRequest(new { mensaje = "La categoria no existe." });
                    categoriaId = (int)res;
                }
                string query = @"
                    INSERT INTO Productos (Nombre, Descripcion, Precio, PrecioOriginal, Badge, Imagen, CategoriaId)
                    VALUES (@Nombre, @Descripcion, @Precio, @PrecioOriginal, @Badge, @Imagen, @CategoriaId);
                    SELECT SCOPE_IDENTITY();";
                int nuevoId = 0;
                using (var comando = new SqlCommand(query, conexion))
                {
                    comando.Parameters.AddWithValue("@Nombre",         dto.Nombre);
                    comando.Parameters.AddWithValue("@Descripcion",    dto.Descripcion);
                    comando.Parameters.AddWithValue("@Precio",         dto.Precio);
                    comando.Parameters.AddWithValue("@PrecioOriginal", (object?)dto.PrecioOriginal ?? DBNull.Value);
                    comando.Parameters.AddWithValue("@Badge",          (object?)dto.Badge ?? DBNull.Value);
                    comando.Parameters.AddWithValue("@Imagen",         dto.Imagen);
                    comando.Parameters.AddWithValue("@CategoriaId",    categoriaId);
                    var resId = comando.ExecuteScalar();
                    if (resId != null) nuevoId = Convert.ToInt32(resId);
                }

                // Guardar especificaciones tecnicas
                if (dto.Specs != null && dto.Specs.Count > 0 && nuevoId > 0)
                {
                    foreach (var spec in dto.Specs)
                    {
                        using (var cmdSpec = new SqlCommand(
                            "INSERT INTO ProductoEspecificaciones (ProductoId, Clave, Valor) VALUES (@ProductoId, @Clave, @Valor)",
                            conexion))
                        {
                            cmdSpec.Parameters.AddWithValue("@ProductoId", nuevoId);
                            cmdSpec.Parameters.AddWithValue("@Clave",      spec.Clave);
                            cmdSpec.Parameters.AddWithValue("@Valor",      spec.Valor);
                            cmdSpec.ExecuteNonQuery();
                        }
                    }
                }
            }
            return Results.Ok(new { mensaje = "Producto agregado correctamente." });
        }
        catch (Exception ex) { return Results.Problem($"Error: {ex.Message}"); }
    }

    static IResult Editar(int id, ProductoDTO dto, ConexionDB db)
    {
        try
        {
            using (var conexion = db.ObtenerConexion())
            {
                conexion.Open();
                int categoriaId = 0;
                using (var cmd = new SqlCommand("SELECT Id FROM Categorias WHERE Nombre = @Nombre", conexion))
                {
                    cmd.Parameters.AddWithValue("@Nombre", dto.Categoria);
                    var res = cmd.ExecuteScalar();
                    if (res == null) return Results.BadRequest(new { mensaje = "La categoria no existe." });
                    categoriaId = (int)res;
                }
                string query = @"
                    UPDATE Productos SET
                        Nombre         = @Nombre,
                        Descripcion    = @Descripcion,
                        Precio         = @Precio,
                        PrecioOriginal = @PrecioOriginal,
                        Badge          = @Badge,
                        Imagen         = @Imagen,
                        CategoriaId    = @CategoriaId
                    WHERE Id = @Id";
                using (var comando = new SqlCommand(query, conexion))
                {
                    comando.Parameters.AddWithValue("@Nombre",         dto.Nombre);
                    comando.Parameters.AddWithValue("@Descripcion",    dto.Descripcion);
                    comando.Parameters.AddWithValue("@Precio",         dto.Precio);
                    comando.Parameters.AddWithValue("@PrecioOriginal", (object?)dto.PrecioOriginal ?? DBNull.Value);
                    comando.Parameters.AddWithValue("@Badge",          (object?)dto.Badge ?? DBNull.Value);
                    comando.Parameters.AddWithValue("@Imagen",         dto.Imagen);
                    comando.Parameters.AddWithValue("@CategoriaId",    categoriaId);
                    comando.Parameters.AddWithValue("@Id",             id);
                    int filas = comando.ExecuteNonQuery();
                    if (filas == 0) return Results.NotFound(new { mensaje = "Producto no encontrado." });
                }

                // Actualizar especificaciones: borrar las viejas e insertar las nuevas
                if (dto.Specs != null)
                {
                    using (var cmdDel = new SqlCommand(
                        "DELETE FROM ProductoEspecificaciones WHERE ProductoId = @Id", conexion))
                    {
                        cmdDel.Parameters.AddWithValue("@Id", id);
                        cmdDel.ExecuteNonQuery();
                    }

                    foreach (var spec in dto.Specs)
                    {
                        using (var cmdSpec = new SqlCommand(
                            "INSERT INTO ProductoEspecificaciones (ProductoId, Clave, Valor) VALUES (@ProductoId, @Clave, @Valor)",
                            conexion))
                        {
                            cmdSpec.Parameters.AddWithValue("@ProductoId", id);
                            cmdSpec.Parameters.AddWithValue("@Clave",      spec.Clave);
                            cmdSpec.Parameters.AddWithValue("@Valor",      spec.Valor);
                            cmdSpec.ExecuteNonQuery();
                        }
                    }
                }
            }
            return Results.Ok(new { mensaje = "Producto actualizado correctamente." });
        }
        catch (Exception ex) { return Results.Problem($"Error: {ex.Message}"); }
    }

    static IResult Eliminar(int id, ConexionDB db)
    {
        try
        {
            using (var conexion = db.ObtenerConexion())
            {
                conexion.Open();
                using (var comando = new SqlCommand("DELETE FROM Productos WHERE Id = @Id", conexion))
                {
                    comando.Parameters.AddWithValue("@Id", id);
                    int filas = comando.ExecuteNonQuery();
                    if (filas == 0) return Results.NotFound(new { mensaje = "Producto no encontrado." });
                }
            }
            return Results.Ok(new { mensaje = "Producto eliminado correctamente." });
        }
        catch (Exception ex) { return Results.Problem($"Error: {ex.Message}"); }
    }
}
