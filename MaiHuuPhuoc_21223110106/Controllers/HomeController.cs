using Microsoft.AspNetCore.Mvc;

namespace MaiHuuPhuoc_21223110106.Controllers
{
    public class HomeController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }

        public IActionResult About()
        {
            ViewData["Message"] = "Thông tin về trang web của bạn.";
            return View();
        }
    }
}
