using Microsoft.AspNetCore.Mvc;
using MaiHuuPhuoc_21223110106.Model;
using MaiHuuPhuoc_21223110106.Services;

namespace MaiHuuPhuoc_21223110106.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly AuthService _authService;

        public AuthController(AuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("login")]
        public async Task<ActionResult<AuthResponse>> Login(LoginModel model)
        {
            var response = await _authService.Authenticate(model);
            
            if (response == null)
                return Unauthorized(new { message = "Username or password is incorrect" });

            return Ok(response);
        }
    }
}
