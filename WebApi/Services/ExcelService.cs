using System.Drawing;
using System.Net.Mime;
using Dapper;
using OfficeOpenXml;
using OfficeOpenXml.Style;
using WebApi.Database;
using WebApi.Entities;
using WebApi.Validation;
using Z.Dapper.Plus;

namespace WebApi.Services;


public interface IExcelService
{
    Task<(byte[] fileBytes, string typeName, string fileName)> GetContentTypeAsync<T>();
    Task HandleFileImport(Stream stream, string nameEntity);
}

public class ExcelService : IExcelService
{

    private readonly MasterProductService masterProductService;
    private readonly IDbSqlConnection dbSqlConnection;
    public ExcelService(MasterProductService masterProductService, IDbSqlConnection connection)
    {
        this.masterProductService = masterProductService;
        this.dbSqlConnection = connection;
    }
    private async Task<byte[]> ExportToBytes<T>(List<T> data, string sheetName)
    {
        ExcelPackage.License.SetNonCommercialPersonal("dohan");
        using (var package = new ExcelPackage())
        {
            var worksheet = package.Workbook.Worksheets.Add(sheetName);

            // đổ dữ liệu từ A1 vào 
            worksheet.Cells["A1"].LoadFromCollection<T>(data, true);

            int totalCols = worksheet.Dimension.End.Column;
            int totalRows = worksheet.Dimension.End.Row;
            using (var headerColumn = worksheet.Cells[1, 1, 1, totalCols])
            {
                headerColumn.Style.Font.Bold = true;
                headerColumn.Style.Font.Color.SetColor(Color.White);

                headerColumn.Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
                headerColumn.Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
            }

            using (var dataRange = worksheet.Cells[1, 1, totalRows, totalCols])
            {
                dataRange.Style.Border.Left.Style = ExcelBorderStyle.Thin;
                dataRange.Style.Border.Top.Style = ExcelBorderStyle.Thin;
                dataRange.Style.Border.Right.Style = ExcelBorderStyle.Thin;
                dataRange.Style.Border.Bottom.Style = ExcelBorderStyle.Thin;
            }

            worksheet.Cells[worksheet.Dimension.Address].AutoFitColumns();

            return await package.GetAsByteArrayAsync();
        }
    }

    public async Task<(byte[] fileBytes, string typeName, string fileName)> GetContentTypeAsync<T>()
    {
        using (var connection = dbSqlConnection.CreateConnection())
        {
            var tableName = typeof(T).Name;

            var data = (await connection.QueryAsync<T>
            ($"Select  top 2 * from dbo.{tableName}")).ToList();


            byte[] fileBytes = await ExportToBytes<T>(data, "Tệp mẫu");

            string typeName = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            string fileName = $"Mau_Import_{tableName}_{DateTime.Now:yyyyMMdd}.xlsx";
            return (fileBytes, typeName, fileName);
        }
    }

