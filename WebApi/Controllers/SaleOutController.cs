using Microsoft.AspNetCore.Mvc;
using WebApi.Services;
using WebApi.Entities;
namespace WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SaleOutController : ControllerBase
{
    private readonly SaleOutService saleOutService;
    public SaleOutController(SaleOutService saleOutService)
    {
        this.saleOutService = saleOutService;
    }

    [HttpGet]
    public async Task<IActionResult> GetSaleOut([FromQuery] string? fieldName, [FromQuery] string? keyword)
    {
        var results = await saleOutService.GetSaleOutsAsync(fieldName, keyword);
        return Ok(results);
    }

    [HttpGet("details/{id}")]
    public async Task<IActionResult> GetDetails([FromRoute] string Id)
    {
        var result = await saleOutService.GetSaleOutByIdAsync(Guid.Parse(Id));
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> CreateSaleOut([FromBody] SaleOut saleOut)
    {
        await saleOutService.CreateSaleOutAsync(saleOut);
        return StatusCode(StatusCodes.Status201Created, new
        {
            message = "Create successFully."
        });

    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteSaleOut([FromRoute]string Id)
    {
        await saleOutService.DeleteSaleOutAsync(Guid.Parse(Id));
        return NoContent();
    }
}