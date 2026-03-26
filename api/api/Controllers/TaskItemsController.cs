using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Api.Models;
using Api.DTOs;

namespace Api.Controllers;

[Authorize]
[Route("api/projects/{projectId}/tasks")]
[ApiController]
public class TaskItemsController : ControllerBase
{
    private readonly TaskContext _context;

    public TaskItemsController(TaskContext context)
    {
        _context = context;
    }

    private int GetUserId() => int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

    private async Task<bool> UserOwnsProject(int projectId) =>
        await _context.Projects.AnyAsync(p => p.Id == projectId && p.Users.Any(u => u.Id == GetUserId()));

    // GET: api/projects/5/tasks
    [HttpGet]
    public async Task<ActionResult<IEnumerable<TaskItemDto>>> GetTasks(int projectId)
    {
        if (!await UserOwnsProject(projectId)) return NotFound();

        return await _context.Tasks
            .Where(t => t.ProjectId == projectId)
            .Select(t => ToDto(t))
            .ToListAsync();
    }

    // GET: api/projects/5/tasks/3
    [HttpGet("{id}")]
    public async Task<ActionResult<TaskItemDto>> GetTaskItem(int projectId, int id)
    {
        if (!await UserOwnsProject(projectId)) return NotFound();

        var task = await _context.Tasks.FirstOrDefaultAsync(t => t.Id == id && t.ProjectId == projectId);
        if (task == null) return NotFound();
        return ToDto(task);
    }

    // POST: api/projects/5/tasks
    [HttpPost]
    public async Task<ActionResult<TaskItemDto>> PostTaskItem(int projectId, TaskItemCreateDto dto)
    {
        if (!await UserOwnsProject(projectId)) return NotFound();

        var task = new TaskItem
        {
            Title = dto.Title,
            Content = dto.Content,
            Status = dto.Status,
            Order = dto.Order,
            ProjectId = projectId
        };

        _context.Tasks.Add(task);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetTaskItem), new { projectId, id = task.Id }, ToDto(task));
    }

    // PUT: api/projects/5/tasks/3
    [HttpPut("{id}")]
    public async Task<IActionResult> PutTaskItem(int projectId, int id, TaskItemDto dto)
    {
        if (id != dto.Id || projectId != dto.ProjectId) return BadRequest();
        if (!await UserOwnsProject(projectId)) return NotFound();

        var task = await _context.Tasks.FirstOrDefaultAsync(t => t.Id == id && t.ProjectId == projectId);
        if (task == null) return NotFound();

        task.Title = dto.Title;
        task.Content = dto.Content;
        task.Status = dto.Status;
        task.Order = dto.Order;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    // DELETE: api/projects/5/tasks/3
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTaskItem(int projectId, int id)
    {
        if (!await UserOwnsProject(projectId)) return NotFound();

        var task = await _context.Tasks.FirstOrDefaultAsync(t => t.Id == id && t.ProjectId == projectId);
        if (task == null) return NotFound();

        _context.Tasks.Remove(task);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    private static TaskItemDto ToDto(TaskItem t) => new()
    {
        Id = t.Id,
        Title = t.Title,
        Content = t.Content,
        Status = t.Status,
        Order = t.Order,
        ProjectId = t.ProjectId
    };
}
