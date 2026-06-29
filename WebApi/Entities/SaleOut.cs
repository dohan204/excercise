using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Dapper.Contrib;
using Dapper.Contrib.Extensions;
using OfficeOpenXml.Attributes;
namespace WebApi.Entities;

public partial class SaleOut
{
    [EpplusIgnore]
    public Guid Id {get; set;}
    [DisplayName("Mã khách hàng")]
    public string CustomerPoNo {get; set;}
    [DisplayName("Ngày đặt hàng")]
    public int OrderDate {get; set;}
    [DisplayName("Tên khách hàng")]

    public string CustomerName { get; set; }
    [DisplayName("Mã sản phẩm")]
    public Guid ProductId { get; set; }
    [DisplayName("Số lượng")]
    public decimal Quantity { get; set; }
    [DisplayName("Đơn giá")]
    public decimal Price { get; set; }
    [EpplusIgnore]
    public decimal Amount { get; set; }
    [DisplayName("Số lượng/thùng")]
    public decimal QuantityPerBox { get; set; }
    [EpplusIgnore]
    public decimal? BoxQuantity { get; set; }

}
