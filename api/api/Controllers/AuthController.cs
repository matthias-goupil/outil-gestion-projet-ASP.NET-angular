using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Api.DTOs;
using Api.Models;

namespace Api.Controllers;

[Route("api/auth")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly TaskContext _context;
    private readonly IConfiguration _config;

    public AuthController(TaskContext context, IConfiguration config)
    {
        _context = context;
        _config = config;
    }

    private int GetUserId() => int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

    // POST: api/auth/register
    [HttpPost("register")]
    public async Task<ActionResult<AuthResponseDto>> Register(RegisterDto dto)
    {
        if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
            return Conflict(new { message = "Cette adresse email est déjà utilisée." });

        var user = new User
        {
            Email = dto.Email.ToLower(),
            PasswordHash = HashPassword(dto.Password),
            FirstName = dto.FirstName.Trim(),
            LastName = dto.LastName.Trim()
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return Ok(new AuthResponseDto { Token = GenerateToken(user), Email = user.Email, FirstName = user.FirstName, LastName = user.LastName });
    }

    // POST: api/auth/login
    [HttpPost("login")]
    public async Task<ActionResult<AuthResponseDto>> Login(LoginDto dto)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email.ToLower());

        if (user == null || !VerifyPassword(dto.Password, user.PasswordHash))
            return Unauthorized(new { message = "Email ou mot de passe incorrect." });

        return Ok(new AuthResponseDto { Token = GenerateToken(user), Email = user.Email, FirstName = user.FirstName, LastName = user.LastName });
    }

    // PUT: api/auth/me
    [Authorize]
    [HttpPut("me")]
    public async Task<ActionResult<AuthResponseDto>> UpdateProfile(UpdateProfileDto dto)
    {
        var userId = GetUserId();
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return NotFound();

        var newEmail = dto.Email.ToLower().Trim();
        if (await _context.Users.AnyAsync(u => u.Email == newEmail && u.Id != userId))
            return Conflict(new { message = "Cette adresse email est déjà utilisée." });

        user.FirstName = dto.FirstName.Trim();
        user.LastName = dto.LastName.Trim();
        user.Email = newEmail;

        if (!string.IsNullOrWhiteSpace(dto.NewPassword))
            user.PasswordHash = HashPassword(dto.NewPassword);

        await _context.SaveChangesAsync();

        return Ok(new AuthResponseDto { Token = GenerateToken(user), Email = user.Email, FirstName = user.FirstName, LastName = user.LastName });
    }

    private string GenerateToken(User user)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email)
        };

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(24),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private static string HashPassword(string password)
    {
        var salt = RandomNumberGenerator.GetBytes(16);
        var hash = Rfc2898DeriveBytes.Pbkdf2(
            Encoding.UTF8.GetBytes(password), salt, 350_000,
            HashAlgorithmName.SHA512, 32);
        return $"{Convert.ToBase64String(salt)}:{Convert.ToBase64String(hash)}";
    }

    private static bool VerifyPassword(string password, string storedHash)
    {
        var parts = storedHash.Split(':');
        if (parts.Length != 2) return false;
        var salt = Convert.FromBase64String(parts[0]);
        var expectedHash = Convert.FromBase64String(parts[1]);
        var hash = Rfc2898DeriveBytes.Pbkdf2(
            Encoding.UTF8.GetBytes(password), salt, 350_000,
            HashAlgorithmName.SHA512, 32);
        return CryptographicOperations.FixedTimeEquals(hash, expectedHash);
    }
}
