using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace WebApi.Dtos;

public record DataQueryRevenue(int FromDate, int ToDate);

public class SaleoutRevenueDto
{
    [Display(Name = "Mã sản phẩm")]
    public Guid Id {get; set;}
    [DisplayName("Tên sản phẩm")]
    public string ProductName { get; set; }
    [Display(Name = "Số lượng")]
    public decimal Quantity { get; set; }
    [Display(Name = "Đơn giá")]
    public decimal Price {get; set;}
    [Display(Name = "Tổng tiền")]
    public decimal Amount {get; set;}
}