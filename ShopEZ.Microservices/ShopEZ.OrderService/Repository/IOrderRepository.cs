using ShopEZ.OrderService.Models;

namespace ShopEZ.OrderService.Repo;

public interface IOrderRepository
{
    Task AddAsync(Order order);
    Task<List<Order>> GetAllAsync();
    Task<List<Order>> GetByUserIdAsync(int userId);
    Task<Order?> GetByIdAsync(int id);
}
