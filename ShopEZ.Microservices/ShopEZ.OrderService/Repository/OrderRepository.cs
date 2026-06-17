using Microsoft.EntityFrameworkCore;
using ShopEZ.OrderService.Data;
using ShopEZ.OrderService.Models;

namespace ShopEZ.OrderService.Repo;

public sealed class OrderRepository : IOrderRepository
{
    private readonly OrderDbContext _db;

    public OrderRepository(OrderDbContext db)
    {
        _db = db;
    }

    public async Task AddAsync(Order order)
    {
        _db.Orders.Add(order);
        await _db.SaveChangesAsync();
    }

    public Task<List<Order>> GetAllAsync()
    {
        return _db.Orders.Include(o => o.Items).AsNoTracking().OrderByDescending(o => o.OrderDate).ToListAsync();
    }

    public Task<List<Order>> GetByUserIdAsync(int userId)
    {
        return _db.Orders.Include(o => o.Items).AsNoTracking().Where(o => o.UserId == userId).OrderByDescending(o => o.OrderDate).ToListAsync();
    }

    public Task<Order?> GetByIdAsync(int id)
    {
        return _db.Orders.Include(o => o.Items).AsNoTracking().FirstOrDefaultAsync(o => o.OrderId == id);
    }
}
