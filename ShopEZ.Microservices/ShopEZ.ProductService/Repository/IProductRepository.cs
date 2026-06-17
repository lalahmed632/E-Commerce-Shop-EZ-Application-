using ShopEZ.ProductService.Dto;

namespace ShopEZ.ProductService.Repo;

public interface IProductRepository
{
    Task<IReadOnlyList<ProductDto>> GetAllAsync();
    Task<ProductDto?> GetByIdAsync(int id);
    Task<ProductDto> CreateAsync(ProductUpsertDto dto);
    Task<bool> UpdateAsync(int id, ProductUpsertDto dto);
    Task<bool> IsReferencedInOrdersAsync(int id);
    Task<bool> DeleteAsync(int id);
    Task<(bool Success, string? Message)> ReduceStockAsync(IReadOnlyList<ReduceStockItem> items);
}
