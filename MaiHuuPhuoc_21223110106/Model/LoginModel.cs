using System.ComponentModel.DataAnnotations;

namespace MaiHuuPhuoc_21223110106.Model
{
    public class LoginModel
    {
        [Required]
        public string Username { get; set; } = string.Empty;

        [Required]
        public string Password { get; set; } = string.Empty;
    }
}
