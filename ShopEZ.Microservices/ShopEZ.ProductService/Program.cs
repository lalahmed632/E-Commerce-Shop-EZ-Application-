using System.Text;
using System.Text.Json;
using Dapper;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Data.SqlClient;
using Microsoft.IdentityModel.Tokens;
using ShopEZ.ProductService.Repo;
using ShopEZ.ProductService.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddHealthChecks();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
        };
    });

builder.Services.AddAuthorization();
builder.Services.AddScoped<IProductRepository, ProductRepository>();
builder.Services.AddScoped<IProductService, ProductService>();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var config = scope.ServiceProvider.GetRequiredService<IConfiguration>();
    var cs = config.GetConnectionString("ProductDb") ?? "Server=(localdb)\\MSSQLLocalDB;Database=ShopEZ_ProductDb;Trusted_Connection=True;TrustServerCertificate=True;";
    var csBuilder = new SqlConnectionStringBuilder(cs);
    var databaseName = csBuilder.InitialCatalog;
    if (!string.IsNullOrWhiteSpace(databaseName))
    {
        var masterBuilder = new SqlConnectionStringBuilder(cs)
        {
            InitialCatalog = "master"
        };
        await using var masterConn = new SqlConnection(masterBuilder.ConnectionString);
        await masterConn.OpenAsync();
        await masterConn.ExecuteAsync($@"
IF DB_ID(N'{databaseName.Replace("'", "''")}') IS NULL
BEGIN
    CREATE DATABASE [{databaseName.Replace("]", "]]")}];
END");
    }

    await using var conn = new SqlConnection(cs);
    await conn.OpenAsync();
    await conn.ExecuteAsync(@"
IF OBJECT_ID('dbo.Products', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Products (
        ProductId INT IDENTITY(1,1) PRIMARY KEY,
        Name NVARCHAR(200) NOT NULL,
        Description NVARCHAR(1000) NOT NULL,
        Category NVARCHAR(100) NOT NULL,
        Price DECIMAL(18,2) NOT NULL,
        ImageUrl NVARCHAR(500) NOT NULL,
        Stock INT NOT NULL
    );
END");

    var count = await conn.ExecuteScalarAsync<long>("SELECT COUNT(1) FROM Products;");
    if (count == 0)
    {
        await conn.ExecuteAsync(@"
INSERT INTO Products (Name, Description, Category, Price, ImageUrl, Stock) VALUES
('Smart Watch', 'Fitness and notifications on your wrist', 'Electronics', 5999, 'images/SmartWatch.jpg', 20),
('TrailSip Travel Flask', 'Hot and cold insulated flask', 'Home', 799, 'images/TrailSip Travel Flask.jpg', 50),
('StrideFlex Joggers', 'Comfort stretch joggers', 'Fashion', 1299, 'images/StrideFlexJoggers.jpg', 35),
('PulseWave EarBuds', 'Wireless earbuds with mic', 'Electronics', 2499, 'images/PulseWaveEarBuds.jpg', 42),
('Classic Cotton T-Shirt', 'Soft breathable cotton tee', 'Fashion', 499, 'images/ClassicCottonTShirt.jpg', 120),
('Urban Backpack', 'Water-resistant daily backpack', 'Fashion', 1599, 'images/UrbanBackpack.jpg', 60),
('Aero Running Shoes', 'Lightweight shoes for daily run', 'Fashion', 2899, 'images/AeroRunningShoes.jpg', 48),
('ChefPro Knife Set', 'Stainless steel kitchen knife set', 'Home', 1999, 'images/ChefProKnifeSet.jpg', 30),
('PureAir Room Purifier', 'HEPA filter air purifier', 'Home', 7499, 'images/PureAirRoomPurifier.jpg', 18),
('CloudRest Pillow', 'Memory foam neck support pillow', 'Home', 899, 'images/CloudRestPillow.jpg', 75),
('Lumina Desk Lamp', 'Adjustable LED study lamp', 'Home', 1299, 'images/LuminaDeskLamp.jpg', 52),
('HydroMax Water Bottle', '1L insulated steel bottle', 'Home', 699, 'images/HydroMaxWaterBottle.jpg', 110),
('NeoTab 10', '10-inch tablet for study and media', 'Electronics', 15999, 'images/NeoTab10.jpg', 22),
('VoltX Power Bank', '20000mAh fast-charging power bank', 'Electronics', 2199, 'images/VoltXPowerBank.jpg', 66),
('EchoBeat Bluetooth Speaker', 'Portable speaker with deep bass', 'Electronics', 3499, 'images/EchoBeatSpeaker.jpg', 40),
('PixelCam 4K', 'Compact 4K action camera', 'Electronics', 11999, 'images/PixelCam4K.jpg', 14),
('ComfyFit Yoga Mat', 'Non-slip exercise yoga mat', 'Sports', 999, 'images/ComfyFitYogaMat.jpg', 57),
('ProGrip Dumbbells 10kg', 'Pair of ergonomic dumbbells', 'Sports', 2999, 'images/ProGripDumbbells.jpg', 25),
('RapidJump Rope', 'Adjustable speed skipping rope', 'Sports', 399, 'images/RapidJumpRope.jpg', 89),
('GameTime Football', 'Training football size 5', 'Sports', 799, 'images/GameTimeFootball.jpg', 44),
('TravelEase Suitcase', 'Hard-shell cabin luggage', 'Travel', 4599, 'images/TravelEaseSuitcase.jpg', 27),
('JetSet Neck Pillow', 'Travel pillow with chin support', 'Travel', 1099, 'images/JetSetNeckPillow.jpg', 70),
('TrailBlaze Hiking Pole', 'Lightweight trekking pole pair', 'Travel', 1899, 'images/TrailBlazeHikingPole.jpg', 33);");
    }
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseExceptionHandler(errorApp =>
{
    errorApp.Run(async context =>
    {
        context.Response.StatusCode = StatusCodes.Status500InternalServerError;
        context.Response.ContentType = "application/json";
        var response = new { message = "An unexpected error occurred." };
        await context.Response.WriteAsync(JsonSerializer.Serialize(response));
    });
});

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapHealthChecks("/health");
app.Run();
