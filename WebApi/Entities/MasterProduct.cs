using System.ComponentModel;
using System.Text.Json.Serialization;
using OfficeOpenXml.Attributes;

namespace WebApi.Entities;


public class MasterProduct
{
    [EpplusIgnore]
    public Guid Id { get; set; }
    [DisplayName("Mã sản phẩm")]
    public string? ProductCode  { get; set; }
    [DisplayName("Tên sản phẩm")]
    public string? ProductName { get; set; }
    [DisplayName("Đơn vị tính")]
    public string? Unit { get; set; }
    [DisplayName("Quy cách")]
    public string? Specification { get; set; }
    [DisplayName("Số lượng/Thùng")]
    public decimal? QuantityPerBox { get; set; }
    [DisplayName("Cân nặng")]
    public decimal? ProductWeight { get; set; }

}
