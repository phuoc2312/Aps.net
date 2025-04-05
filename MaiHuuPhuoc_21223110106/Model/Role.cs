namespace MaiHuuPhuoc_21223110106.Model
{
    public class Role
    {
        public int Id { get; set; }
        public string Name { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        public DateTime? DeletedAt { get; set; }

        //public ICollection<User> Users { get; set; }
    }
}
