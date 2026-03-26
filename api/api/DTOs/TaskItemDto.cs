namespace Api.DTOs;

public class TaskItemDto
{
    public int Id { get; set; }
    public required string Title { get; set; }
    public string? Description { get; set; }
    public string? Content { get; set; }
    public required Api.Models.TaskStatus Status { get; set; }
    public int? Order { get; set; }
    public int ProjectId { get; set; }
    public List<MemberDto> Assignees { get; set; } = [];
    public List<int> AssigneeIds { get; set; } = [];
}

public class TaskItemCreateDto
{
    public required string Title { get; set; }
    public string? Description { get; set; }
    public string? Content { get; set; }
    public required Api.Models.TaskStatus Status { get; set; }
    public int? Order { get; set; }
    public List<int> AssigneeIds { get; set; } = [];
}
