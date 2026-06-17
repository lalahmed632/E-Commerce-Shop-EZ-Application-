using Microsoft.AspNetCore.Http;
using ShopEZ.CartService.Dto;
using ShopEZ.CartService.Models;
using ShopEZ.CartService.Repo;

namespace ShopEZ.CartService.Services;

public sealed class CartService : ICartService
{
    private readonly ICartRepository _repository;

    public CartService(ICartRepository repository)
    {
        _repository = repository;
    }

    public List<CartItemDto> Get(int userId)
    {
        return _repository.GetByUserId(userId)
            .Select(ToDto)
            .ToList();
    }

    public ServiceResult<List<CartItemDto>> Sync(int userId, IReadOnlyList<CartItemDto>? items)
    {
        if (items is null)
        {
            return new ServiceResult<List<CartItemDto>> { Success = false, StatusCode = StatusCodes.Status400BadRequest, ErrorMessage = "Cart items are required." };
        }

        if (items.Any(i => i.Quantity > i.Stock))
        {
            return new ServiceResult<List<CartItemDto>> { Success = false, StatusCode = StatusCodes.Status400BadRequest, ErrorMessage = "Quantity cannot be greater than stock." };
        }

        if (items.GroupBy(i => i.ProductId).Any(g => g.Count() > 1))
        {
            return new ServiceResult<List<CartItemDto>> { Success = false, StatusCode = StatusCodes.Status400BadRequest, ErrorMessage = "Duplicate product entries are not allowed in cart sync." };
        }

        var mapped = items.Select(x => new CartItem
        {
            UserId = userId,
            ProductId = x.ProductId,
            Name = x.Name,
            Price = x.Price,
            ImageUrl = x.ImageUrl,
            Quantity = x.Quantity,
            Stock = x.Stock
        }).ToList();

        _repository.ReplaceByUserId(userId, mapped);
        return new ServiceResult<List<CartItemDto>>
        {
            Success = true,
            StatusCode = StatusCodes.Status200OK,
            Data = mapped.Select(ToDto).ToList()
        };
    }

    public void Clear(int userId)
    {
        _repository.ClearByUserId(userId);
    }

    private static CartItemDto ToDto(CartItem item)
    {
        return new CartItemDto
        {
            ProductId = item.ProductId,
            Name = item.Name,
            Price = item.Price,
            ImageUrl = item.ImageUrl,
            Quantity = item.Quantity,
            Stock = item.Stock
        };
    }
}
