using ShopEZ.UserService.Models;

namespace ShopEZ.UserService.Repo;

public interface IUserRepository
{
    User? FindByEmail(string email);
    User Create(string name, string email, string password);
    bool HasUsers();
    void SeedUsers(IEnumerable<User> users);
}
