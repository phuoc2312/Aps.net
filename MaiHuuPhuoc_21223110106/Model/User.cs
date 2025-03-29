using System.ComponentModel.DataAnnotations;

namespace MaiHuuPhuoc_21223110106.Model
{
    public class User
    {
        [Key] // Đánh dấu khóa chính
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        [MinLength(6)]
        public string Password { get; set; }
    }
}
