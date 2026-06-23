using Dapper;
using WebApi.Database;
using WebApi.Entities;

namespace WebApi.Services;


public class SaleOutService
{
    private readonly IDbSqlConnection dbSqlConnection;
    public SaleOutService(IDbSqlConnection dbSqlConnection)
    {
        this.dbSqlConnection = dbSqlConnection;
    }


    public async Task CreateSaleOutAsync(SaleOut saleOut)
    {
        using(var connection = dbSqlConnection.CreateConnection())
        {

            if(!await IsProductExists(saleOut.ProductId))
            {
                throw new ArgumentException("Sản phẩm không tồn tại");
            }
            await connection.ExecuteAsync("spCreateSaleOut", new
            {
                saleOut.CustomerPoNo,
                saleOut.OrderDate, 
                saleOut.CustomerName, 
                saleOut.ProductId,
                saleOut.Quantity,
                saleOut.Price, 
                saleOut.Amount, 
                saleOut.QuantityPerBox,
                saleOut.BoxQuantity 
            }, commandType: System.Data.CommandType.StoredProcedure);
        }
    }


    public async Task<IEnumerable<SaleOut>> GetSaleOutsAsync()
    {
        using(var connection = dbSqlConnection.CreateConnection())
        {
            return await connection.QueryAsync<SaleOut>("Select * from dbo.SaleOut where Id = @Id");
        }
    }

    public async Task<SaleOut?> GetSaleOutByIdAsync(Guid id)
    {
        using(var connection = dbSqlConnection.CreateConnection())
        {
            return await connection.QuerySingleOrDefaultAsync<SaleOut>("select * from dbo.SaleOut where Id = @Id", new {Id = id});
        }
    }

    public async Task DeleteSaleOutAsync(Guid Id)
    {
        using(var connection = dbSqlConnection.CreateConnection())
        {
            await connection.ExecuteAsync("Delete from dbo.SaleOut where Id = @Id", new {Id = Id});
        }
    }

    private async Task<bool> IsProductExists(string Id)
    {
        using(var connection = dbSqlConnection.CreateConnection())
        {
            string sql = @"if exists (Select top(1) Id from dbo.MasterProduct where Id = @Id
                            Select 1
                        else 
                            Select 0";
            return await connection.QueryFirstAsync(sql, new {Id = Id}) > 0;
        }
    }
}