using ShopEZ.ProductService.Dto;

namespace ShopEZ.ProductService.Services;

public interface IProductService
{
    Task<ServiceResult<IReadOnlyList<ProductDto>>> GetAllAsync();
    Task<ServiceResult<ProductDto>> GetByIdAsync(int id);
    Task<ServiceResult<ProductDto>> CreateAsync(ProductUpsertDto dto);
    Task<ServiceResult> UpdateAsync(int id, ProductUpsertDto dto);
    Task<ServiceResult> DeleteAsync(int id);
    Task<ServiceResult> ReduceStockAsync(ReduceStockRequest request);
}

public class ServiceResult
{
    public bool Success { get; init; }
    public int StatusCode { get; init; }
    public string? ErrorMessage { get; init; }
}

public class ServiceResult<T> : ServiceResult
{
    public T? Data { get; init; }
}
