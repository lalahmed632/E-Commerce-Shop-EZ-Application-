using Microsoft.EntityFrameworkCore;
using ShopEZ.UserService.Data;
using ShopEZ.UserService.Repo;
using Xunit;

namespace ShopEZ.UserService.Tests;

public class UserRepositoryTests
{
    [Fact]
    public void Create_DuplicateEmail_Throws()
    {
        var options = new DbContextOptionsBuilder<UserDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        using var db = new UserDbContext(options);
        var repo = new UserRepository(db);

        repo.Create("Admin", "admin@shopez.com", "pass");

        Assert.Throws<InvalidOperationException>(() => repo.Create("Another Admin", "admin@shopez.com", "pass"));
    }
}
