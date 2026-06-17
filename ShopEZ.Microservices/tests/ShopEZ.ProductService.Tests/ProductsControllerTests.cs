using Xunit;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Moq;
using ShopEZ.ProductService.Controllers;
using ShopEZ.ProductService.Dto;
using ShopEZ.ProductService.Services;

namespace ShopEZ.ProductService.Tests;

public class ProductsControllerTests
{
    [Fact]
    public async Task GetProductById_NotFound_Returns404()
    {
        var service = new Mock<IProductService>();
        service.Setup(s => s.GetByIdAsync(100)).ReturnsAsync(new ServiceResult<ProductDto>
        {
            Success = false,
            StatusCode = StatusCodes.Status404NotFound,
            ErrorMessage = "Product not found."
        });

        var config = new ConfigurationBuilder().AddInMemoryCollection().Build();
        var controller = new ProductsController(service.Object, config);
        var result = await controller.GetProductById(100);

        var response = Assert.IsType<ObjectResult>(result.Result);
        Assert.Equal(StatusCodes.Status404NotFound, response.StatusCode);
    }
}

