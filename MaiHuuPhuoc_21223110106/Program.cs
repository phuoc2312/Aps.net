using MaiHuuPhuoc_21223110106.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using MaiHuuPhuoc_21223110106.Services;
using Microsoft.OpenApi.Models;
using Microsoft.Extensions.FileProviders;

var builder = WebApplication.CreateBuilder(args);

// Lấy connection string từ appsettings.json
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

// Kiểm tra chuỗi kết nối có bị null không
if (string.IsNullOrEmpty(connectionString))
{
    throw new InvalidOperationException("Connection string 'DefaultConnection' is not set in appsettings.json");
}

// Cấu hình DbContext sử dụng MySQL (Pomelo)
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

// Đăng ký Controller với JSON options để tránh lỗi circular reference
builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
});

// Đăng ký Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo { Title = "MaiHuuPhuoc_2122110106", Version = "v1" });

    // Định nghĩa Bearer Token
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Nhập JWT token theo định dạng: Bearer {token}"
    });

    // Gắn Bearer vào tất cả các endpoint có [Authorize]
    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// Thêm CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", builder =>
    {
        builder.AllowAnyOrigin()
               .AllowAnyMethod()
               .AllowAnyHeader();
    });
});

// Thêm Authentication với JWT
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(
                builder.Configuration["Jwt:Key"] ?? "defaultsecretkey12345678901234567890")),
            ValidateIssuer = false,
            ValidateAudience = false,
            ClockSkew = TimeSpan.Zero
        };
    });

// Đăng ký AuthService
builder.Services.AddScoped<AuthService>();

var app = builder.Build();

// Xử lý lỗi
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}
else
{
    app.UseExceptionHandler("/error");
}

// Middleware chung
app.UseHttpsRedirection();
app.UseCors("AllowAll");

// Phục vụ file tĩnh từ thư mục Content (bao gồm cả User UI và Admin UI)
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(
        Path.Combine(Directory.GetCurrentDirectory(), "Content")),
    RequestPath = "/content"
});

// Đặt file mặc định (index.html hoặc login.html) khi truy cập thư mục Content (User UI)
app.UseDefaultFiles(new DefaultFilesOptions
{
    FileProvider = new PhysicalFileProvider(
        Path.Combine(Directory.GetCurrentDirectory(), "Content")),
    RequestPath = "/content",
    DefaultFileNames = new List<string> { "index.html"} // Ưu tiên index.html
});

// Đặt file mặc định (index.html) khi truy cập thư mục Content/admin (Admin UI)
app.UseDefaultFiles(new DefaultFilesOptions
{
    FileProvider = new PhysicalFileProvider(
        Path.Combine(Directory.GetCurrentDirectory(), "Content", "admin")),
    RequestPath = "/content/admin",
    DefaultFileNames = new List<string> { "index.html" }
});

app.UseStaticFiles(); // Đảm bảo các file tĩnh được phục vụ

app.UseAuthentication();
app.UseAuthorization();

// Middleware kiểm tra quyền truy cập Admin UI
app.Use(async (context, next) =>
{
    if (context.Request.Path.StartsWithSegments("/content/admin"))
    {
        // Kiểm tra quyền admin (dựa trên JWT)
        if (!context.User.Identity.IsAuthenticated || !context.User.IsInRole("Admin"))
        {
            // Nếu không có quyền admin, chuyển hướng về trang login của User UI
            context.Response.Redirect("/content/login.html");
            return;
        }
    }
    await next();
});

// Chuyển hướng từ route gốc (/) đến trang User UI
app.MapGet("/", async context =>
{
    context.Response.Redirect("/content/index.html", permanent: true);
    await Task.CompletedTask;
}).ExcludeFromDescription();

app.MapControllers();

// Đặt Swagger UI ở một route cụ thể
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "MaiHuuPhuoc_2122110106 v1");
        c.RoutePrefix = "swagger"; // Đảm bảo Swagger UI chỉ xuất hiện tại /swagger
    });
}

// Chạy ứng dụng
app.Run();