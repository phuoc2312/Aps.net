using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MaiHuuPhuoc_21223110106.Model
{
  
        public class Category // Đảm bảo class nằm trong dấu { }
        {
            [Key] // Khóa chính
            public int Id { get; set; }

            [Required]
            [MaxLength(100)]
            public string Name { get; set; }
        }
    
}
