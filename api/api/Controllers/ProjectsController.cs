using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Api.Models;
using Api.DTOs;

namespace Api.Controllers;

[Route("api/projects")]
[ApiController]
public class ProjectsController : ControllerBase
{
    private readonly TaskContext _context;

    public ProjectsController(TaskContext context)
    {
        _context = context;
    }

    // GET: api/projects
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProjectDto>>> GetProjects()
    {
        return await _context.Projects
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
        var project = await _context.Projects
            .Where(p => p.Id == id)
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
        var project = new Project { Name = dto.Name, Description = dto.Description };
        _context.Projects.Add(project);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetProject), new { id = project.Id }, new ProjectDto { Id = project.Id, Name = project.Name, Description = project.Description });
    }

    // PUT: api/projects/5
    [HttpPut("{id}")]
    public async Task<IActionResult> PutProject(int id, ProjectDto dto)
    {
        if (id != dto.Id) return BadRequest();

        var project = await _context.Projects.FindAsync(id);
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
        var project = await _context.Projects.FindAsync(id);
        if (project == null) return NotFound();

        _context.Projects.Remove(project);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
