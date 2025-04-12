using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace MaiHuuPhuoc_21223110106.Model
{
    public class Category
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        public string? Description { get; set; }

        [JsonIgnore]
        public virtual ICollection<Product>? Products { get; set; }
    }
}
