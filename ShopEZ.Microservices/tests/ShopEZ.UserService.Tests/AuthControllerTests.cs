using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Moq;
using ShopEZ.UserService.Controllers;
using ShopEZ.UserService.Dto;
using ShopEZ.UserService.Services;
using Xunit;

namespace ShopEZ.UserService.Tests;

public class AuthControllerTests
{
    [Fact]
    public void Login_InvalidCredentials_ReturnsBadRequest()
    {
        var authService = new Mock<IAuthService>();
        authService.Setup(s => s.Login(It.IsAny<LoginRequest>())).Returns(new ServiceResult<AuthResponse>
        {
            Success = false,
            StatusCode = StatusCodes.Status400BadRequest,
            ErrorMessage = "Invalid email or password."
        });

        var controller = new AuthController(authService.Object);
        var result = controller.Login(new LoginRequest { Email = "admin@shopez.com", Password = "wrong" });

        var response = Assert.IsType<ObjectResult>(result.Result);
        Assert.Equal(StatusCodes.Status400BadRequest, response.StatusCode);
    }

    [Fact]
    public void Register_DuplicateEmail_ReturnsConflict()
    {
        var authService = new Mock<IAuthService>();
        authService
            .Setup(s => s.Register(It.IsAny<RegisterRequest>()))
            .Returns(new ServiceResult<AuthResponse>
            {
                Success = false,
                StatusCode = StatusCodes.Status409Conflict,
                ErrorMessage = "Email already exists."
            });

        var controller = new AuthController(authService.Object);
        var result = controller.Register(new RegisterRequest
        {
            Name = "Test",
            Email = "existing@shopez.com",
            Password = "Pass@123"
        });

        var response = Assert.IsType<ObjectResult>(result.Result);
        Assert.Equal(StatusCodes.Status409Conflict, response.StatusCode);
    }
}
