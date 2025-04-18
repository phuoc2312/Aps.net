using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MaiHuuPhuoc_21223110106.Data;
using MaiHuuPhuoc_21223110106.Model;

namespace MaiHuuPhuoc_21223110106.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductsController(ApplicationDbContext context, IWebHostEnvironment environment) : ControllerBase
    {
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Product>>> GetProducts() =>
            await context.Products.Include(p => p.Category).ToListAsync();

        [HttpGet("{id}")]
        public async Task<ActionResult<Product>> GetProduct(int id)
        {
            var product = await context.Products
                .Include(p => p.Category)
                .FirstOrDefaultAsync(p => p.Id == id);
            return product == null ? NotFound() : product;
        }

        [HttpGet("Category/{categoryId}")]
        public async Task<ActionResult<IEnumerable<Product>>> GetProductsByCategory(int categoryId) =>
            await context.Products
                .Where(p => p.CategoryId == categoryId)
                .Include(p => p.Category)
                .ToListAsync();

        [HttpPost]
        //[Authorize(Roles = "Admin")]
        public async Task<ActionResult<Product>> PostProduct(Product product)
        {
            context.Products.Add(product);
            await context.SaveChangesAsync();
            return CreatedAtAction("GetProduct", new { id = product.Id }, product);
        }

        [HttpPost("Upload")]
        //[Authorize(Roles = "Admin")]
        public async Task<IActionResult> UploadImage(IFormFile? file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded");

            var uploadsFolder = Path.Combine(environment.WebRootPath, "content", "images");
            if (!Directory.Exists(uploadsFolder))
                Directory.CreateDirectory(uploadsFolder);

            var uniqueFileName = Guid.NewGuid().ToString() + "_" + file.FileName;
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using (var fileStream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(fileStream);
            }

            return Ok(new { imageUrl = "/content/images/" + uniqueFileName });
        }

        [HttpPut("{id}")]
        //[Authorize(Roles = "Admin")]
        public async Task<IActionResult> PutProduct(int id, Product product)
        {
            if (id != product.Id)
            {
                return BadRequest();
            }

            context.Entry(product).State = EntityState.Modified;
            try
            {
                await context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (ProductExists(id))
                {
                    throw;
                }
                return NotFound();
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        //[Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var product = await context.Products.FindAsync(id);
            if (product == null)
            {
                return NotFound();
            }

            context.Products.Remove(product);
            await context.SaveChangesAsync();
            return NoContent();
        }

        private bool ProductExists(int id) =>
            context.Products.Count(e => e.Id == id) > 0;
    }
}