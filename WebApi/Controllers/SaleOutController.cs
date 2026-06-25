using Microsoft.AspNetCore.Mvc;
using WebApi.Services;
using WebApi.Entities;
namespace WebApi.Controllers;
#nullable enable
[ApiController]
[Route("api/[controller]")]
public class SaleOutController : ControllerBase
{
    private readonly SaleOutService saleOutService;
    private readonly IExcelService excelService;
    public SaleOutController(SaleOutService saleOutService, IExcelService excelService)
    {
        this.saleOutService = saleOutService;
        this.excelService = excelService;
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

    [HttpPut("{Id}")]
    public async Task<IActionResult> UpdateSaleOut([FromRoute] string Id, [FromBody] SaleOutUpdate saleOutUpdate)
    {
        await saleOutService.UpdateSaleoutAsync(Guid.Parse(Id), saleOutUpdate);
        return NoContent();
    }
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteSaleOut([FromRoute]string Id)
    {
        await saleOutService.DeleteSaleOutAsync(Guid.Parse(Id));
        return NoContent();
    }
    [HttpGet("download")]
    public async Task<IActionResult> DownloadTemplateFile()
    {
        try
        {
            var (fileBytes, typeName, fileName) = await excelService.GetContentTypeAsync<SaleOut>();
            return File(fileBytes, typeName, fileName);
        } catch (Exception ex)
        {
            throw ex;
        }
    }

    [HttpPost("upload")]
    public async Task<IActionResult> UploadFileData(IFormFile file)
    {
        if(file == null || file.Length < 0)
        {
            return BadRequest("Vui lòng chọn file");
        }

        string[] allowdExtension = [".xlsx", ".xls"];
        string fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if(!allowdExtension.Contains(fileExtension))
        {
            return BadRequest("File Không hợp lệ");
        }
        try
        {
            using(var stream = file.OpenReadStream())
            {
                await excelService.HandleFileImport(stream, "sale");
                return StatusCode(StatusCodes.Status201Created, new
                {
                    Message = "insert thành công"
                });
            }
        } catch (Exception ex)
        {
            throw ex;
        }
    }
}