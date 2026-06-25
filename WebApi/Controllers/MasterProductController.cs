using WebApi.Services;
using Microsoft.AspNetCore.Mvc;
using WebApi.Entities;
using System.Runtime.CompilerServices;
using Microsoft.AspNetCore.StaticFiles;

namespace WebApi.Controllers;


[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly IExcelService excelService;
    private readonly MasterProductService _productService;
    public ProductsController(MasterProductService productService, IExcelService excelService)
    {
        _productService = productService;
        this.excelService = excelService;
    }
    [HttpGet]
    public async Task<IActionResult> GetProducts()
    {
        var products = await _productService.GetMasterProductsAsync();
        return Ok(products);
    }
    [HttpGet("details/{id}")]
    public async Task<IActionResult> GetDetailsProduct([FromRoute] string id)
    {
        var product = await _productService.GetMasterProductIdAsync(Guid.Parse(id));
        return Ok(product);
    }
    [HttpPost]
    public async Task<IActionResult> CreateProduct([FromBody] MasterProduct masterProduct)
    {
        await _productService.CreateMasterProductAsync(masterProduct);
        return StatusCode(StatusCodes.Status201Created, new
        {
            message = "Tạo product thành công."
        });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateProduct([FromRoute] string Id, [FromBody] MasterProduct materProduct)
    {
        await _productService.UpdateMasterProductAsync(Guid.Parse(Id), materProduct);
        return NoContent();
    }

    [HttpDelete("delete/{Id}")]
    public async Task<IActionResult> DeleteProduct([FromRoute] string Id)
    {
        await _productService.DeleteMasterProductAsync(Guid.Parse(Id));
        return NoContent();
    }

    [HttpGet("search")]
    public async Task<IActionResult> SearchProducts([FromQuery] string fieldName, [FromQuery] string keyword)
    {
        var products = await _productService.SearchByFieldAsync(fieldName, keyword);
        return Ok(products ?? []);
    }


    [HttpPost("insertmany")]
    public async Task<IActionResult> Insert(IFormFile file)
    {

        if (file == null || file.Length == 0)
        {
            return BadRequest("Vui lòng chọn file Excel để import");
        }
        string[] allowedExtension = [".xlsx"];
        string fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!allowedExtension.Contains(fileExtension))
        {
            return BadRequest("Định dạng không hợp lệ");
        }
        using (var stream = file.OpenReadStream())
        {
            await excelService.HandleFileImport(stream, "product");
            return StatusCode(StatusCodes.Status201Created, new { message = "insert many thành công" });
        }
    }


    [HttpGet("patternFile")]
    public async Task<IActionResult> DownloadPatternFile()
    {
        try
        {
            var (fileBytes, typeName, fileName) = await excelService.GetContentTypeAsync<MasterProduct>();
            return File(fileBytes, typeName, fileName);
        } catch(Exception ex)
        {
            throw ex;
        }
    }
}