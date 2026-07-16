// ================================================
// Models.cs
// Clases que representan los datos del sistema.
// ================================================

public class Producto
{
    public int      Id             { get; set; }
    public string   Nombre         { get; set; } = "";
    public string   Descripcion    { get; set; } = "";
    public decimal  Precio         { get; set; }
    public decimal? PrecioOriginal { get; set; }  // null si no esta en oferta
    public string   Imagen         { get; set; } = "";
    public string?  Badge          { get; set; }  // "nuevo", "oferta" o null
    public string   Categoria      { get; set; } = "";
    public int      CategoriaId    { get; set; }
    public bool     Activo         { get; set; } = true;
    public List<Especificacion> Specs { get; set; } = new();
}

public class Especificacion
{
    public int    Id         { get; set; }
    public int    ProductoId { get; set; }
    public string Clave      { get; set; } = "";
    public string Valor      { get; set; } = "";
}

public class Categoria
{
    public int    Id             { get; set; }
    public string Nombre         { get; set; } = "";
    public int    TotalProductos { get; set; }
}

public class Usuario
{
    public int    Id           { get; set; }
    public string Nombre       { get; set; } = "";
    public string Correo       { get; set; } = "";
    public string Rol          { get; set; } = "";
    public bool   EsPrincipal  { get; set; } = false; // true = administrador principal, no se puede eliminar
}


public record EspecificacionDTO(string Clave, string Valor);

public record ProductoDTO(
    string   Nombre,
    string   Categoria,
    decimal  Precio,
    decimal? PrecioOriginal,
    string?  Badge,
    string   Descripcion,
    string   Imagen,
    List<EspecificacionDTO>? Specs
);

public record LoginDTO(
    string Correo,
    string Password
);

public record UsuarioDTO(
    string Nombre,
    string Correo,
    string Rol,
    string Password
);

public record CategoriaDTO(string Nombre);

public class Estadisticas
{
    public int TotalProductos  { get; set; }
    public int TotalCategorias { get; set; }
    public int TotalUsuarios   { get; set; }
    public int EnOferta        { get; set; }
}
