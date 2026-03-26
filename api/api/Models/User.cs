namespace Api.Models;

public class User
{
    public int Id { get; set; }
    public required string Email { get; set; }
    public required string PasswordHash { get; set; }

    [System.Text.Json.Serialization.JsonIgnore]
    public ICollection<Project> Projects { get; set; } = [];
}
