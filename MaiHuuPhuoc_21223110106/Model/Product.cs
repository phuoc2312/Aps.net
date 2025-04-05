namespace MaiHuuPhuoc_21223110106.Model
{
    public class Product
    {
        public int ID { get; set; }
        public string Name { get; set; }
        public double Price { get; set; }
        public string Image { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public int CreatedByUserId { get; set; }

        public DateTime? UpdatedAt { get; set; }
        public int? UpdatedUserId { get; set; }

        public DateTime? DeletedAt { get; set; }
        public int? DeletedUserId { get; set; }

        public int CategoryId { get; set; }
    }

}
