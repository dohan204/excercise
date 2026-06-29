// using System.Reflection.Metadata;
using QuestPDF.Fluent;
using QRCoder;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using WebApi.Dtos;
using WebApi.Entities;

namespace WebApi.Services;

public interface IPdfService
{
    Task<(byte[] fileBytes, string typeName, string fileName)> GetDataPrint(Guid Id);
}


public class PdfService : IPdfService
{

    private readonly SaleOutService saleOutService;
    private SaleOutDto? saleout;

    public PdfService(SaleOutService saleOutService)
    {
        this.saleOutService = saleOutService;
    }
    private async Task<byte[]> GetByteReport(Guid Id)
    {
        saleout = await this.saleOutService.GetSaleOutByIdAsync(Id);
        return Document.Create(document =>
        {
            document.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(2, Unit.Millimetre);
                page.DefaultTextStyle(x => x.FontSize(10));

                page.Header().Element(HeaderPage);

                page.Content()
                    .Column(col =>
                {
                    col.Spacing(15);
                    col.Item().Element(HeaderSubTital);
                    col.Item().Element(DateSaleOut);


                    col.Item().Element(DataTable);
                    col.Item().PaddingTop(20).Element(FooterPage);
                });
            });
        }).GeneratePdf();
    }


    private void HeaderPage(IContainer container)
    {
        container.Column(colum =>
        {
            colum.Item().Text("Phiếu xuất hàng").AlignCenter().FontSize(32).Bold();

        });
    }


    private void HeaderSubTital(IContainer container)
    {
        byte[] qrCodeBytes = GenerateQRCodeBytes(saleout?.Id?.ToString() ?? "Chưa có thông tin mã phiếu");
        container.Row(row =>
        {
            row.Spacing(15);
            row.RelativeItem(2).Text($"Khách hàng: {saleout?.CustomerName}").Bold();
            row.RelativeItem(1).Text($"Số phiếu: {saleout?.Id}").Bold();

            row.ConstantItem(50).Width(50)
                .Height(50)
                .Image(qrCodeBytes);
        });
    }


    private void DateSaleOut(IContainer container)
    {
        container.Row(row =>
        {
            var year = saleout?.OrderDate.ToString().Substring(0, 4);
            var month = saleout?.OrderDate.ToString().Substring(4, 2);
            var day = saleout?.OrderDate.ToString().Substring(6, 2);

            string fullOrderDate = $"{day}/{month}/{year}";
            row.RelativeItem().Text($"Ngày xuất kho:  {fullOrderDate}");
        });
    }



    private void DataTable(IContainer container)
    {
        container.Table(table =>
        {
            table.ColumnsDefinition(column =>
            {
                column.ConstantColumn(30);
                column.RelativeColumn(2);
                column.RelativeColumn(2);
                column.RelativeColumn(1);
                column.RelativeColumn(1);
                column.RelativeColumn(1);
            });
// .BorderBottom(1).Padding(3).
// .BorderBottom(1).Padding(3).
// .BorderBottom(1).Padding(3).
// .BorderBottom(1).Padding(3).
// .BorderBottom(1).Padding(3).
// .BorderBottom(1).Padding(3).

            table.Header(header =>
            {
                header.Cell().Element(CellStyle).Text("STT");
                header.Cell().Element(CellStyle).Text("Mã sản phẩm");
                header.Cell().Element(CellStyle).Text("Tên sản phẩm");
                header.Cell().Element(CellStyle).Text("Só lượng");
                header.Cell().Element(CellStyle).Text("Đơn giá");
                header.Cell().Element(CellStyle).Text("Thành tiền");
            });


            table.Cell().Element(CellStyle).Text($"1");
            table.Cell().Element(CellStyle).Text($"{saleout?.ProductId}");
            table.Cell().Element(CellStyle).Text($"{saleout?.ProductName}");
            table.Cell().Element(CellStyle).Text($"{Convert.ToInt32(saleout?.Quantity)}");
            table.Cell().Element(CellStyle).Text($"{saleout?.Price:N0}");
            table.Cell().Element(CellStyle).Text($"{saleout?.Amount:N0}");

            table.Cell().ColumnSpan(5).Element(CellStyle).Text("Tổng: ").AlignCenter();
            table.Cell().Element(CellStyle).Text($"{saleout?.Amount:N0}");
            static IContainer CellStyle(IContainer container)
            => container.Border(1).Padding(4);
        });
    }


    private void FooterPage(IContainer container)
    {
        container.Row(row =>
        {
            row.Spacing(25);

            row.RelativeItem().Column(column =>
            {
                column.Item().Text("Người lập phiếu").AlignCenter();
                column.Item().Height(60);
                column.Item().Text("(Ký, ghi rõ họ tên)").FontSize(10).AlignCenter();
            });
            row.RelativeItem().Column(column =>
            {
                column.Item().Text("Người Duyệt").AlignCenter();
                column.Item().Height(60);
                column.Item().Text("(Ký, ghi rõ họ tên)").FontSize(10).AlignCenter();
            });
            row.RelativeItem().Column(column =>
            {
                column.Item().Text("Thủ kho").AlignCenter();
                column.Item().Height(60);
                column.Item().Text("(Ký, ghi rõ họ tên)").FontSize(10).AlignCenter();
            });
            row.RelativeItem().Column(column =>
            {
                column.Item().Text("Người nhận").AlignCenter();
                column.Item().Height(60);
                column.Item().Text("(Ký, ghi rõ họ tên)").FontSize(10).AlignCenter();
            });
        });
    }
    public async Task<(byte[] fileBytes, string typeName, string fileName)> GetDataPrint(Guid Id)
    {
        var fileBytes = await GetByteReport(Id);
        string typeName = "application/pdf";
        string fileName = "PhieuXuatHang.pdf";

        return (fileBytes, typeName, fileName);
    }

    private byte[] GenerateQRCodeBytes(string text)
    {
        using var qrGenerator = new QRCodeGenerator();
        using var qrCodeData = qrGenerator.CreateQrCode(text, QRCodeGenerator.ECCLevel.Q);

        using var qrCode = new PngByteQRCode(qrCodeData);
        return qrCode.GetGraphic(20);
    }
}