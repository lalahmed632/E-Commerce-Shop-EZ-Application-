using Microsoft.AspNetCore.Http;
using ShopEZ.ProductService.Dto;
using ShopEZ.ProductService.Repo;

namespace ShopEZ.ProductService.Services;

public sealed class ProductService : IProductService
{
    private readonly IProductRepository _repository;

    public ProductService(IProductRepository repository)
    {
        _repository = repository;
    }

    public async Task<ServiceResult<IReadOnlyList<ProductDto>>> GetAllAsync()
    {
        var items = await _repository.GetAllAsync();
        return new ServiceResult<IReadOnlyList<ProductDto>> { Success = true, StatusCode = StatusCodes.Status200OK, Data = items };
    }

    public async Task<ServiceResult<ProductDto>> GetByIdAsync(int id)
    {
        var product = await _repository.GetByIdAsync(id);
        if (product is null)
        {
            return new ServiceResult<ProductDto> { Success = false, StatusCode = StatusCodes.Status404NotFound, ErrorMessage = "Product not found." };
        }

        return new ServiceResult<ProductDto> { Success = true, StatusCode = StatusCodes.Status200OK, Data = product };
    }

    public async Task<ServiceResult<ProductDto>> CreateAsync(ProductUpsertDto dto)
    {
        var created = await _repository.CreateAsync(Normalize(dto));
        return new ServiceResult<ProductDto> { Success = true, StatusCode = StatusCodes.Status201Created, Data = created };
    }

    public async Task<ServiceResult> UpdateAsync(int id, ProductUpsertDto dto)
    {
        var updated = await _repository.UpdateAsync(id, Normalize(dto));
        if (!updated)
        {
            return new ServiceResult { Success = false, StatusCode = StatusCodes.Status404NotFound, ErrorMessage = "Product not found." };
        }

        return new ServiceResult { Success = true, StatusCode = StatusCodes.Status204NoContent };
    }

    public async Task<ServiceResult> DeleteAsync(int id)
    {
        if (await _repository.IsReferencedInOrdersAsync(id))
        {
            return new ServiceResult
            {
                Success = false,
                StatusCode = StatusCodes.Status409Conflict,
                ErrorMessage = "This product has already been purchased. Set stock to 0 instead of deleting it."
            };
        }

        var deleted = await _repository.DeleteAsync(id);
        if (!deleted)
        {
            return new ServiceResult { Success = false, StatusCode = StatusCodes.Status404NotFound, ErrorMessage = "Product not found." };
        }

        return new ServiceResult { Success = true, StatusCode = StatusCodes.Status204NoContent };
    }

    public async Task<ServiceResult> ReduceStockAsync(ReduceStockRequest request)
    {
        var mergedItems = request.Items
            .GroupBy(x => x.ProductId)
            .Select(group => new ReduceStockItem
            {
                ProductId = group.Key,
                Quantity = group.Sum(item => item.Quantity)
            })
            .ToList();

        var result = await _repository.ReduceStockAsync(mergedItems);
        if (!result.Success)
        {
            return new ServiceResult { Success = false, StatusCode = StatusCodes.Status400BadRequest, ErrorMessage = result.Message ?? "Stock update failed." };
        }

        return new ServiceResult { Success = true, StatusCode = StatusCodes.Status204NoContent };
    }

    private static ProductUpsertDto Normalize(ProductUpsertDto dto)
    {
        dto.Name = dto.Name.Trim();
        dto.Description = dto.Description.Trim();
        dto.Category = string.IsNullOrWhiteSpace(dto.Category) ? "General" : dto.Category.Trim();
        dto.ImageUrl = dto.ImageUrl.Trim();
        return dto;
    }
}
