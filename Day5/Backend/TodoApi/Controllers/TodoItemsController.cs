using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TodoApi.Models;
using System.Text;
using RabbitMQ.Client;
using Newtonsoft.Json;

namespace TodoApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TodoItemsController : ControllerBase
    {
        private readonly TodoContext _context;
        private readonly string connectionString = "Server=localhost;User ID=root;Password=root;Database=employeerecords";

        public TodoItemsController(TodoContext context)
        {
            _context = context;
        }

        // GET: api/TodoItems
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TodoItem>>> GetTodoItems()
        {
            return await _context.TodoItems.ToListAsync();
        }

        // GET: api/TodoItems/5
        [HttpGet("{id}")]
        public async Task<ActionResult<TodoItem>> GetTodoItem(long id)
        {
            var todoItem = await _context.TodoItems.FindAsync(id);

            if (todoItem == null)
            {
                return NotFound();
            }

            return todoItem;
        }

        // PUT: api/TodoItems/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutTodoItem(long id, TodoItem todoItem)
        {
            if (id != todoItem.Id)
            {
                return BadRequest();
            }

            _context.Entry(todoItem).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!TodoItemExists(id))
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

        // POST: api/TodoItems
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<TodoItem>> PostTodoItem(TodoItem todoItem)
        {
            _context.TodoItems.Add(todoItem);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetTodoItem), new { id = todoItem.Id }, todoItem);
        }

        //POST: api/uplaodData
        [HttpPost]
        [Route("uploadCsvData")]
        public async Task<IActionResult> UploadCsvData(IFormFile file)
        {
            var factory = new ConnectionFactory { HostName = "localhost" };
            using var connection = factory.CreateConnection();
            using var channel = connection.CreateModel();

            if (file == null || file.Length == 0)
            {
                return BadRequest("file not found!");
            }
            using var stream = new MemoryStream();
            await file.CopyToAsync(stream);

            var csvData = Encoding.UTF8.GetString(stream.ToArray());
            List<Dictionary<string, string>> records = ConvertStringToJson(csvData);
            int chunkSize = 10000;
            channel.QueueDeclare(queue: "csvDataQueue",
                                 durable: true,
                                 exclusive: false,
                                 autoDelete: false,
                                 arguments: null);

            for (int i = 0; i < records.Count; i += chunkSize)
            {
                var chunk = records.Skip(i).Take(chunkSize).ToList();
                var message = JsonConvert.SerializeObject(chunk);
                var body = Encoding.UTF8.GetBytes(message);

                channel.BasicPublish(exchange: "",
                                     routingKey: "csvDataQueue",
                                     basicProperties: null,
                                     body: body);

                Console.WriteLine($" [x] Sent chunk starting with record {i}");
            }
            return Ok("successfully enetered data");
        }
        private List<Dictionary<string, string>> ConvertStringToJson(string content)
        {
            var lines = content.Split(new[] { '\r', '\n' }, StringSplitOptions.RemoveEmptyEntries);
            var headers = lines[0].Split(',');
            var csvData = new List<Dictionary<string, string>>();

            foreach (var line in lines.Skip(1))
            {
                var values = line.Split(',');
                var row = new Dictionary<string, string>();
                for (var i = 0; i < headers.Length; i++)
                {
                    row[headers[i]] = values[i];
                }
                csvData.Add(row);
            }

            return csvData;
        }

        // private async Task InsertRecordsAsync(List<Dictionary<string, string>> records)
        // {
        //     using var connection = new MySqlConnection(connectionString);
        //     await connection.OpenAsync();

        //     var sql = "INSERT INTO employeerecords (Id, FirstName, LastName, Age, Height, Gender) VALUES (@Id, @FirstName, @LastName, @Age, @Height, @Gender)";

        //     await connection.ExecuteAsync(sql, records.Select(record => new
        //     {
        //         Id = record["Id"],
        //         FirstName = record["FirstName"],
        //         LastName = record["LastName"],
        //         Age = record["Age"],
        //         Height = record["Height"],
        //         Gender = record["Gender"]
        //     }));
        // }

        // DELETE: api/TodoItems/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTodoItem(long id)
        {
            var todoItem = await _context.TodoItems.FindAsync(id);
            if (todoItem == null)
            {
                return NotFound();
            }

            _context.TodoItems.Remove(todoItem);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool TodoItemExists(long id)
        {
            return _context.TodoItems.Any(e => e.Id == id);
        }
    }
}
