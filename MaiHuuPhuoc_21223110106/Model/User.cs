using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace MaiHuuPhuoc_21223110106.Model
{
    public class User
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string Username { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
   
        public string Password { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [StringLength(100)]
        public string? FullName { get; set; }

        public string? Address { get; set; }

        [StringLength(20)]
        public string? Phone { get; set; }


        [JsonIgnore]
        public virtual ICollection<Order>? Orders { get; set; }

        public bool IsAdmin { get; set; } = false;
    }
}
