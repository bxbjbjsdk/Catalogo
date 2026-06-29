// ================================================
// ImagenesController.cs
// Permite que los empleados suban imagenes
// desde el formulario sin tocar ningun codigo.
// La imagen se guarda en la carpeta Frontend/imagenes/
// ================================================

public static class ImagenesController
{
    public static void MapImagenes(this WebApplication app)
    {
        // POST /api/imagenes/subir — recibe la imagen y la guarda
        app.MapPost("/api/imagenes/subir", SubirImagen);
    }

    static async Task<IResult> SubirImagen(HttpRequest request)
    {
        try
        {
            // Verificar que venga un archivo
            if (!request.HasFormContentType)
                return Results.BadRequest(new { mensaje = "No se recibio ningun archivo." });

            var form   = await request.ReadFormAsync();
            var imagen = form.Files.GetFile("imagen");

            if (imagen == null || imagen.Length == 0)
                return Results.BadRequest(new { mensaje = "El archivo esta vacio." });

            // Solo permitir imagenes
            var extensionesPermitidas = new[] { ".jpg", ".jpeg", ".png", ".webp", ".gif" };
            var extension = Path.GetExtension(imagen.FileName).ToLower();

            if (!extensionesPermitidas.Contains(extension))
                return Results.BadRequest(new { mensaje = "Solo se permiten imagenes (.jpg, .png, .webp)." });

            // Crear un nombre unico para evitar que dos imagenes se pisen
            // Ejemplo: samsung-galaxy_20250628143022.jpg
            var nombreLimpio  = Path.GetFileNameWithoutExtension(imagen.FileName)
                                    .Replace(" ", "-")
                                    .ToLower();
            var timestamp     = DateTime.Now.ToString("yyyyMMddHHmmss");
            var nombreArchivo = $"{nombreLimpio}_{timestamp}{extension}";

            // Ruta donde se guarda la imagen
            // Busca la carpeta Frontend/imagenes/ relativa al backend
            var carpetaImagenes = Path.Combine(
                Directory.GetCurrentDirectory(),
                "..", "..", "Frontend", "imagenes"
            );

            // Si la carpeta no existe, crearla
            if (!Directory.Exists(carpetaImagenes))
                Directory.CreateDirectory(carpetaImagenes);

            var rutaCompleta = Path.Combine(carpetaImagenes, nombreArchivo);

            // Guardar el archivo
            using (var stream = new FileStream(rutaCompleta, FileMode.Create))
            {
                await imagen.CopyToAsync(stream);
            }

            // Regresar el nombre del archivo para que el frontend lo use
            return Results.Ok(new { nombreArchivo = nombreArchivo });
        }
        catch (Exception ex)
        {
            return Results.Problem($"Error al subir la imagen: {ex.Message}");
        }
    }
}
