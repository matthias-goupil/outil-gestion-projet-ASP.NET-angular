namespace Api.DTOs;

public class MemberDto
{
    public int Id { get; set; }
    public required string Email { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
}

public class AddMemberDto
{
    public required string Email { get; set; }
}
