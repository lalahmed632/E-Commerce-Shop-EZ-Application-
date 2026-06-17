using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShopEZ.OrderService.Dto;
using ShopEZ.OrderService.Services;

namespace ShopEZ.OrderService.Controllers;

[ApiController]
[Route("api/orders")]
[Authorize]
public sealed class OrdersController : ControllerBase
{
    private readonly IOrderService _orderService;

    public OrdersController(IOrderService orderService)
    {
        _orderService = orderService;
    }

    [HttpPost]
    public async Task<ActionResult<OrderDto>> Create([FromBody] CreateOrderRequest request)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);
        var result = await _orderService.CreateAsync(
            UserId(),
            User.FindFirstValue(ClaimTypes.Name) ?? string.Empty,
            User.FindFirstValue(ClaimTypes.Email) ?? string.Empty,
            request.Items);

        if (!result.Success) return StatusCode(result.StatusCode, new { message = result.ErrorMessage });
        return StatusCode(StatusCodes.Status201Created, result.Data);
    }
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _orderService.GetAllAsync(User.IsInRole("Admin"), UserId());
        return StatusCode(result.StatusCode, result.Data);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var order = await _orderService.GetByIdAsync(id);
        if (!order.Success) return StatusCode(order.StatusCode, new { message = order.ErrorMessage });
        if (!User.IsInRole("Admin") && order.Data!.UserId != UserId()) return Forbid();
        return Ok(order.Data);
    }

    private int UserId()
    {
        var sub = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue(ClaimTypes.Name);
        return int.TryParse(sub, out var value) ? value : 0;
    }
}
