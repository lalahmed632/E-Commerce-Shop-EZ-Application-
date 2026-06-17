using Microsoft.EntityFrameworkCore;
using ShopEZ.OrderService.Models;

namespace ShopEZ.OrderService.Data;

public sealed class OrderDbContext : DbContext
{
    public OrderDbContext(DbContextOptions<OrderDbContext> options) : base(options) { }

    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Order>().HasKey(x => x.OrderId);
        modelBuilder.Entity<OrderItem>().HasKey(x => x.Id);
        modelBuilder.Entity<Order>().HasMany(x => x.Items).WithOne().HasForeignKey(x => x.OrderId).OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<Order>().Property(x => x.TotalAmount).HasPrecision(18, 2);
        modelBuilder.Entity<OrderItem>().Property(x => x.Price).HasPrecision(18, 2);
        modelBuilder.Entity<OrderItem>().Property(x => x.LineTotal).HasPrecision(18, 2);
    }
}
