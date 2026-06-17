using ShopEZ.OrderService.Dto;

namespace ShopEZ.OrderService.Services;

public interface IOrderService
{
    Task<ServiceResult<OrderDto>> CreateAsync(int userId, string userName, string userEmail, IReadOnlyList<CreateOrderItemRequest> items);
    Task<ServiceResult<IReadOnlyList<OrderDto>>> GetAllAsync(bool isAdmin, int userId);
    Task<ServiceResult<OrderDto>> GetByIdAsync(int id);
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
