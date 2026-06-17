using System.ComponentModel.DataAnnotations;

namespace ShopEZ.ProductService.Models;

public sealed class Product
{
    public int ProductId { get; set; }

    [Required]
    [MaxLength(150)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MaxLength(2000)]
    public string Description { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string Category { get; set; } = "General";

    [Range(typeof(decimal), "0.01", "999999999")]
    public decimal Price { get; set; }

    [Required]
    [MaxLength(500)]
    public string ImageUrl { get; set; } = string.Empty;

    [Range(0, int.MaxValue)]
    public int Stock { get; set; }
}
