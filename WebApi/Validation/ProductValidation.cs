using FluentValidation;
using WebApi.Entities;
namespace WebApi.Validation;

public class ProductValidation : AbstractValidator<MasterProduct>
{
    public ProductValidation()
    {
        RuleFor(e => e.ProductCode)
            .NotEmpty().WithMessage("Mã sản phẩm không được để trống.")
            .MaximumLength(50).WithMessage("Mã sản phẩm không được vươt quá 50 ký tự");

        RuleFor(e => e.ProductName)
            .NotEmpty().WithMessage("Tên sản phẩm không được để trống")
            .MaximumLength(200).WithMessage("Tên sản phẩm không được vượt quá 200 ký tự");

        RuleFor(e => e.Unit)
            .NotEmpty().WithMessage("Đơn vị tính không được để trống");

        RuleFor(e => e.ProductWeight)
            .NotEmpty().WithMessage("Cân nặng của sản phẩm không được để trống")
            .GreaterThan(0).WithMessage("Cân nặng của sản phẩm phải lớn hơn 0");

    }
}