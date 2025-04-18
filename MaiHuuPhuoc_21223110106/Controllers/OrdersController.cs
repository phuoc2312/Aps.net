// MaiHuuPhuoc_21223110106/Controllers/OrdersController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MaiHuuPhuoc_21223110106.Data;
using MaiHuuPhuoc_21223110106.Model;

namespace MaiHuuPhuoc_21223110106.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrdersController(ApplicationDbContext context) : ControllerBase
    {
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Order>>> GetOrders() =>
            await context.Orders
                .Include(o => o.User)
                .ToListAsync();

        [HttpGet("{id}")]
        public async Task<ActionResult<Order>> GetOrder(int id)
        {
            var order = await context.Orders
                .Include(o => o.User)
                .Include(o => o.OrderDetails!)
                .ThenInclude(od => od.Product!)
                .FirstOrDefaultAsync(o => o.Id == id);
            return order == null ? NotFound() : order;
        }

        [HttpGet("User/{userId}")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<Order>>> GetOrdersByUser(int userId) =>
            await context.Orders
                .Where(o => o.UserId == userId)
                .Include(o => o.OrderDetails!)
                .ThenInclude(od => od.Product!)
                .ToListAsync();

        [HttpPost]
        [Authorize]
        public async Task<ActionResult<Order>> PostOrder(Order order)
        {
            decimal totalAmount = 0;
            if (order.OrderDetails?.Any() == true)
            {
                foreach (var detail in order.OrderDetails)
                {
                    var product = await context.Products.FindAsync(detail.ProductId);
                    if (product != null)
                    {
                        detail.UnitPrice = product.Price;
                        totalAmount += detail.UnitPrice * detail.Quantity;
                    }
                }
            }

            order.TotalAmount = totalAmount;
            order.OrderDate = DateTime.UtcNow;
            context.Orders.Add(order);
            await context.SaveChangesAsync();

            return CreatedAtAction("GetOrder", new { id = order.Id }, order);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> PutOrder(int id, Order order)
        {
            if (id != order.Id)
            {
                return BadRequest();
            }

            context.Entry(order).State = EntityState.Modified;
            try
            {
                await context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!OrderExists(id))
                {
                    return NotFound();
                }
                throw;
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteOrder(int id)
        {
            var order = await context.Orders.FindAsync(id);
            if (order == null)
            {
                return NotFound();
            }

            context.Orders.Remove(order);
            await context.SaveChangesAsync();
            return NoContent();
        }

        private bool OrderExists(int id) =>
            context.Orders.Any(e => e.Id == id);
    }
}