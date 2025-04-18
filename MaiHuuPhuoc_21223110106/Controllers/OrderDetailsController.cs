using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MaiHuuPhuoc_21223110106.Data;
using MaiHuuPhuoc_21223110106.Model;

namespace MaiHuuPhuoc_21223110106.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrderDetailsController(ApplicationDbContext context) : ControllerBase
    {
        [HttpGet]
        //[Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<OrderDetail>>> GetOrderDetails() =>
            await context.OrderDetails
                .Include(od => od.Order)
                .Include(od => od.Product)
                .ToListAsync();

        [HttpGet("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<OrderDetail>> GetOrderDetail(int id)
        {
            var orderDetail = await context.OrderDetails
                .Include(od => od.Order)
                .Include(od => od.Product)
                .FirstOrDefaultAsync(od => od.Id == id);
            return orderDetail == null ? NotFound() : orderDetail;
        }

        [HttpGet("Order/{orderId}")]
        //[Authorize]
        public async Task<ActionResult<IEnumerable<OrderDetail>>> GetOrderDetailsByOrder(int orderId) =>
            await context.OrderDetails
                .Where(od => od.OrderId == orderId)
                .Include(od => od.Product)
                .ToListAsync();

        [HttpPost]
        //[Authorize(Roles = "Admin")]
        public async Task<ActionResult<OrderDetail>> PostOrderDetail(OrderDetail orderDetail)
        {
            var product = await context.Products.FindAsync(orderDetail.ProductId);
            if (product != null)
            {
                orderDetail.UnitPrice = product.Price;
            }

            context.OrderDetails.Add(orderDetail);
            await context.SaveChangesAsync();
            return CreatedAtAction("GetOrderDetail", new { id = orderDetail.Id }, orderDetail);
        }

        [HttpPut("{id}")]
        //[Authorize(Roles = "Admin")]
        public async Task<IActionResult> PutOrderDetail(int id, OrderDetail orderDetail)
        {
            if (id != orderDetail.Id)
            {
                return BadRequest();
            }

            context.Entry(orderDetail).State = EntityState.Modified;
            try
            {
                await context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (OrderDetailExists(id))
                {
                    throw;
                }
                return NotFound();
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        //[Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteOrderDetail(int id)
        {
            var orderDetail = await context.OrderDetails.FindAsync(id);
            if (orderDetail == null)
            {
                return NotFound();
            }

            context.OrderDetails.Remove(orderDetail);
            await context.SaveChangesAsync();
            return NoContent();
        }

        private bool OrderDetailExists(int id) =>
            context.OrderDetails.Count(e => e.Id == id) > 0;
    }
}