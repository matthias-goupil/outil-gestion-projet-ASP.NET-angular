namespace Api.Models;

public class TaskItem
{
    public int Id { get; set; }
    public required string Title { get; set; }
    public string? Description { get; set; }
    public string? Content { get; set; }
    public required TaskStatus Status { get; set; }
    public int? Order { get; set; }
    public int ProjectId { get; set; }
    [System.Text.Json.Serialization.JsonIgnore]
    public Project? Project { get; set; }
    [System.Text.Json.Serialization.JsonIgnore]
    public ICollection<User> Assignees { get; set; } = [];
}
