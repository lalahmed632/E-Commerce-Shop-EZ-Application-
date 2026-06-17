using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShopEZ.CartService.Dto;
using ShopEZ.CartService.Services;

namespace ShopEZ.CartService.Controllers;

[ApiController]
[Route("api/cart")]
[Authorize]
public sealed class CartController : ControllerBase
{
    private readonly ICartService _cartService;

    public CartController(ICartService cartService)
    {
        _cartService = cartService;
    }

    [HttpGet]
    public ActionResult<List<CartItemDto>> Get()
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized(new { message = "Invalid user identity." });
        }

        return Ok(_cartService.Get(userId));
    }

    [HttpPost("sync")]
    public ActionResult<List<CartItemDto>> Sync([FromBody] List<CartItemDto> items)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);

        if (!TryGetUserId(out var userId))
        {
            return Unauthorized(new { message = "Invalid user identity." });
        }

        var result = _cartService.Sync(userId, items);
        if (!result.Success) return StatusCode(result.StatusCode, new { message = result.ErrorMessage });
        return Ok(result.Data);
    }

    [HttpDelete]
    public IActionResult Clear()
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized(new { message = "Invalid user identity." });
        }

        _cartService.Clear(userId);
        return NoContent();
    }

    private bool TryGetUserId(out int userId)
    {
        var idValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(idValue, out userId) && userId > 0;
    }
}
