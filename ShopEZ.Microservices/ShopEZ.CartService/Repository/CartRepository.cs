using ShopEZ.CartService.Data;
using ShopEZ.CartService.Models;
using Microsoft.EntityFrameworkCore;
using System.Data;

namespace ShopEZ.CartService.Repo;

public sealed class CartRepository : ICartRepository
{
    private readonly CartDbContext _db;

    public CartRepository(CartDbContext db)
    {
        _db = db;
    }

    public List<CartItem> GetByUserId(int userId)
    {
        return _db.CartItems.Where(x => x.UserId == userId).ToList();
    }

    public void ReplaceByUserId(int userId, IReadOnlyList<CartItem> items)
    {
        using var tx = _db.Database.BeginTransaction(IsolationLevel.Serializable);
        var lockResource = $"cart-sync-user-{userId}";

        // Serialize cart sync per-user to avoid duplicate-key races when two sync
        // requests for the same user arrive at nearly the same time.
        _db.Database.ExecuteSqlInterpolated($@"
EXEC sp_getapplock
    @Resource = {lockResource},
    @LockMode = 'Exclusive',
    @LockOwner = 'Transaction',
    @LockTimeout = 10000");

        // ExecuteDelete avoids optimistic concurrency conflicts from stale tracked rows
        // when cart sync/clear requests race (for example after successful checkout).
        _db.CartItems.Where(x => x.UserId == userId).ExecuteDelete();

        if (items.Count != 0)
        {
            var normalized = items
                .GroupBy(i => i.ProductId)
                .Select(g =>
                {
                    var first = g.First();
                    return new CartItem
                    {
                        UserId = userId,
                        ProductId = g.Key,
                        Name = first.Name,
                        Price = first.Price,
                        ImageUrl = first.ImageUrl,
                        Stock = first.Stock,
                        Quantity = g.Sum(x => x.Quantity)
                    };
                })
                .ToList();

            _db.CartItems.AddRange(normalized);
            _db.SaveChanges();
        }

        tx.Commit();
    }

    public void ClearByUserId(int userId)
    {
        _db.CartItems.Where(x => x.UserId == userId).ExecuteDelete();
    }
}
