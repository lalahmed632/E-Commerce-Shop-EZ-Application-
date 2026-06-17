using Microsoft.AspNetCore.Http;
using ShopEZ.UserService.Dto;
using ShopEZ.UserService.Repo;

namespace ShopEZ.UserService.Services;

public sealed class AuthService : IAuthService
{
    private readonly IUserRepository _users;
    private readonly JwtTokenService _jwt;

    public AuthService(IUserRepository users, JwtTokenService jwt)
    {
        _users = users;
        _jwt = jwt;
    }

    public ServiceResult<AuthResponse> Login(LoginRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
        {
            return ServiceResultFactory.Fail<AuthResponse>(StatusCodes.Status400BadRequest, "Email and password are required.");
        }

        var user = _users.FindByEmail(request.Email ?? string.Empty);
        if (user is null || !PasswordHasher.Verify(request.Password, user.Password))
        {
            return ServiceResultFactory.Fail<AuthResponse>(StatusCodes.Status400BadRequest, "Invalid email or password.");
        }

        return ServiceResultFactory.Ok(_jwt.BuildResponse(user));
    }

    public ServiceResult<AuthResponse> Register(RegisterRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name) || string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
        {
            return ServiceResultFactory.Fail<AuthResponse>(StatusCodes.Status400BadRequest, "Name, email and password are required.");
        }

        try
        {
            var created = _users.Create(request.Name, request.Email, request.Password);
            return ServiceResultFactory.Ok(_jwt.BuildResponse(created), StatusCodes.Status201Created);
        }
        catch (InvalidOperationException ex)
        {
            return ServiceResultFactory.Fail<AuthResponse>(StatusCodes.Status409Conflict, ex.Message);
        }
    }
}
