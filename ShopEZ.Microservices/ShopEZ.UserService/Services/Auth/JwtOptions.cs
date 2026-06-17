namespace ShopEZ.UserService.Services;

public sealed class JwtOptions
{
    public string Issuer { get; set; } = "ShopEZ";
    public string Audience { get; set; } = "ShopEZ.Frontend";
    public string Key { get; set; } = "ChangeThisToStrongDevelopmentKey_12345";
    public int ExpiryMinutes { get; set; } = 240;
}
