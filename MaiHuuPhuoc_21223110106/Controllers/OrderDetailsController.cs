using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MaiHuuPhuoc_21223110106.Data;
using MaiHuuPhuoc_21223110106.Model;
using Microsoft.AspNetCore.Authorization;

namespace MaiHuuPhuoc_21223110106.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrderDetailsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public OrderDetailsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/OrderDetails
        [HttpGet]
        [Authorize]
        public async Task<ActionResult<IEnumerable<OrderDetail>>> GetOrderDetails()
        {
            return await _context.OrderDetails
                .Include(od => od.Order)
                .Include(od => od.Product)
                .ToListAsync();
        }

        // GET: api/OrderDetails/5
        [HttpGet("{id}")]
        [Authorize]
        public async Task<ActionResult<OrderDetail>> GetOrderDetail(int id)
        {
            var orderDetail = await _context.OrderDetails
                .Include(od => od.Order)
                .Include(od => od.Product)
                .FirstOrDefaultAsync(od => od.Id == id);

            if (orderDetail == null)
            {
                return NotFound();
            }

            return orderDetail;
        }

        // GET: api/OrderDetails/Order/5
        [HttpGet("Order/{orderId}")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<OrderDetail>>> GetOrderDetailsByOrder(int orderId)
        {
            return await _context.OrderDetails
                .Where(od => od.OrderId == orderId)
                .Include(od => od.Product)
                .ToListAsync();
        }

        // PUT: api/OrderDetails/5
        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> PutOrderDetail(int id, OrderDetail orderDetail)
        {
            if (id != orderDetail.Id)
            {
                return BadRequest();
            }

            _context.Entry(orderDetail).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!OrderDetailExists(id))
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

        // POST: api/OrderDetails
        [HttpPost]
        [Authorize]
        public async Task<ActionResult<OrderDetail>> PostOrderDetail(OrderDetail orderDetail)
        {
            // Set the unit price based on the product
            var product = await _context.Products.FindAsync(orderDetail.ProductId);
            if (product != null)
            {
                orderDetail.UnitPrice = product.Price;
            }

            _context.OrderDetails.Add(orderDetail);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetOrderDetail", new { id = orderDetail.Id }, orderDetail);
        }

        // DELETE: api/OrderDetails/5
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteOrderDetail(int id)
        {
            var orderDetail = await _context.OrderDetails.FindAsync(id);
            if (orderDetail == null)
            {
                return NotFound();
            }

            _context.OrderDetails.Remove(orderDetail);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool OrderDetailExists(int id)
        {
            return _context.OrderDetails.Any(e => e.Id == id);
        }
    }
}
