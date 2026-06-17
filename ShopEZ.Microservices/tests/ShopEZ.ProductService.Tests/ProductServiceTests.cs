using Xunit;
using Moq;
using ShopEZ.ProductService.Dto;
using ShopEZ.ProductService.Repo;
using ShopEZ.ProductService.Services;

namespace ShopEZ.ProductService.Tests;

public class ProductServiceTests
{
    [Fact]
    public async Task CreateAsync_NormalizesInput_BeforeRepositoryCall()
    {
        var repo = new Mock<IProductRepository>();
        repo.Setup(r => r.CreateAsync(It.IsAny<ProductUpsertDto>()))
            .ReturnsAsync(new ProductDto { ProductId = 1, Name = "X", Category = "General" });

        var service = new ShopEZ.ProductService.Services.ProductService(repo.Object);
        var dto = new ProductUpsertDto
        {
            Name = "  Phone  ",
            Description = "  Nice  ",
            Category = "  ",
            ImageUrl = "  images/p.jpg  ",
            Price = 10,
            Stock = 2
        };

        await service.CreateAsync(dto);

        repo.Verify(r => r.CreateAsync(It.Is<ProductUpsertDto>(x =>
            x.Name == "Phone" &&
            x.Description == "Nice" &&
            x.Category == "General" &&
            x.ImageUrl == "images/p.jpg")), Times.Once);
    }
}

