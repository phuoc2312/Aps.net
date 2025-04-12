using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MaiHuuPhuoc_21223110106.Model
{
    public class Order
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int UserId { get; set; }

        [ForeignKey("UserId")]
        public virtual User? User { get; set; }

        [Required]
        public DateTime OrderDate { get; set; } = DateTime.Now;

        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalAmount { get; set; }

        [StringLength(50)]
        public string Status { get; set; } = "Pending";

        public string? ShippingAddress { get; set; }

        public virtual ICollection<OrderDetail>? OrderDetails { get; set; }
    }
}
