using ShopEZ.CartService.Dto;

namespace ShopEZ.CartService.Services;

public interface ICartService
{
    List<CartItemDto> Get(int userId);
    ServiceResult<List<CartItemDto>> Sync(int userId, IReadOnlyList<CartItemDto>? items);
    void Clear(int userId);
}

public class ServiceResult
{
    public bool Success { get; init; }
    public int StatusCode { get; init; }
    public string? ErrorMessage { get; init; }
}

public class ServiceResult<T> : ServiceResult
{
    public T? Data { get; init; }
}
