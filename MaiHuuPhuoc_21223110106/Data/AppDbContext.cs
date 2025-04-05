using Microsoft.EntityFrameworkCore;
using MaiHuuPhuoc_21223110106.Model;
using System.Data;

namespace MaiHuuPhuoc_21223110106.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
        public DbSet<User> Users { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Product> Products { get; set; }
    }
}
