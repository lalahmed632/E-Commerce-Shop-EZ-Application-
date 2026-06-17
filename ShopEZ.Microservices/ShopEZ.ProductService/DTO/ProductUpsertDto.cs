using System.ComponentModel.DataAnnotations;

namespace ShopEZ.ProductService.Dto;

public sealed class ProductUpsertDto
{
    [Required]
    public string Name { get; set; } = string.Empty;
    [Required]
    public string Description { get; set; } = string.Empty;
    [Required]
    public string Category { get; set; } = "General";
    [Range(typeof(decimal), "0.01", "999999999")]
    public decimal Price { get; set; }
    [Required]
    public string ImageUrl { get; set; } = string.Empty;
    [Range(0, int.MaxValue)]
    public int Stock { get; set; }
}
