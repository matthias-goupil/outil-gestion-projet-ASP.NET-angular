namespace Api.DTOs;

public class RegisterDto
{
    public required string Email { get; set; }
    public required string Password { get; set; }
    public required string FirstName { get; set; }
    public required string LastName { get; set; }
}

public class LoginDto
{
    public required string Email { get; set; }
    public required string Password { get; set; }
}

public class AuthResponseDto
{
    public required string Token { get; set; }
    public required string Email { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
}
