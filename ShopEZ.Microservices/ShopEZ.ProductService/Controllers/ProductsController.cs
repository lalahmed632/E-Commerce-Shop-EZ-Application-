using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShopEZ.ProductService.Dto;
using ShopEZ.ProductService.Services;

namespace ShopEZ.ProductService.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ProductsController : ControllerBase
{
    private readonly IProductService _productService;
    private readonly IConfiguration _configuration;

    public ProductsController(IProductService productService, IConfiguration configuration)
    {
        _productService = productService;
        _configuration = configuration;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<IReadOnlyList<ProductDto>>> GetProducts()
    {
        var result = await _productService.GetAllAsync();
        return StatusCode(result.StatusCode, result.Data);
    }

    [HttpGet("{id:int}")]
    [AllowAnonymous]
    public async Task<ActionResult<ProductDto>> GetProductById(int id)
    {
        var product = await _productService.GetByIdAsync(id);
        if (!product.Success) return StatusCode(product.StatusCode, new { message = product.ErrorMessage });
        return Ok(product.Data);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ProductDto>> CreateProduct([FromBody] ProductUpsertDto productDto)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);
        var createdProduct = await _productService.CreateAsync(productDto);
        return CreatedAtAction(nameof(GetProductById), new { id = createdProduct.Data!.ProductId }, createdProduct.Data);
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateProduct(int id, [FromBody] ProductUpsertDto productDto)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);
        var result = await _productService.UpdateAsync(id, productDto);
        if (!result.Success) return StatusCode(result.StatusCode, new { message = result.ErrorMessage });
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteProduct(int id)
    {
        var result = await _productService.DeleteAsync(id);
        if (!result.Success) return StatusCode(result.StatusCode, new { message = result.ErrorMessage });
        return NoContent();
    }

    [HttpPost("reduce-stock")]
    [AllowAnonymous]
    public async Task<IActionResult> ReduceStock([FromBody] ReduceStockRequest request)
    {
        var expectedKey = _configuration["InternalServiceKey"];
        var providedKey = Request.Headers["X-Internal-Key"].FirstOrDefault();
        if (string.IsNullOrWhiteSpace(expectedKey) || providedKey != expectedKey)
        {
            return Unauthorized(new { message = "Unauthorized internal request." });
        }

        if (!ModelState.IsValid) return ValidationProblem(ModelState);

        var result = await _productService.ReduceStockAsync(request);
        if (!result.Success)
        {
            return StatusCode(result.StatusCode, new { message = result.ErrorMessage });
        }

        return NoContent();
    }
}
