using System.ComponentModel.DataAnnotations;

namespace ShopEZ.CartService.Dto;

public sealed class CartItemDto
{
    [Range(1, int.MaxValue)]
    public int ProductId { get; set; }

    [Required]
    [MaxLength(150)]
    public string Name { get; set; } = string.Empty;

    [Range(typeof(decimal), "0", "999999999")]
    public decimal Price { get; set; }

    [Required]
    [MaxLength(500)]
    public string ImageUrl { get; set; } = string.Empty;

    [Range(1, 99)]
    public int Quantity { get; set; }

    [Range(0, int.MaxValue)]
    public int Stock { get; set; }
}
