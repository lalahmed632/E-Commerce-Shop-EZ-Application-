using ShopEZ.CartService.Models;

namespace ShopEZ.CartService.Repo;

public interface ICartRepository
{
    List<CartItem> GetByUserId(int userId);
    void ReplaceByUserId(int userId, IReadOnlyList<CartItem> items);
    void ClearByUserId(int userId);
}
