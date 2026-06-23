using WebApi.Services;
using Microsoft.AspNetCore.Mvc;
using WebApi.Entities;

namespace WebApi.Controllers;


[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly MasterProductService _productService; 
    public ProductsController(MasterProductService productService)
    {
        _productService = productService;
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
    public async Task<IActionResult> UpdateProduct([FromRoute] string Id,[FromBody] MasterProduct materProduct)
    {
        await _productService.UpdateMasterProductAsync(Guid.Parse(Id),materProduct);
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
}