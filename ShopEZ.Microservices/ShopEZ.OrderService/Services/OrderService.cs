using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Http;
using ShopEZ.OrderService.Dto;
using ShopEZ.OrderService.Models;
using ShopEZ.OrderService.Repo;

namespace ShopEZ.OrderService.Services;

public sealed class OrderService : IOrderService
{
    private readonly IOrderRepository _repository;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _configuration;

    public OrderService(IOrderRepository repository, IHttpClientFactory httpClientFactory, IConfiguration configuration)
    {
        _repository = repository;
        _httpClientFactory = httpClientFactory;
        _configuration = configuration;
    }

    public async Task<ServiceResult<OrderDto>> CreateAsync(int userId, string userName, string userEmail, IReadOnlyList<CreateOrderItemRequest> items)
    {
        if (items.Count == 0) return new ServiceResult<OrderDto> { Success = false, StatusCode = StatusCodes.Status400BadRequest, ErrorMessage = "Order creation fails with empty cart." };

        var mergedItems = items
            .GroupBy(x => x.ProductId)
            .Select(group => new CreateOrderItemRequest
            {
                ProductId = group.Key,
                Quantity = group.Sum(item => item.Quantity)
            })
            .ToList();

        var orderItems = new List<OrderItemDto>();
        decimal total = 0;

        foreach (var requestItem in mergedItems)
        {
            var product = await GetProduct(requestItem.ProductId);
            if (product is null) return new ServiceResult<OrderDto> { Success = false, StatusCode = StatusCodes.Status404NotFound, ErrorMessage = $"Product {requestItem.ProductId} not found." };
            if (requestItem.Quantity > product.Stock) return new ServiceResult<OrderDto> { Success = false, StatusCode = StatusCodes.Status400BadRequest, ErrorMessage = $"Insufficient stock for {product.Name}." };

            var lineTotal = product.Price * requestItem.Quantity;
            total += lineTotal;
            orderItems.Add(new OrderItemDto
            {
                ProductId = product.ProductId,
                ProductName = product.Name,
                Quantity = requestItem.Quantity,
                Price = product.Price,
                LineTotal = lineTotal
            });
        }

        var reduceStockResult = await ReduceStock(mergedItems);
        if (!reduceStockResult.Success)
        {
            return new ServiceResult<OrderDto> { Success = false, StatusCode = StatusCodes.Status400BadRequest, ErrorMessage = reduceStockResult.Message ?? "Could not update product stock." };
        }

        var order = new Order
        {
            UserId = userId,
            UserEmail = userEmail,
            UserName = userName,
            OrderDate = DateTime.Now,
            TotalAmount = total,
            Items = orderItems.Select(i => new OrderItem
            {
                ProductId = i.ProductId,
                ProductName = i.ProductName,
                Quantity = i.Quantity,
                Price = i.Price,
                LineTotal = i.LineTotal
            }).ToList()
        };

        await _repository.AddAsync(order);
        return new ServiceResult<OrderDto> { Success = true, StatusCode = StatusCodes.Status201Created, Data = ToDto(order) };
    }

    public async Task<ServiceResult<IReadOnlyList<OrderDto>>> GetAllAsync(bool isAdmin, int userId)
    {
        var orders = isAdmin ? await _repository.GetAllAsync() : await _repository.GetByUserIdAsync(userId);
        return new ServiceResult<IReadOnlyList<OrderDto>>
        {
            Success = true,
            StatusCode = StatusCodes.Status200OK,
            Data = orders.Select(ToDto).ToList()
        };
    }

    public async Task<ServiceResult<OrderDto>> GetByIdAsync(int id)
    {
        var order = await _repository.GetByIdAsync(id);
        if (order is null)
        {
            return new ServiceResult<OrderDto> { Success = false, StatusCode = StatusCodes.Status404NotFound, ErrorMessage = "Order not found." };
        }

        return new ServiceResult<OrderDto> { Success = true, StatusCode = StatusCodes.Status200OK, Data = ToDto(order) };
    }

    private static OrderDto ToDto(Order o)
    {
        return new OrderDto
        {
            OrderId = o.OrderId,
            UserId = o.UserId,
            UserEmail = o.UserEmail,
            UserName = o.UserName,
            OrderDate = o.OrderDate,
            TotalAmount = o.TotalAmount,
            Items = o.Items.Select(i => new OrderItemDto
            {
                ProductId = i.ProductId,
                ProductName = i.ProductName,
                Quantity = i.Quantity,
                Price = i.Price,
                LineTotal = i.LineTotal
            }).ToList()
        };
    }

    private async Task<ProductDto?> GetProduct(int productId)
    {
        var client = _httpClientFactory.CreateClient("ProductServiceClient");
        var serviceUrl = _configuration["ServiceUrls:ProductService"];
        try
        {
            using var response = await client.GetAsync($"{serviceUrl}/api/products/{productId}");
            if (!response.IsSuccessStatusCode) return null;
            var json = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<ProductDto>(json, new JsonSerializerOptions(JsonSerializerDefaults.Web));
        }
        catch (HttpRequestException)
        {
            return null;
        }
        catch (TaskCanceledException)
        {
            return null;
        }
    }

    private async Task<(bool Success, string? Message)> ReduceStock(IReadOnlyList<CreateOrderItemRequest> items)
    {
        var client = _httpClientFactory.CreateClient("ProductServiceClient");
        var serviceUrl = _configuration["ServiceUrls:ProductService"];
        var internalKey = _configuration["ServiceAuth:InternalServiceKey"];
        if (string.IsNullOrWhiteSpace(internalKey))
        {
            return (false, "Order service internal key is not configured.");
        }

        client.DefaultRequestHeaders.Remove("X-Internal-Key");
        client.DefaultRequestHeaders.Add("X-Internal-Key", internalKey);
        var payload = new { items = items.Select(i => new { productId = i.ProductId, quantity = i.Quantity }) };
        HttpResponseMessage response;
        try
        {
            response = await client.PostAsJsonAsync($"{serviceUrl}/api/products/reduce-stock", payload);
        }
        catch (HttpRequestException)
        {
            return (false, "Could not reach product service.");
        }
        catch (TaskCanceledException)
        {
            return (false, "Product service timed out.");
        }

        using (response)
        {
            if (response.IsSuccessStatusCode)
            {
                return (true, null);
            }

            var responseBody = await response.Content.ReadAsStringAsync();
            if (string.IsNullOrWhiteSpace(responseBody))
            {
                return (false, "Could not update product stock.");
            }

            try
            {
                using var doc = JsonDocument.Parse(responseBody);
                if (doc.RootElement.TryGetProperty("message", out var message))
                {
                    return (false, message.GetString());
                }
            }
            catch (JsonException)
            {
            }

            return (false, "Could not update product stock.");
        }
    }
}
