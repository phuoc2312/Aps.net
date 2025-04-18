using Microsoft.AspNetCore.Mvc;
using MaiHuuPhuoc_21223110106.Model;
using MaiHuuPhuoc_21223110106.Services;

namespace MaiHuuPhuoc_21223110106.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController(AuthService authService) : ControllerBase
    {
        [HttpPost("login")]
        public async Task<ActionResult<AuthResponse>> Login(LoginModel model)
        {
            var response = await authService.Authenticate(model);
            return response == null
                ? Unauthorized(new { message = "Username or password is incorrect" })
                : Ok(response);
        }
    }
}