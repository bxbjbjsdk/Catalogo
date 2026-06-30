

using Microsoft.Data.SqlClient;

public class ConexionDB
{
    // Cadena de conexion a SQL Server
    // Cambia "TU_PC\SQLEXPRESS" por el nombre de tu servidor
    // (el mismo que usas en tu formulario de ejemplo)
    private readonly string _cadenaConexion =
        @"Server=RODRIGO\SQLEXPRESS01;Database=PI_RYC;Trusted_Connection=True;TrustServerCertificate=True;";

    // Regresa una nueva conexion lista para usar
    // Se usa igual que en tu proyecto: using (var conexion = db.ObtenerConexion())
    public SqlConnection ObtenerConexion()
    {
        return new SqlConnection(_cadenaConexion);
    }
}
