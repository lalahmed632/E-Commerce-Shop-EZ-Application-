using System.Security.Cryptography;
using System.Text;

namespace ShopEZ.UserService.Services;

public static class PasswordHasher
{
    public static string Hash(string password)
    {
        var saltBytes = RandomNumberGenerator.GetBytes(16);
        var salt = Convert.ToHexString(saltBytes).ToLowerInvariant();
        return HashWithSalt(password, salt);
    }

    private static string HashWithSalt(string password, string salt)
    {
        var hashBytes = SHA256.HashData(Encoding.UTF8.GetBytes(salt + password));
        var hash = Convert.ToHexString(hashBytes).ToLowerInvariant();
        return $"{salt}:{hash}";
    }

    public static bool Verify(string password, string storedPassword)
    {
        var parts = storedPassword.Split(':', 2);
        if (parts.Length != 2)
        {
            return false;
        }

        return HashWithSalt(password, parts[0]) == storedPassword;
    }
}
