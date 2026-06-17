using Microsoft.AspNetCore.Http;
using ShopEZ.UserService.Dto;

namespace ShopEZ.UserService.Services;

public interface IAuthService
{
    ServiceResult<AuthResponse> Login(LoginRequest request);
    ServiceResult<AuthResponse> Register(RegisterRequest request);
}

public class ServiceResult
{
    public bool Success { get; init; }
    public int StatusCode { get; init; }
    public string? ErrorMessage { get; init; }
}

public class ServiceResult<T> : ServiceResult
{
    public T? Data { get; init; }
}

public static class ServiceResultFactory
{
    public static ServiceResult<T> Ok<T>(T data, int statusCode = StatusCodes.Status200OK) => new()
    {
        Success = true,
        StatusCode = statusCode,
        Data = data
    };

    public static ServiceResult<T> Fail<T>(int statusCode, string message) => new()
    {
        Success = false,
        StatusCode = statusCode,
        ErrorMessage = message
    };
}
