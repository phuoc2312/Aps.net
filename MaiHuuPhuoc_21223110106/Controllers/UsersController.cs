// MaiHuuPhuoc_21223110106/Controllers/UsersController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MaiHuuPhuoc_21223110106.Data;
using MaiHuuPhuoc_21223110106.Model;

namespace MaiHuuPhuoc_21223110106.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController(ApplicationDbContext context) : ControllerBase
    {
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetUsers()
        {
            return await context.Users
                .Select(u => new
                {
                    u.Id,
                    u.Username,
                    u.Email,
                    u.FullName,
                    u.Address,
                    u.Phone,
                    u.IsAdmin
                })
                .ToListAsync();
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<object>> GetUser(int id)
        {
            var user = await context.Users.FindAsync(id);
            return user == null
                ? NotFound()
                : new
                {
                    user.Id,
                    user.Username,
                    user.Email,
                    user.FullName,
                    user.Address,
                    user.Phone,
                    user.IsAdmin
                };
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> PutUser(int id, User user)
        {
            if (id != user.Id)
            {
                return BadRequest();
            }

            var existingUser = await context.Users.FindAsync(id);
            if (existingUser == null)
            {
                return NotFound();
            }

            existingUser.Email = user.Email;
            existingUser.FullName = user.FullName;
            existingUser.Address = user.Address;
            existingUser.Phone = user.Phone;
            existingUser.IsAdmin = user.IsAdmin;

            try
            {
                await context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!UserExists(id))
                {
                    return NotFound();
                }
                throw;
            }

            return NoContent();
        }

        [HttpPost]
        public async Task<ActionResult<object>> PostUser(User user)
        {
            if ((await context.Users.CountAsync(u => u.Username == user.Username)) > 0)
            {
                return BadRequest("Username already exists");
            }

            user.Password = BCrypt.Net.BCrypt.HashPassword(user.Password);
            context.Users.Add(user);
            await context.SaveChangesAsync();

            return CreatedAtAction("GetUser", new { id = user.Id }, new
            {
                user.Id,
                user.Username,
                user.Email,
                user.FullName,
                user.Address,
                user.Phone,
                user.IsAdmin
            });
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            context.Users.Remove(user);
            await context.SaveChangesAsync();
            return NoContent();
        }

        private bool UserExists(int id) =>
            context.Users.Any(e => e.Id == id);
    }
}