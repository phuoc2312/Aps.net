using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MaiHuuPhuoc_21223110106.Data;
using MaiHuuPhuoc_21223110106.Model;
using Microsoft.AspNetCore.Authorization;

namespace MaiHuuPhuoc_21223110106.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public UsersController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Users
        [HttpGet]
        [Authorize]
        public async Task<ActionResult<IEnumerable<User>>> GetUsers()
        {
            return await _context.Users.ToListAsync();
        }

        // GET: api/Users/5
        [HttpGet("{id}")]
        [Authorize]
        public async Task<ActionResult<User>> GetUser(int id)
        {
            var user = await _context.Users.FindAsync(id);

            if (user == null)
            {
                return NotFound();
            }

            return user;
        }

        // PUT: api/Users/5
        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> PutUser(int id, User user)
        {
            if (id != user.Id)
            {
                return BadRequest();
            }

            _context.Entry(user).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!UserExists(id))
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

        // POST: api/Users
        [HttpPost]
        public async Task<ActionResult<User>> PostUser(User user)
        {
            // Check if username already exists
            if (await _context.Users.AnyAsync(u => u.Username == user.Username))
            {
                return BadRequest("Username already exists");
            }

            // Hash the password before storing
            user.Password = HashPassword(user.Password);

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // Don't return the password in the response
            var userToReturn = new
            {
                user.Id,
                user.Username,
                user.Email,
                user.FullName
            };

            return CreatedAtAction("GetUser", new { id = user.Id }, userToReturn);
        }

        // Helper method to hash passwords
        private string HashPassword(string password)
        {
            return BCrypt.Net.BCrypt.HashPassword(password);
        }
        // DELETE: api/Users/5
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool UserExists(int id)
        {
            return _context.Users.Any(e => e.Id == id);
        }
    }
}
