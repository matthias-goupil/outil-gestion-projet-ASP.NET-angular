namespace Api.Models;

public class Project
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public string? Description { get; set; }
    [System.Text.Json.Serialization.JsonIgnore]
    public ICollection<TaskItem> Tasks { get; set; } = [];
}
