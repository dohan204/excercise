using System.Data;
using Dapper;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.Data.SqlClient;
using WebApi.Database;
using WebApi.Dtos;
using WebApi.Entities;
using WebApi.Exceptions;

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
                throw new NotFoundException("Sản phẩm không tồn tại");
            }

            if(await ExistsCustomerPoNoAndProductIdAsync(saleOut.CustomerPoNo, saleOut.ProductId.ToString(), connection))
            {
                throw new ConflictException("Mã khách và mã sản phẩm đã Có trên hệ thống");
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


    public async Task<IEnumerable<SaleOutDto>> GetSaleOutsAsync(string? fieldName, string? keyword)
    {
        using (var connection = dbSqlConnection.CreateConnection())
        {
            try
            {
                string sql = "";
                IEnumerable<SaleOutDto> saleOuts = null;
                if (keyword != null && fieldName != null)
                {
                    sql = fieldName switch
                    {
                        "customerPoNo"   => $"Select S.*, m.ProductName, m.Unit from dbo.Saleout S inner join MasterProduct m on S.ProductId = m.Id where S.CustomerPoNo like '%{keyword}%'",
                        "orderDate"      => $"Select S.*, m.ProductName, m.Unit from dbo.Saleout S inner join MasterProduct m on S.ProductId = m.Id where S.OrderDate like '%{keyword}%'",
                        "customerName"   => $"Select S.*, m.ProductName, m.Unit from dbo.Saleout S inner join MasterProduct m on S.ProductId = m.Id where S.CustomerName like '%{keyword}%'",
                        "quantity"       => $"Select S.*, m.ProductName, m.Unit from dbo.Saleout S inner join MasterProduct m on S.ProductId = m.Id where S.Quantity like '%{keyword}%'",
                        "price"          => $"Select S.*, m.ProductName, m.Unit from dbo.Saleout S inner join MasterProduct m on S.ProductId = m.Id where S.Price like '%{keyword}%'",
                        "quantityPerBox" => $"Select S.*, m.ProductName, m.Unit from dbo.Saleout S inner join MasterProduct m on S.ProductId = m.Id where S.QuantityPerBox like '%{keyword}%'",
                        "boxQuantity"    => $"Select S.*, m.ProductName, m.Unit from dbo.Saleout S inner join MasterProduct m on S.ProductId = m.Id where S.BoxQuantity like '%{keyword}%'",

                    };

                    saleOuts = await connection.QueryAsync<SaleOutDto>(sql);

                    return saleOuts;
                }
                sql = "Select S.*, m.ProductName, m.Unit from dbo.Saleout S inner join MasterProduct m on S.ProductId = m.Id";
                saleOuts = await connection.QueryAsync<SaleOutDto, MasterProduct, SaleOutDto>(sql, (sale, prd) =>
                {
                    sale.ProductName = prd.ProductName!;
                    sale.Unit = prd.Unit!;

                    return sale;
                }, splitOn: "ProductName");

                return saleOuts ?? [];
            }
            catch (Exception ex)
            {
                throw;
            }
        }
    }

    public async Task<SaleOutDto?> GetSaleOutByIdAsync(Guid id)
    {
        using (var connection = dbSqlConnection.CreateConnection())
        {
            return await connection.QuerySingleOrDefaultAsync<SaleOutDto>(@"select s.*, m.ProductName, m.Unit from dbo.SaleOut s 
                            inner join dbo.MasterProduct m 
                        on s.ProductId = m.Id where s.Id = @Id", new { Id = id });
        }
    }

    public async Task UpdateSaleoutAsync(Guid Id,SaleOutUpdate update)
    {
        using(var connection = dbSqlConnection.CreateConnection())
        {
            await connection.ExecuteAsync("spUpdateSaleout", new
            {
                Id = Id,
                QuantityPerBox = update.QuantityPerBox,
                Quantity = update.Quantity,
                Price = update.Price,
            }, commandType: CommandType.StoredProcedure);
        }
    }
    public async Task DeleteSaleOutAsync(Guid Id)
    {
        using (var connection = dbSqlConnection.CreateConnection())
        {
            await connection.ExecuteAsync("Delete from dbo.SaleOut where Id = @Id", new { Id = Id });
        }
    }


    public async Task<IEnumerable<SaleoutRevenueDto>> GetSaleoutRevenueAsync(int fromDate, int toDate)
    {
        using(var connection = dbSqlConnection.CreateConnection())
        {
            string sql = "select * from dbo.fnSaleOutReport(@FromDate, @ToDate)";
            return await connection
                .QueryAsync<SaleoutRevenueDto>
                    (sql, new { FromDate = fromDate, ToDate = toDate }, commandType: CommandType.Text);
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

public class SaleOutUpdate
{
    public decimal QuantityPerBox { get; set; }
    public decimal Quantity { get; set; }
    public decimal Price { get; set; }
}