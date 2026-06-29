using System.Drawing;
using System.Net.Mime;
using Dapper;
using OfficeOpenXml;
using OfficeOpenXml.Style;
using WebApi.Database;
using WebApi.Entities;
using WebApi.Validation;
using Z.Dapper.Plus;
using WebApi.Dtos;
using Microsoft.Identity.Client;
using OfficeOpenXml.Packaging.Ionic.Zip;
using WebApi.Exceptions;
using Microsoft.AspNetCore.Http.HttpResults;
namespace WebApi.Services;


public interface IExcelService
{
    Task<(byte[] fileBytes, string typeName, string fileName)> GetContentTypeAsync<T>();
    Task HandleFileImport(Stream stream, string nameEntity);

    Task<(byte[] fileBytes, string typeName, string fileName)> GetRevenueAsync(int fromDate, int toDate);
}

public class ExcelService : IExcelService
{

    private readonly MasterProductService masterProductService;
    private readonly IDbSqlConnection dbSqlConnection;
    private readonly SaleOutService saleOutService;
    public ExcelService(MasterProductService masterProductService,
        IDbSqlConnection connection, SaleOutService saleOutService)
    {
        this.masterProductService = masterProductService;
        this.dbSqlConnection = connection;
        this.saleOutService = saleOutService;
    }
    private async Task<byte[]> ExportToBytes<T>(List<T> data, string sheetName)
    {
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
        string[] clumnsData = ExcelMappingService.ReceiveColumnName(nameEntity);

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
                string valueCell = headerColumn[col]?.Value?.ToString();
                Console.WriteLine("Length column: {0}, {1}",valueCell, valueCell.Length);
                if (string.IsNullOrEmpty(valueCell)) continue;
                if(nameEntity == "sale" && valueCell == "Mã sản phẩm")
                {
                    valueCell = valueCell + " ";
                    Console.WriteLine($"Length {valueCell}: {valueCell.Length}");
                }
                string columnNameEng = 
                    ExcelMappingService.ConvertVietnameseToEnglish(valueCell.Trim(), "sale");

                if (!clumnsData.Contains(columnNameEng))
                {
                    var columnName = ExcelMappingService.ConvertEnglishToVietnamese(columnNameEng);
                    throw new BadRequestException($"Tên Cột {columnName} không tồn tại");
                }


            }

