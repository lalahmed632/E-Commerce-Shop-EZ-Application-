using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using ShopEZ.OrderService.Controllers;
using ShopEZ.OrderService.Dto;
using ShopEZ.OrderService.Services;
using Xunit;

namespace ShopEZ.OrderService.Tests;

public class OrdersControllerTests
{
    [Fact]
    public async Task Create_EmptyCart_ReturnsBadRequest()
    {
        var service = new Mock<IOrderService>();
        service
            .Setup(s => s.CreateAsync(It.IsAny<int>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<IReadOnlyList<CreateOrderItemRequest>>()))
            .ReturnsAsync(new ServiceResult<OrderDto>
            {
                Success = false,
                StatusCode = StatusCodes.Status400BadRequest,
                ErrorMessage = "Order creation fails with empty cart."
            });

        var controller = BuildController(service.Object);
        var result = await controller.Create(new CreateOrderRequest { Items = [] });

        var response = Assert.IsType<ObjectResult>(result.Result);
        Assert.Equal(StatusCodes.Status400BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Create_ValidOrder_ReturnsCreated()
    {
        var order = new OrderDto
        {
            OrderId = 1,
            UserId = 1,
            UserName = "Customer",
            UserEmail = "customer@shopez.com",
            TotalAmount = 2000
        };

        var service = new Mock<IOrderService>();
        service
            .Setup(s => s.CreateAsync(It.IsAny<int>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<IReadOnlyList<CreateOrderItemRequest>>()))
            .ReturnsAsync(new ServiceResult<OrderDto>
            {
                Success = true,
                StatusCode = StatusCodes.Status201Created,
                Data = order
            });

        var controller = BuildController(service.Object);
        var result = await controller.Create(new CreateOrderRequest
        {
            Items = [new CreateOrderItemRequest { ProductId = 1, Quantity = 2 }]
        });

        var created = Assert.IsType<ObjectResult>(result.Result);
        Assert.Equal(StatusCodes.Status201Created, created.StatusCode);
    }

    private static OrdersController BuildController(IOrderService service)
    {
        var controller = new OrdersController(service);
        controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext
            {
                User = new ClaimsPrincipal(new ClaimsIdentity(
                [
                    new Claim(ClaimTypes.NameIdentifier, "1"),
                    new Claim(ClaimTypes.Email, "customer@shopez.com"),
                    new Claim(ClaimTypes.Name, "Customer"),
                    new Claim(ClaimTypes.Role, "Customer")
                ], "test"))
            }
        };
        return controller;
    }
}
