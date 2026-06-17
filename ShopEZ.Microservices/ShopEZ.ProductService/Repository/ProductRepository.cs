using Dapper;
using Microsoft.Data.SqlClient;
using ShopEZ.ProductService.Dto;

namespace ShopEZ.ProductService.Repo;

public sealed class ProductRepository : IProductRepository
{
    private readonly string _connectionString;
    private readonly string _orderConnectionString;

    public ProductRepository(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("ProductDb") ?? "Server=(localdb)\\MSSQLLocalDB;Database=ShopEZ_ProductDb;Trusted_Connection=True;TrustServerCertificate=True;";
        var orderDb = configuration.GetConnectionString("OrderDb");
        if (!string.IsNullOrWhiteSpace(orderDb))
        {
            _orderConnectionString = orderDb;
        }
        else
        {
            var builder = new SqlConnectionStringBuilder(_connectionString)
            {
                InitialCatalog = "ShopEZ_OrderDb"
            };
            _orderConnectionString = builder.ConnectionString;
        }
    }

    public async Task<IReadOnlyList<ProductDto>> GetAllAsync()
    {
        const string sql = "SELECT ProductId, Name, Description, Category, Price, ImageUrl, Stock FROM Products ORDER BY ProductId";
        await using var connection = new SqlConnection(_connectionString);
        var rows = await connection.QueryAsync<ProductDto>(sql);
        return rows.ToList();
    }

    public async Task<ProductDto?> GetByIdAsync(int id)
    {
        const string sql = "SELECT ProductId, Name, Description, Category, Price, ImageUrl, Stock FROM Products WHERE ProductId = @id";
        await using var connection = new SqlConnection(_connectionString);
        return await connection.QuerySingleOrDefaultAsync<ProductDto>(sql, new { id });
    }

    public async Task<ProductDto> CreateAsync(ProductUpsertDto dto)
    {
        const string sql = @"INSERT INTO Products (Name, Description, Category, Price, ImageUrl, Stock)
VALUES (@Name, @Description, @Category, @Price, @ImageUrl, @Stock);
SELECT CAST(SCOPE_IDENTITY() AS INT);";

        await using var connection = new SqlConnection(_connectionString);
        var id = await connection.ExecuteScalarAsync<int>(sql, dto);
        return (await GetByIdAsync(id))!;
    }

    public async Task<bool> UpdateAsync(int id, ProductUpsertDto dto)
    {
        const string sql = @"UPDATE Products
SET Name=@Name, Description=@Description, Category=@Category, Price=@Price, ImageUrl=@ImageUrl, Stock=@Stock
WHERE ProductId=@id";

        await using var connection = new SqlConnection(_connectionString);
        var affected = await connection.ExecuteAsync(sql, new { id, dto.Name, dto.Description, dto.Category, dto.Price, dto.ImageUrl, dto.Stock });
        return affected > 0;
    }

    public async Task<bool> IsReferencedInOrdersAsync(int id)
    {
        const string sql = "SELECT TOP(1) 1 FROM OrderItems WHERE ProductId=@id";
        try
        {
            await using var connection = new SqlConnection(_orderConnectionString);
            var marker = await connection.ExecuteScalarAsync<int?>(sql, new { id });
            return marker.HasValue;
        }
        catch (SqlException)
        {
            // If order DB is unavailable, don't block standard catalog operations.
            return false;
        }
    }

    public async Task<bool> DeleteAsync(int id)
    {
        const string sql = "DELETE FROM Products WHERE ProductId=@id";
        await using var connection = new SqlConnection(_connectionString);
        var affected = await connection.ExecuteAsync(sql, new { id });
        return affected > 0;
    }

    public async Task<(bool Success, string? Message)> ReduceStockAsync(IReadOnlyList<ReduceStockItem> items)
    {
        await using var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync();
        await using var transaction = await connection.BeginTransactionAsync();

        foreach (var item in items)
        {
            const string getSql = "SELECT ProductId, Name, Stock FROM Products WHERE ProductId=@id";
            var product = await connection.QuerySingleOrDefaultAsync<(int ProductId, string Name, int Stock)>(
                getSql,
                new { id = item.ProductId },
                transaction);

            if (product.ProductId == 0)
            {
                await transaction.RollbackAsync();
                return (false, $"Product {item.ProductId} not found.");
            }

            if (product.Stock < item.Quantity)
            {
                await transaction.RollbackAsync();
                return (false, $"Insufficient stock for {product.Name}.");
            }
        }

        foreach (var item in items)
        {
            const string updateSql = "UPDATE Products SET Stock = Stock - @qty WHERE ProductId = @id";
            await connection.ExecuteAsync(updateSql, new { id = item.ProductId, qty = item.Quantity }, transaction);
        }

        await transaction.CommitAsync();
        return (true, null);
    }
}
