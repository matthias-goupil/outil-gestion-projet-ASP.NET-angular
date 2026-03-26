using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace api.Migrations
{
    /// <inheritdoc />
    public partial class AddTaskDescriptionAndRichContent : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "Tasks",
                type: "text",
                nullable: true);

            // Migrate existing Content (plain text) → Description
            migrationBuilder.Sql("UPDATE \"Tasks\" SET \"Description\" = \"Content\"");

            // Clear Content so it becomes the new rich-text field (empty by default)
            migrationBuilder.Sql("UPDATE \"Tasks\" SET \"Content\" = NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Restore Content from Description on rollback
            migrationBuilder.Sql("UPDATE \"Tasks\" SET \"Content\" = \"Description\"");

            migrationBuilder.DropColumn(
                name: "Description",
                table: "Tasks");
        }
    }
}
