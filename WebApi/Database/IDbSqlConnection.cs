using System.Data;
using Microsoft.Data.SqlClient;

namespace WebApi.Database;


public interface IDbSqlConnection
{
    IDbConnection CreateConnection();
}


public class DbSqlConnection : IDbSqlConnection
{
    private readonly string _connectionString;
    public DbSqlConnection(IConfiguration configuration)
    {
        _connectionString = 
            configuration.GetConnectionString("DefaultConnection")
                ?? throw new ArgumentNullException(nameof(_connectionString), "Chuỗi kết nối không tồn tại hoặc null");
    }

    public IDbConnection CreateConnection()
    {
        return new SqlConnection(_connectionString);
    }
}