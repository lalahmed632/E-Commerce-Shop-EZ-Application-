using System.ComponentModel.DataAnnotations;

namespace ShopEZ.OrderService.Dto;

public sealed class CreateOrderRequest
{
    [Required]
    [MinLength(1)]
    public List<CreateOrderItemRequest> Items { get; set; } = [];
}

public sealed class CreateOrderItemRequest
{
    [Range(1, int.MaxValue)]
    public int ProductId { get; set; }

    [Range(1, 99)]
    public int Quantity { get; set; }
}
