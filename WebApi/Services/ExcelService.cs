using System.Drawing;
using System.Net.Mime;
using Dapper;
using OfficeOpenXml;
using OfficeOpenXml.Style;
using WebApi.Database;
using WebApi.Entities;
using Z.Dapper.Plus;

namespace WebApi.Services;


public interface IExcelService
{
    Task<(byte[] fileBytes, string typeName, string fileName)> GetContentTypeAsync<T>();
    Task HandleFileImport(Stream stream);
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

        using(var package = new ExcelPackage())
        {
            var worksheet = package.Workbook.Worksheets.Add(sheetName);

            // đổ dữ liệu từ A1 vào 
            worksheet.Cells["A1"].LoadFromCollection<T>(data, true);

            int totalCols = worksheet.Dimension.End.Column;
            int totalRows = worksheet.Dimension.End.Row;
            using(var headerColumn = worksheet.Cells[1, 1, 1, totalCols])
            {
                headerColumn.Style.Font.Bold = true;
                headerColumn.Style.Font.Color.SetColor(Color.White);

                headerColumn.Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
                headerColumn.Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
            }

            using(var dataRange = worksheet.Cells[1, 1, totalRows, totalCols])
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
        using(var connection = dbSqlConnection.CreateConnection())
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

    public async Task HandleFileImport(Stream stream)
    {
        ExcelPackage.License.SetNonCommercialPersonal("dohan");
        string[] products = ["ProductCode", "ProductName", "Unit", "Specification", "QuantityPerBox", "ProductWeight"];

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
                if (!products.Contains(valueCell))
                {
                    throw new Exception("Tên Cột không tồn tại");
                }
            }

            List<MasterProduct> dataInsert = new List<MasterProduct>();
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
            await this.ManyInsert(dataInsert);
        }
    }

        private async Task ManyInsert(List<MasterProduct> products)
    {
        products.ForEach(p => { if (p.Id == Guid.Empty) p.Id = Guid.NewGuid(); });
        using (var connection = dbSqlConnection.CreateConnection())
        {
            await connection.BulkInsertAsync<MasterProduct>(products);
        }
    }

}