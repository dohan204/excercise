using WebApi.Database;
using WebApi.Services;

var builder = WebApplication.CreateBuilder(args);


builder.Services.AddControllers();
builder.Services.AddCors(options =>
{
    options.AddPolicy(name: "allowreact", policy =>
    {
      policy.AllowAnyMethod().AllowAnyOrigin().AllowAnyHeader()
      .WithExposedHeaders("Content-Disposition") ;
    });

    

});
// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

builder.Services.AddScoped<MasterProductService>();
builder.Services.AddScoped<IDbSqlConnection, DbSqlConnection>();
builder.Services.AddScoped<IExcelService, ExcelService>();
var app = builder.Build();
app.UseCors("allowreact");

app.Use( async (context, next) =>
{
    Console.WriteLine(context.Request.Method);
    Console.WriteLine(context.Request.Path);

    Console.WriteLine(context.Request.RouteValues);
    await next(context);
});
// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// app.UseHttpsRedirection();

var summaries = new[]
{
    "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
};

app.MapGet("/weatherforecast", () =>
{
    var forecast =  Enumerable.Range(1, 5).Select(index =>
        new WeatherForecast
        (
            DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
            Random.Shared.Next(-20, 55),
            summaries[Random.Shared.Next(summaries.Length)]
        ))
        .ToArray();
    return forecast;
})
.WithName("GetWeatherForecast");

app.MapControllers();
app.Run();

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}
