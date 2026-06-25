using FluentValidation;
using WebApi.Entities;
using WebApi.Services;

namespace WebApi.Validation; 

public class SaleOutValidation : AbstractValidator<SaleOut>
{
    public SaleOutValidation(int row)
    {
        RuleFor(e => e.CustomerPoNo)
            .NotEmpty().WithMessage($"Dòng {row} Mã PO Khách hàng không được để trống");

        RuleFor(e => e.CustomerName)
            .NotEmpty().WithMessage($"Dòng {row} Tên khách hàng không duocj để trống");

        RuleFor(e => e.Quantity)
            .NotEmpty().WithMessage($"Dòng {row} Số lượng kh được để trống");
        RuleFor(e => e.Price)
            .NotEmpty().WithMessage($"Dòng {row} Giá bán không duocjd trống");
        RuleFor(e => e.ProductId)
            .NotEmpty().WithMessage($"Dòng {row} mã sp không được để trống");
    }
}