            List<MasterProduct> dataInsert = new List<MasterProduct>();
            List<SaleOut> saleInsert = new List<SaleOut>();
            switch (nameEntity.ToLower())
            {
                case "product":
                    for (int row = 2; row <= rowCount; row++)
                    {
                        string productCode = worksheet.Cells[row, 1]?.Value?.ToString();
                        string productName = worksheet.Cells[row, 2]?.Value?.ToString();
                        string unit = worksheet.Cells[row, 3]?.Value?.ToString();
                        string specification = worksheet.Cells[row, 4]?.Value?.ToString();
                        decimal quantityPerBox = worksheet.Cells[row, 5].GetValue<decimal>();
                        decimal productWeight = worksheet.Cells[row, 6].GetValue<decimal>();
                        MasterProduct product = new MasterProduct
                        {
                            ProductCode = productCode,
                            ProductName = productName,
                            Unit = unit,
                            Specification = specification,
                            QuantityPerBox = quantityPerBox,
                            ProductWeight = productWeight
                        };
                        var validator = new ProductValidation();
                        var result = await validator.ValidateAsync(product);

                        if (result.Errors.Count > 0 | !result.IsValid)
                        {
                            throw new BadRequestException(string.Join(",", result.Errors.Select(e => e.ErrorMessage)));
                        }

                        using (var connection = dbSqlConnection.CreateConnection())
                        {
                            if (await connection.QueryFirstAsync<int>(
                                @"if exists (Select top(1)Id from dbo.MasterProduct where ProductCode = @ProductCode)
                                    Select 1
                                    else 
                                        Select 0",
                                new { ProductCode = product.ProductCode }
                            ) > 0)
                            {
                                throw new ConflictException($"Mã sản phẩm {product.ProductCode} dòng {row} đã tồn tại");
                            }
                        }

                        dataInsert.Add(product);
                    }
                    await this.ManyInsertAsync<MasterProduct>(dataInsert);
                    break;
                case "sale":
                    for (int row = 2; row <= rowCount; row++)
                    {

                        if (!Guid.TryParse(worksheet.Cells[row, 4].Text, out var productId))
                        {
                            throw new BadRequestException($"Dòng {row} Mã sản phẩm Không hợp lệ");
                        }


                        decimal quantity = worksheet.Cells[row, 5].GetValue<decimal>();
                        decimal price = worksheet.Cells[row, 6].GetValue<decimal>();
                        decimal quantityPerBox = worksheet.Cells[row, 7].GetValue<decimal>();
                        if (quantityPerBox <= 0)
                        {
                            throw new BadRequestException($"Dòng {row} Số lượng trên thùng phải lớn hơn 0");
                        }
                        SaleOut saleout = new SaleOut
                        {
                            CustomerPoNo = worksheet.Cells[row, 1]?.Value?.ToString(),
                            OrderDate = worksheet.Cells[row, 2].GetValue<int>(),
                            CustomerName = worksheet.Cells[row, 3]?.Value?.ToString(),
                            ProductId = Guid.Parse(worksheet.Cells[row, 4]?.Value?.ToString()),
                            Quantity = quantity,
                            Price = price,
                            QuantityPerBox = quantityPerBox,
                            Amount = quantity * price,
                            BoxQuantity = quantity / quantityPerBox
                        };

                        var validator = new SaleOutValidation(row);
                        var result = await validator.ValidateAsync(saleout);
                        if (result.Errors.Count > 0)
                        {
                            throw new BadRequestException(string.Join(", ", result.Errors.Select(e => e.ErrorMessage)));
                        }

                        using (var connection = dbSqlConnection.CreateConnection())
                        {
                            if (await connection.QueryFirstAsync<int>(
                                @"if exists (Select top(1)Id from dbo.SaleOut where 
                                    CustomerPoNo = @CustomerPoNo and ProductId = @ProductId)
                                        Select 1
                                    else 
                                        Select 0",
                                new { CustomerPoNo = saleout.CustomerPoNo, ProductId = saleout.ProductId }
                            ) > 0)
                            {
                                throw new ConflictException($"Mã sản phẩm {saleout.CustomerPoNo} và {saleout.ProductId} ở dòng {row} đã tồn tại");
                            }
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
    public async Task<(byte[] fileBytes, string typeName, string fileName)> GetRevenueAsync(int fromDate, int toDate)
    {
        byte[] fileBytes = await this.GetByteRevenueAsync(fromDate, toDate);
        string typeName = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        string fileName = "BaoCaoDoanhThu.xlsx";

        return (fileBytes, typeName, fileName);
    }

    private async Task<byte[]> GetByteRevenueAsync(int fromDate, int toDate)
    {
        var revenueData = await this.saleOutService.GetSaleoutRevenueAsync(fromDate, toDate);
        using (var package = new ExcelPackage())
        {
            var worksheet = package.Workbook.Worksheets.Add("Báo cáo doanh thu sản phẩm");

            worksheet.Cells["A3"].LoadFromCollection<SaleoutRevenueDto>(revenueData, true);
            worksheet.InsertColumn(1, 1);
            worksheet.Cells["A1:F1"].Merge = true;
            worksheet.Row(1).Height = 30;
            worksheet.Cells[1, 1].Value = "Báo cáo doanh thu";
            worksheet.Cells[1, 1].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
            worksheet.Cells[1, 1].Style.VerticalAlignment = ExcelVerticalAlignment.Center;

            worksheet.Cells[1, 1].Style.Font.Size = 16;
            worksheet.Cells[1, 1].Style.Font.Bold = true;


            worksheet.Cells["A2:B2"].Merge = true;
            worksheet.Cells[2, 1].Value = $"Từ ngày:  {ConvertDateToString(fromDate)}";
            worksheet.Cells[2, 1].Style.Font.Bold = true;

            worksheet.Cells["C2:D2"].Merge = true;
            worksheet.Cells[2, 3].Value = $"Đến ngày:  {ConvertDateToString(toDate)}";
            worksheet.Cells[2, 3].Style.Font.Bold = true;






            int totalColumns = worksheet.Dimension.End.Column;
            int totalRows = worksheet.Dimension.End.Row;
            int sumaryRow = totalRows + 1;
            worksheet.Cells[3, 1].Value = "STT";
            for (int row = 4; row <= totalRows; row++)
            {
                worksheet.Cells[row, 1].Value = row - 3;
                worksheet.Cells[row, 1].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
            }
            worksheet.Cells[sumaryRow, 1, sumaryRow, 3].Merge = true;
            worksheet.Cells[sumaryRow, 1].Value = "Tổng cộng:";
            worksheet.Cells[sumaryRow, 1].Style.Font.Bold = true;
            worksheet.Cells[sumaryRow, 1].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;

            worksheet.Cells[sumaryRow, 4].Formula = $"Sum(D4:D{totalRows})";
            worksheet.Cells[sumaryRow, 6].Formula = $"Sum(F4:F{totalRows})";

            worksheet.Cells[sumaryRow, 6].Formula = $"SUM(F4:F{totalRows})";
            worksheet.Cells[sumaryRow, 6].Style.Font.Bold = true;
            worksheet.Cells[sumaryRow, 6].Style.Numberformat.Format = "#,##0";

            using (var headerColumn = worksheet.Cells[3, 1, 3, totalColumns])
            {
                headerColumn.Style.Font.Bold = true;
                headerColumn.Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
            }



            using (var moneyCols = worksheet.Cells[4, 5, sumaryRow, 6])
            {
                moneyCols.Style.Numberformat.Format = "#,##0";
                moneyCols.Style.HorizontalAlignment = ExcelHorizontalAlignment.Right;
            }


            using (var orderData = worksheet.Cells[4, 2, totalRows, 2])
            {
                orderData.Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
            }
            int finalRows = worksheet.Dimension.End.Row;

            using (var dataRange = worksheet.Cells[3, 1, finalRows, totalColumns])
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

    private string ConvertDateToString(int date)
    {
        return $"{date.ToString().Substring(0, 4)}/{date.ToString().Substring(4, 2)}/{date.ToString().Substring(6, 2)}";
    }

}


public class ExcelMappingService
{
    private static readonly Dictionary<string, string> ColumnMapping = new(StringComparer.OrdinalIgnoreCase)
    {
        { "Mã sản phẩm", "ProductCode" },
        { "Tên sản phẩm", "ProductName" },
        { "Đơn vị tính", "Unit" },
        { "Quy cách", "Specification" },
        { "Số lượng/Thùng", "QuantityPerBox" },
        { "Số lượng/ Thùng", "QuantityPerBox" },
        { "Cân nặng", "ProductWeight" },
        { "Mã khách hàng", "CustomerPoNo" },
        { "Ngày đặt hàng", "OrderDate" },
        { "Tên khách hàng", "CustomerName" },
        { "Mã Sản phẩm ", "ProductId" },
        { "Số lượng", "Quantity" },
        { "Đơn giá", "Price" }
    };

    private static readonly Dictionary<string, string> EnglishToVietnameseMapping = new(StringComparer.OrdinalIgnoreCase)
{
    { "ProductCode", "Mã sản phẩm" },
    { "ProductName", "Tên sản phẩm" },
    { "Unit", "Đơn vị tính" },
    { "Specification", "Quy cách" },
    { "QuantityPerBox", "Số lượng/Thùng" },
    { "ProductWeight", "Cân nặng" },
    { "CustomerPoNo", "Mã khách hàng" },
    { "OrderDate", "Ngày đặt hàng" },
    { "CustomerName", "Tên khách hàng" },
    { "ProductId", "Mã sản phẩm" },
    { "Quantity", "Số lượng" },
    { "Price", "Đơn giá" }
};

    private static readonly Dictionary<string, string[]> EntityColumns = new(StringComparer.OrdinalIgnoreCase)
    {
        { "product", ["ProductCode", "ProductName", "Unit", "Specification", "QuantityPerBox", "ProductWeight"] },
        { "sale", ["CustomerPoNo", "OrderDate", "CustomerName", "ProductId", "Quantity", "Price", "Amount", "QuantityPerBox", "BoxQuantity"] }
    };

    public static string[] ReceiveColumnName(string nameEntity)
    {
        return EntityColumns.TryGetValue(nameEntity, out var columns) ? columns : [];
    }

    public static string ConvertVietnameseToEnglish(string column, string? entity)
    {
        if (string.IsNullOrWhiteSpace(column) || string.IsNullOrWhiteSpace(entity)) return string.Empty;

        string trimmedColumn =
            entity == "sale" &&
            column == "Mã sản phẩm" ? column + " "  : column.Trim();

        return ColumnMapping.TryGetValue(trimmedColumn, out var englishName) ? englishName : trimmedColumn;
    }

    public static string ConvertEnglishToVietnamese(string column)
    {
        if (string.IsNullOrWhiteSpace(column)) return string.Empty;

        string trimmedColumn = column.Trim();

        return EnglishToVietnameseMapping.TryGetValue(trimmedColumn, out var englishName)
            ? englishName : trimmedColumn;
    }

    public static void ColumnNameValidate(string name)
    {

    }
}
