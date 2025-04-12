using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MaiHuuPhuoc_21223110106.Data;
using MaiHuuPhuoc_21223110106.Model;
using Microsoft.AspNetCore.Authorization;

namespace MaiHuuPhuoc_21223110106.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrdersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public OrdersController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Orders
        [HttpGet]
        [Authorize]
        public async Task<ActionResult<IEnumerable<Order>>> GetOrders()
        {
            return await _context.Orders
                .Include(o => o.User)
                .ToListAsync();
        }

        // GET: api/Orders/5
        [HttpGet("{id}")]
        [Authorize]
        public async Task<ActionResult<Order>> GetOrder(int id)
        {
            var order = await _context.Orders
                .Include(o => o.User)
                .Include(o => o.OrderDetails)
                .ThenInclude(od => od.Product)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (order == null)
            {
                return NotFound();
            }

            return order;
        }

        // GET: api/Orders/User/5
        [HttpGet("User/{userId}")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<Order>>> GetOrdersByUser(int userId)
        {
            return await _context.Orders
                .Where(o => o.UserId == userId)
                .Include(o => o.OrderDetails)
                .ThenInclude(od => od.Product)
                .ToListAsync();
        }

        // PUT: api/Orders/5
        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> PutOrder(int id, Order order)
        {
            if (id != order.Id)
            {
                return BadRequest();
            }

            _context.Entry(order).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!OrderExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/Orders
        [HttpPost]
        public async Task<ActionResult<Order>> PostOrder(Order order)
        {
            // Calculate total amount based on order details
            decimal totalAmount = 0;
            
            if (order.OrderDetails != null && order.OrderDetails.Any())
            {
                foreach (var detail in order.OrderDetails)
                {
                    var product = await _context.Products.FindAsync(detail.ProductId);
                    if (product != null)
                    {
                        detail.UnitPrice = product.Price;
                        totalAmount += detail.UnitPrice * detail.Quantity;
                    }
                }
            }
            
            order.TotalAmount = totalAmount;
            order.OrderDate = DateTime.Now;

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetOrder", new { id = order.Id }, order);
        }

        // DELETE: api/Orders/5
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteOrder(int id)
        {
            var order = await _context.Orders.FindAsync(id);
            if (order == null)
            {
                return NotFound();
            }

            _context.Orders.Remove(order);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool OrderExists(int id)
        {
            return _context.Orders.Any(e => e.Id == id);
        }
    }
}
