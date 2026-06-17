using Xunit;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ShopEZ.CartService.Controllers;
using ShopEZ.CartService.Dto;
using ShopEZ.CartService.Services;
using Moq;

namespace ShopEZ.CartService.Tests;

public class CartControllerTests
{
    [Fact]
    public void Sync_ThenGet_ReturnsItems()
    {
        var service = new Mock<ICartService>();
        var items = new List<CartItemDto> { new() { ProductId = 1, Name = "A", Price = 10, Quantity = 2, Stock = 5 } };
        service.Setup(s => s.Sync(1, It.IsAny<IReadOnlyList<CartItemDto>>())).Returns(new ServiceResult<List<CartItemDto>>
        {
            Success = true,
            StatusCode = StatusCodes.Status200OK,
            Data = items
        });
        service.Setup(s => s.Get(1)).Returns(items);

        var controller = new CartController(service.Object);
        controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext
            {
                User = new ClaimsPrincipal(new ClaimsIdentity(new[] { new Claim(ClaimTypes.NameIdentifier, "1") }, "test"))
            }
        };

        var syncResult = controller.Sync(items);
        var getResult = controller.Get();

        var ok1 = Assert.IsType<OkObjectResult>(syncResult.Result);
        var ok2 = Assert.IsType<OkObjectResult>(getResult.Result);
        var synced = Assert.IsType<List<CartItemDto>>(ok1.Value);
        var fetched = Assert.IsType<List<CartItemDto>>(ok2.Value);
        Assert.Single(synced);
        Assert.Single(fetched);
    }
}


