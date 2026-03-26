using Microsoft.EntityFrameworkCore;

namespace Api.Models;

public class TaskContext : DbContext
{
    public TaskContext(DbContextOptions<TaskContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users { get; set; } = null!;
    public DbSet<Project> Projects { get; set; } = null!;
    public DbSet<TaskItem> Tasks { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        modelBuilder.Entity<TaskItem>()
            .HasOne(t => t.Project)
            .WithMany(p => p.Tasks)
            .HasForeignKey(t => t.ProjectId);

        modelBuilder.Entity<User>()
            .HasMany(u => u.Projects)
            .WithMany(p => p.Users)
            .UsingEntity("ProjectUser");

        modelBuilder.Entity<TaskItem>()
            .HasMany(t => t.Assignees)
            .WithMany()
            .UsingEntity("TaskAssignee");
    }
}
