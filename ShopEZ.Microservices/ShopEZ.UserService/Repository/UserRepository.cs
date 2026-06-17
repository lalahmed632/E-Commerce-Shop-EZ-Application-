using ShopEZ.UserService.Data;
using ShopEZ.UserService.Models;
using ShopEZ.UserService.Services;

namespace ShopEZ.UserService.Repo;

public sealed class UserRepository : IUserRepository
{
    private readonly UserDbContext _db;

    public UserRepository(UserDbContext db)
    {
        _db = db;
    }

    public User? FindByEmail(string email)
    {
        var key = email.Trim().ToLowerInvariant();
        return _db.Users.FirstOrDefault(x => x.Email == key);
    }

    public User Create(string name, string email, string password)
    {
        var key = email.Trim().ToLowerInvariant();
        var exists = _db.Users.Any(x => x.Email == key);
        if (exists)
        {
            throw new InvalidOperationException("Email already exists.");
        }

        var user = new User
        {
            Name = name.Trim(),
            Email = key,
            Password = PasswordHasher.Hash(password),
            Role = "Customer"
        };

        _db.Users.Add(user);
        _db.SaveChanges();
        return user;
    }

    public bool HasUsers()
    {
        return _db.Users.Any();
    }

    public void SeedUsers(IEnumerable<User> users)
    {
        _db.Users.AddRange(users);
        _db.SaveChanges();
    }
}
