using System.ComponentModel.DataAnnotations;

namespace ShopEZ.ProductService.Dto;

public sealed class ReduceStockRequest
{
    [Required]
    [MinLength(1)]
    public List<ReduceStockItem> Items { get; set; } = [];
}

public sealed class ReduceStockItem
{
    [Range(1, int.MaxValue)]
    public int ProductId { get; set; }

    [Range(1, 99)]
    public int Quantity { get; set; }
}
