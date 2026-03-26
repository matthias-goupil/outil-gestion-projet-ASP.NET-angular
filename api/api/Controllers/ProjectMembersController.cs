using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Api.Models;
using Api.DTOs;

namespace Api.Controllers;

[Authorize]
[Route("api/projects/{projectId}/members")]
[ApiController]
public class ProjectMembersController : ControllerBase
{
    private readonly TaskContext _context;

    public ProjectMembersController(TaskContext context)
    {
        _context = context;
    }

    private int GetUserId() => int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

    private async Task<Project?> GetOwnedProject(int projectId) =>
        await _context.Projects
            .Include(p => p.Users)
            .FirstOrDefaultAsync(p => p.Id == projectId && p.Users.Any(u => u.Id == GetUserId()));

    // GET: api/projects/5/members
    [HttpGet]
    public async Task<ActionResult<IEnumerable<MemberDto>>> GetMembers(int projectId)
    {
        var project = await GetOwnedProject(projectId);
        if (project == null) return NotFound();

        return project.Users
            .Select(u => new MemberDto { Id = u.Id, Email = u.Email, FirstName = u.FirstName, LastName = u.LastName })
            .ToList();
    }

    // POST: api/projects/5/members
    [HttpPost]
    public async Task<ActionResult<MemberDto>> AddMember(int projectId, AddMemberDto dto)
    {
        var project = await GetOwnedProject(projectId);
        if (project == null) return NotFound();

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email.ToLower());
        if (user == null)
            return NotFound(new { message = "Aucun utilisateur avec cet email." });

        if (project.Users.Any(u => u.Id == user.Id))
            return Conflict(new { message = "Cet utilisateur est déjà membre du projet." });

        project.Users.Add(user);
        await _context.SaveChangesAsync();

        return Ok(new MemberDto { Id = user.Id, Email = user.Email });
    }

    // DELETE: api/projects/5/members/3
    [HttpDelete("{userId}")]
    public async Task<IActionResult> RemoveMember(int projectId, int userId)
    {
        var project = await GetOwnedProject(projectId);
        if (project == null) return NotFound();

        if (userId == GetUserId())
            return BadRequest(new { message = "Vous ne pouvez pas vous retirer vous-même." });

        var member = project.Users.FirstOrDefault(u => u.Id == userId);
        if (member == null) return NotFound();

        project.Users.Remove(member);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
