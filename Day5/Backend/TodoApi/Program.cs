using Microsoft.EntityFrameworkCore;
using TodoApi.Models;
using TodoApi.BackgroundServices;
using MySqlConnector;
using System.Configuration;


var builder = WebApplication.CreateBuilder(args);

// // my sql connection
builder.Services.AddDbContext<TodoContext>(options => options.UseMySQL(builder.Configuration.GetConnectionString("Default")!));


// Add services to the container.
builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddDbContext<TodoContext>(opt =>
    opt.UseInMemoryDatabase("TodoList"));
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddHostedService<RabbitMQReceiverService>();
var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
