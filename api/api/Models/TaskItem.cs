namespace Api.Models;

public class TaskItem
{
    public int Id { get; set; }
    public required string Title { get; set; }

    public string? Content {get; set;}
    public required TaskStatus Status {get; set;}
    public int? Order {get; set;}
}