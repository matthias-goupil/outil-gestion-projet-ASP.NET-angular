namespace Api.DTOs;

public class ProjectDto
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public string? Description { get; set; }
    public int TaskCount { get; set; }
    public int CompletedCount { get; set; }
    public int InProgressCount { get; set; }
}

public class ProjectCreateDto
{
    public required string Name { get; set; }
    public string? Description { get; set; }
}
