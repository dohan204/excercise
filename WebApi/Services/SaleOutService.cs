using System.Data;
using Dapper;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.Data.SqlClient;
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
        using (var connection = dbSqlConnection.CreateConnection())
        {

            if (!await IsProductExists(saleOut.ProductId.ToString()))
            {
                throw new ArgumentException("Sản phẩm không tồn tại");
            }

            if(await ExistsCustomerPoNoAndProductIdAsync(saleOut.CustomerPoNo, saleOut.ProductId.ToString(), connection))
            {
                throw new ArgumentException("Mã khách và mã sản phẩm đã tồn tại");
            }
            decimal amount = saleOut.Quantity * saleOut.Price;
            decimal boxQuantity = (saleOut.QuantityPerBox > 0)
            ? Math.Ceiling(saleOut.Quantity / saleOut.QuantityPerBox)
            : 0;
            await connection.ExecuteAsync("spCreateSaleOut", new
            {
                saleOut.CustomerPoNo,
                saleOut.OrderDate,
                saleOut.CustomerName,
                saleOut.ProductId,
                saleOut.Quantity,
                saleOut.Price,
                amount,
                saleOut.QuantityPerBox,
                boxQuantity
            }, commandType: System.Data.CommandType.StoredProcedure);
        }
    }


    public async Task<IEnumerable<SaleOut>> GetSaleOutsAsync(string? fieldName, string? keyword)
    {
        using (var connection = dbSqlConnection.CreateConnection())
        {
            try
            {
                IEnumerable<SaleOut> saleOuts = null;
                if (keyword != null && fieldName != null)
                {
                    string sql = fieldName switch
                    {
                        "customerPoNo" => $"Select * from dbo.Saleout where CustomerPoNo like '%{keyword}%'",
                        "orderDate" => $"Select * from dbo.Saleout where OrderDate like '%{keyword}%'",
                        "customerName" => $"Select * from dbo.Saleout where CustomerName like '%{keyword}%'",
                        "quantity" => $"Select * from dbo.Saleout where quantity like '%{keyword}%'",
                        "price" => $"Select * from dbo.Saleout where Price like '%{keyword}%'",
                        "quantityPerBox" => $"Select * from dbo.Saleout where QuantityPerBox like '%{keyword}%'",
                        "boxQuantity" => $"Select * from dbo.Saleout where BoxQuantity like '%{keyword}%'",
                    };

                    saleOuts = await connection.QueryAsync<SaleOut>(sql);

                    return saleOuts;
                }

                saleOuts = await connection.QueryAsync<SaleOut>("Select * from dbo.Saleout");

                return saleOuts ?? [];
            }
            catch (Exception ex)
            {
                throw;
            }
        }
    }

    public async Task<SaleOut?> GetSaleOutByIdAsync(Guid id)
    {
        using (var connection = dbSqlConnection.CreateConnection())
        {
            return await connection.QuerySingleOrDefaultAsync<SaleOut>("select * from dbo.SaleOut where Id = @Id", new { Id = id });
        }
    }

    public async Task DeleteSaleOutAsync(Guid Id)
    {
        using (var connection = dbSqlConnection.CreateConnection())
        {
            await connection.ExecuteAsync("Delete from dbo.SaleOut where Id = @Id", new { Id = Id });
        }
    }

    private async Task<bool> IsProductExists(string Id)
    {
        using (var connection = dbSqlConnection.CreateConnection())
        {
            string sql = @"if exists (Select top(1) Id from dbo.MasterProduct where Id = @Id)
                            Select 1
                        else 
                            Select 0";
            return await connection.QueryFirstAsync<int>(sql, new { Id = Id }) > 0;
        }
    }

    private async Task<bool> ExistsCustomerPoNoAndProductIdAsync(string customerPono, string productid, IDbConnection connection)
    {
        return await connection.ExecuteScalarAsync<int>(@"
            If exists (Select CustomerPoNo, productId from dbo.Saleout where CustomerPoNo = @PoNo and productId = @productId)
                  Select 1
                else 
                    select 0
        ", new {PoNo = customerPono, productId = productid}) > 0;
    }
}