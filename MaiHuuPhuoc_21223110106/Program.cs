using MaiHuuPhuoc_21223110106.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using MaiHuuPhuoc_21223110106.Services;
using Microsoft.OpenApi.Models;
using Microsoft.Extensions.FileProviders;

var builder = WebApplication.CreateBuilder(args);

// Lấy connection string
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
if (string.IsNullOrEmpty(connectionString))
{
    throw new InvalidOperationException("Connection string 'DefaultConnection' is not set in appsettings.json");
}

// Cấu hình DbContext với MySQL
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

// Cấu hình Controller
builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
});

// Cấu hình Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo { Title = "MaiHuuPhuoc_2122110106", Version = "v1" });
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Nhập JWT token theo định dạng: Bearer {token}"
    });
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
    options.AddPolicy("AllowFrontend", builder =>
    {
        builder.WithOrigins("https://localhost:7147", "http://localhost:5021")
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
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "MaiHuuPhuoc_2122110106 v1");
        c.RoutePrefix = "swagger";
    });
}
else
{
    app.UseExceptionHandler("/error");
}

// Middleware
app.UseCors("AllowFrontend");

// Xử lý yêu cầu OPTIONS cho preflight
app.Use(async (context, next) =>
{
    if (context.Request.Method == "OPTIONS")
    {
        context.Response.StatusCode = 204;
        context.Response.Headers.Add("Access-Control-Allow-Origin", "https://localhost:7147");
        context.Response.Headers.Add("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
        context.Response.Headers.Add("Access-Control-Allow-Headers", "Content-Type,Authorization");
        return;
    }
    await next();
});

// Chỉ chuyển hướng HTTPS cho non-API routes
app.Use(async (context, next) =>
{
    if (!context.Request.IsHttps && !context.Request.Path.StartsWithSegments("/api"))
    {
        var httpsPort = builder.Configuration["Kestrel:Endpoints:Https:Url"]?.Split(':').Last() ?? "7147";
        context.Response.Redirect($"https://{context.Request.Host.Host}:{httpsPort}{context.Request.Path}{context.Request.QueryString}", permanent: false);
        return;
    }
    await next();
});

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(Path.Combine(Directory.GetCurrentDirectory(), "Content")),
    RequestPath = "/content"
});

app.UseDefaultFiles(new DefaultFilesOptions
{
    FileProvider = new PhysicalFileProvider(Path.Combine(Directory.GetCurrentDirectory(), "Content")),
    RequestPath = "/content",
    DefaultFileNames = new List<string> { "index.html" }
});

app.UseDefaultFiles(new DefaultFilesOptions
{
    FileProvider = new PhysicalFileProvider(Path.Combine(Directory.GetCurrentDirectory(), "Content", "admin")),
    RequestPath = "/content/admin",
    DefaultFileNames = new List<string> { "index.html" }
});

app.UseStaticFiles();

app.UseAuthentication();
app.UseAuthorization();

app.MapGet("/", async context =>
{
    context.Response.Redirect("/content/index.html", permanent: true);
    await Task.CompletedTask;
}).ExcludeFromDescription();

app.MapControllers();

app.Run();