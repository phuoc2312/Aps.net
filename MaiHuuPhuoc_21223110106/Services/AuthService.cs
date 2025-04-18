using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using MaiHuuPhuoc_21223110106.Data;
using MaiHuuPhuoc_21223110106.Model;

namespace MaiHuuPhuoc_21223110106.Services
{
    public class AuthService(ApplicationDbContext context, IConfiguration configuration)
    {
        public async Task<AuthResponse?> Authenticate(LoginModel model)
        {
            var user = await context.Users
                .FirstOrDefaultAsync(u => u.Username == model.Username);

            if (user == null || !BCrypt.Net.BCrypt.Verify(model.Password, user.Password))
            {
                return null;
            }

            var claims = new List<Claim>
            {
                new(ClaimTypes.Name, user.Username),
                new(ClaimTypes.NameIdentifier, user.Id.ToString())
            };

            if (user.IsAdmin)
            {
                claims.Add(new(ClaimTypes.Role, "Admin"));
            }

            var key = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(
                configuration["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key is not configured")));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new(claims),
                Expires = DateTime.UtcNow.AddHours(1),
                SigningCredentials = creds
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);
            var tokenString = tokenHandler.WriteToken(token);

            return new()
            {
                UserId = user.Id,
                Username = user.Username,
                Token = tokenString
            };
        }
    }
}