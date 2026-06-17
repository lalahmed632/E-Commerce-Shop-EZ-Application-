using Microsoft.EntityFrameworkCore;
using ShopEZ.CartService.Models;

namespace ShopEZ.CartService.Data;

public sealed class CartDbContext : DbContext
{
    public CartDbContext(DbContextOptions<CartDbContext> options) : base(options) { }

    public DbSet<CartItem> CartItems => Set<CartItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<CartItem>().HasKey(x => x.Id);
        modelBuilder.Entity<CartItem>().HasIndex(x => new { x.UserId, x.ProductId }).IsUnique();
        modelBuilder.Entity<CartItem>().Property(x => x.Price).HasPrecision(18, 2);
    }
}
