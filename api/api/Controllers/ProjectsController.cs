using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Api.Models;
using Api.DTOs;

namespace Api.Controllers;

[Authorize]
[Route("api/projects")]
[ApiController]
public class ProjectsController : ControllerBase
{
    private readonly TaskContext _context;

    public ProjectsController(TaskContext context)
    {
        _context = context;
    }

    private int GetUserId() => int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

    // GET: api/projects
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProjectDto>>> GetProjects()
    {
        var userId = GetUserId();
        return await _context.Projects
            .Where(p => p.Users.Any(u => u.Id == userId))
            .Select(p => new ProjectDto
            {
                Id = p.Id,
                Name = p.Name,
                Description = p.Description,
                TaskCount = _context.Tasks.Count(t => t.ProjectId == p.Id),
                CompletedCount = _context.Tasks.Count(t => t.ProjectId == p.Id && t.Status == Models.TaskStatus.Completed),
                InProgressCount = _context.Tasks.Count(t => t.ProjectId == p.Id && t.Status == Models.TaskStatus.InProgress)
            })
            .ToListAsync();
    }

    // GET: api/projects/5
    [HttpGet("{id}")]
    public async Task<ActionResult<ProjectDto>> GetProject(int id)
    {
        var userId = GetUserId();
        var project = await _context.Projects
            .Where(p => p.Id == id && p.Users.Any(u => u.Id == userId))
            .Select(p => new ProjectDto
            {
                Id = p.Id,
                Name = p.Name,
                Description = p.Description,
                TaskCount = _context.Tasks.Count(t => t.ProjectId == p.Id),
                CompletedCount = _context.Tasks.Count(t => t.ProjectId == p.Id && t.Status == Models.TaskStatus.Completed),
                InProgressCount = _context.Tasks.Count(t => t.ProjectId == p.Id && t.Status == Models.TaskStatus.InProgress)
            })
            .FirstOrDefaultAsync();

        if (project == null) return NotFound();
        return project;
    }

    // POST: api/projects
    [HttpPost]
    public async Task<ActionResult<ProjectDto>> PostProject(ProjectCreateDto dto)
    {
        var user = await _context.Users.FindAsync(GetUserId());
        if (user == null) return Unauthorized();

        var project = new Project { Name = dto.Name, Description = dto.Description };
        project.Users.Add(user);
        _context.Projects.Add(project);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetProject), new { id = project.Id },
            new ProjectDto { Id = project.Id, Name = project.Name, Description = project.Description });
    }

    // PUT: api/projects/5
    [HttpPut("{id}")]
    public async Task<IActionResult> PutProject(int id, ProjectDto dto)
    {
        if (id != dto.Id) return BadRequest();

        var userId = GetUserId();
        var project = await _context.Projects
            .Include(p => p.Users)
            .FirstOrDefaultAsync(p => p.Id == id && p.Users.Any(u => u.Id == userId));

        if (project == null) return NotFound();

        project.Name = dto.Name;
        project.Description = dto.Description;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    // DELETE: api/projects/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteProject(int id)
    {
        var userId = GetUserId();
        var project = await _context.Projects
            .Include(p => p.Users)
            .FirstOrDefaultAsync(p => p.Id == id && p.Users.Any(u => u.Id == userId));

        if (project == null) return NotFound();

        _context.Projects.Remove(project);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