    public async Task HandleFileImport(Stream stream, string nameEntity)
    {
        ExcelPackage.License.SetNonCommercialPersonal("dohan");
        string[] clumnsData = ReceiveColumnName(nameEntity);

        using (var package = new ExcelPackage(stream))
        {
            // lấy sheeet 
            ExcelWorksheet worksheet = package.Workbook.Worksheets[0];

            if (worksheet.Dimension == null) throw new Exception("File Excel không có dữ liệu");
            int rowCount = worksheet.Dimension.Rows;
            int colCount = worksheet.Dimension.Columns;

            var headerColumn = worksheet.Cells[1, 1, 1, colCount].ToArray();

            for (int col = 0; col < headerColumn.Length; col++)
            {
                string valueCell = headerColumn[col]?.Value?.ToString()?.Trim();
                if (string.IsNullOrEmpty(valueCell)) continue;
                if (!clumnsData.Contains(valueCell))
                {
                    throw new Exception("Tên Cột không tồn tại");
                }
            }

            List<MasterProduct> dataInsert = new List<MasterProduct>();
            List<SaleOut> saleInsert = new List<SaleOut>();

            switch (nameEntity.ToLower())
            {
                case "product":
                    for (int row = 2; row <= rowCount; row++)
                    {
                        MasterProduct product = new MasterProduct
                        {
                            ProductCode = worksheet.Cells[row, 1]?.Value?.ToString() ?? "Chưa có dữ liệu",
                            ProductName = worksheet.Cells[row, 2]?.Value?.ToString() ?? "Chưa có dữ liệu",
                            Unit = worksheet.Cells[row, 3]?.Value?.ToString() ?? "Chưa có dữ liệu",
                            Specification = worksheet.Cells[row, 4].Value?.ToString() ?? "Chưa có dữ liệu",
                            QuantityPerBox = worksheet.Cells[row, 5].GetValue<decimal>(),
                            ProductWeight = worksheet.Cells[row, 6].GetValue<decimal>(),
                        };

                        dataInsert.Add(product);
                    }
                    await this.ManyInsertAsync<MasterProduct>(dataInsert);
                    break;
                case "sale":
                    for (int row = 2; row <= rowCount; row++)
                    {
                        decimal quantity = worksheet.Cells[row, 5].GetValue<decimal>();
                        decimal price = worksheet.Cells[row, 6].GetValue<decimal>();
                        decimal quantityPerBox = worksheet.Cells[row,7].GetValue<decimal>();
                        SaleOut saleout = new SaleOut
                        {
                            CustomerPoNo = worksheet.Cells[row, 1]?.Value?.ToString() ?? "Chưa có dữ liệu",
                            OrderDate = worksheet.Cells[row, 2].GetValue<int>(),
                            CustomerName = worksheet.Cells[row, 3]?.Value?.ToString() ?? "Chư có dữ liệu",
                            ProductId = Guid.Parse(worksheet.Cells[row, 4]?.Value?.ToString()),
                            Quantity = quantity,
                            Price = price,
                            QuantityPerBox = quantityPerBox,
                            Amount = quantity * price,
                            BoxQuantity = quantity / quantityPerBox
                        };

                        var validator = new SaleOutValidation(row);
                        var result = await validator.ValidateAsync(saleout);
                        if(result.Errors.Count > 0)
                        {
                            throw new Exception(string.Join(", ", result.Errors.Select(e => e.ErrorMessage)));
                        }
                        saleInsert.Add(saleout);
                    }



                    await this.ManyInsertAsync<SaleOut>(saleInsert);
                    break;
                default:
                    break;
            }

        }
    }

    private async Task ManyInsertAsync<T>(List<T> entities) where T : class
    {
        foreach (var item in entities)
        {
            // Sử dụng Reflection để tự động sinh Guid mới nếu Id trống (nếu thực thể có thuộc tính Id)
            var idProp = item.GetType().GetProperty("Id");
            Console.WriteLine($"log: {idProp}");
            if (idProp != null && idProp.PropertyType == typeof(Guid))
            {
                var currentId = (Guid)idProp.GetValue(item);
                if (currentId == Guid.Empty)
                {
                    idProp.SetValue(item, Guid.NewGuid());
                }
            }
        }

        using (var connection = dbSqlConnection.CreateConnection())
        {
            // Tự động Bulk Insert theo Type T được truyền vào
            await connection
                .BulkInsertAsync<T>(entities);
        }
    }

    private string[] ReceiveColumnName(string nameEntity)
    {
        return nameEntity switch
        {
            "product" => ["ProductCode", "ProductName", "Unit", "Specification", "QuantityPerBox", "ProductWeight"],
            "sale" => ["Id", "CustomerPoNo", "OrderDate", "CustomerName", "ProductId", "Quantity", "Price", "Amount", "QuantityPerBox", "BoxQuantity"]
        };
    }

}