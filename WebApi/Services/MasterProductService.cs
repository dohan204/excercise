using System.Net.Http.Headers;
using System.Runtime.CompilerServices;
using Dapper;
using Microsoft.EntityFrameworkCore.Query.SqlExpressions;
using Microsoft.Identity.Client;
using OfficeOpenXml;
using WebApi.Database;
using WebApi.Entities;
using WebApi.Exceptions;
using Z.Dapper.Plus;

namespace WebApi.Services;

public class MasterProductService
{
    private readonly IDbSqlConnection sqlConnection;
    public MasterProductService(IDbSqlConnection dbSqlConnection)
    {
        this.sqlConnection = dbSqlConnection;
    }

    public async Task<IEnumerable<MasterProduct>> GetMasterProductsAsync()
    {
        using (var connection = sqlConnection.CreateConnection())
        {
            var sql = @"Select * from dbo.MasterProduct";
            var products = await connection.QueryAsync<MasterProduct>(sql);
            return products;
        }
    }

    public async Task<MasterProduct?> GetMasterProductIdAsync(Guid Id)
    {
        using (var connection = sqlConnection.CreateConnection())
        {
            var sql = $"select * from dbo.MasterProduct where Id = @Id";
            return await
                connection.QuerySingleOrDefaultAsync<MasterProduct>(sql, new { Id });
        }
    }


    public async Task CreateMasterProductAsync(MasterProduct masterProduct)
    {
        using (var connection = sqlConnection.CreateConnection())
        {
            if (await ProductExits(masterProduct.ProductCode))
            {
                throw new ConflictException("Sản phẩm đã tồn tại");
            }

            await
            connection.ExecuteAsync
                ("spCreateMasterProduct", new
                {
                    masterProduct.ProductCode,
                    masterProduct.ProductName,
                    masterProduct.Unit,
                    masterProduct.Specification,
                    masterProduct.QuantityPerBox,
                    masterProduct.ProductWeight
                }, commandType: System.Data.CommandType.StoredProcedure);
        }
    }


    public async Task UpdateMasterProductAsync(Guid Id, MasterProduct masterProduct)
    {
        using (var connection = sqlConnection.CreateConnection())
        {
            if (await connection.QueryFirstOrDefaultAsync<MasterProduct>("Select top(1) Id from dbo.MasterProduct where Id = @Id", new { Id = Id }) == null)
            {
                throw new ArgumentNullException("Sản phẩm không tồn tại");
            }

            await connection.ExecuteAsync("spUpdateMasterProduct", new
            {
                ProductId = Id,
                masterProduct.ProductCode,
                masterProduct.ProductName,
                masterProduct.Unit,
                masterProduct.Specification,
                masterProduct.QuantityPerBox,
                masterProduct.ProductWeight
            }, commandType: System.Data.CommandType.StoredProcedure);
        }
    }


    public async Task DeleteMasterProductAsync(Guid Id)
    {
        using (var connection = sqlConnection.CreateConnection())
        {
            var sql = @"Delete from dbo.MasterProduct where Id = @Id";
            await connection.ExecuteAsync(sql, new { Id });
        }
    }

    public async Task<IEnumerable<MasterProduct>> SearchByFieldAsync(string fieldName, string keyword)
    {
        if (string.IsNullOrEmpty(fieldName) || string.IsNullOrEmpty(keyword))
        {
            throw new ArgumentNullException("Nội dung tìm kiếm không hợp lệ");
        }
        string sqlSearch = fieldName switch
        {
            "productCode" => $"Select * from dbo.MasterProduct where ProductCode Like '{keyword}%'",
            "productName" => $"Select * from dbo.MasterProduct where ProductName Like '{keyword}%'",
            "unit" => $"Select * from dbo.MasterProduct where Unit like '{keyword}%'",
            "specification" => $"Select * from dbo.MasterProduct where Specification like '{keyword}'",
            "quantityPerBox" => $"Select * from dbo.MasterProduct where QuantityPerBox like '{keyword}%'",
            "productWeight" => $"Select * from dbo.MasterProduct where productWeight like '{keyword}%'"
        };

        using (var connection = sqlConnection.CreateConnection())
        {
            var products = await connection.QueryAsync<MasterProduct>(sqlSearch);
            return products;
        }
    }

    

    private bool InputValidate(MasterProduct masterProduct)
    {
        if (string.IsNullOrEmpty(masterProduct.ProductCode)
        && string.IsNullOrEmpty(masterProduct.ProductName)
        && string.IsNullOrEmpty(masterProduct.Unit)
        && masterProduct.ProductWeight <= 0
        && masterProduct.QuantityPerBox <= 0)
        {
            return false;
        }

        return true;
    }


    private async Task<bool> ProductExits(string productCode)
    {
        using (var connection = sqlConnection.CreateConnection())
        {
            return await connection.QueryFirstAsync<int>($"if exists (select top(1)Id from dbo.MasterProduct where ProductCode = @Id) select 1 else select 0", new { Id = productCode }) > 0;
        }
    }
}