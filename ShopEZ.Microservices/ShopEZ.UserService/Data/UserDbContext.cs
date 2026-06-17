using Microsoft.EntityFrameworkCore;
using ShopEZ.UserService.Models;

namespace ShopEZ.UserService.Data;

public sealed class UserDbContext : DbContext
{
    public UserDbContext(DbContextOptions<UserDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>().HasKey(x => x.UserId);
        modelBuilder.Entity<User>().HasIndex(x => x.Email).IsUnique();
        modelBuilder.Entity<User>().Property(x => x.Name).HasMaxLength(80).IsRequired();
        modelBuilder.Entity<User>().Property(x => x.Email).HasMaxLength(120).IsRequired();
        modelBuilder.Entity<User>().Property(x => x.Password).HasMaxLength(100).IsRequired();
        modelBuilder.Entity<User>().Property(x => x.Role).HasMaxLength(30).IsRequired();
    }
}
