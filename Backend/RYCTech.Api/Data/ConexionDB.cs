

using Microsoft.Data.SqlClient;

public class ConexionDB
{
 
    private readonly string _cadenaConexion =
        @"Server=RODRIGO\SQLEXPRESS01;Database=PI_RYC;Trusted_Connection=True;TrustServerCertificate=True;";


    public SqlConnection ObtenerConexion()
    {
        return new SqlConnection(_cadenaConexion);
    }
}
