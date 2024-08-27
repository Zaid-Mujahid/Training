using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TodoApi.Models;
using System.Text;
using RabbitMQ.Client;
using Newtonsoft.Json;
using MySql.Data.MySqlClient;
using Dapper;

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

        // GET: api/EmployeeRecords
        [HttpGet]
        public async Task<ActionResult<IEnumerable<EmployeeRecord>>> GetEmployeeRecords([FromQuery] int id=1)
        {
            using var connection = new MySqlConnection(connectionString);
            var records = await connection.QueryAsync<EmployeeRecord>($"SELECT * FROM employeerecords ORDER BY RowIndex limit {id},100");
            return Ok(records);
        }

        // GET: api/EmployeeRecords/5
        [HttpGet("{EmailId}")]
        public async Task<ActionResult<EmployeeRecord>> GetEmployeeRecord(string EmailId)
        {
            using var connection = new MySqlConnection(connectionString);
            var record = await connection.QuerySingleOrDefaultAsync<EmployeeRecord>("SELECT * FROM employeerecords WHERE EmailId = @EmailId", new { EmailId = EmailId });
            if (record == null) { return NotFound(); }
            return Ok(record);
        }

        // PUT: api/EmployeeRecords/5
        [HttpPut()]
        public async Task<IActionResult> PutEmployeeRecord(EmployeeRecord employeeRecord)
        {
            using var connection = new MySqlConnection(connectionString);
            var result = await connection.ExecuteAsync(@"UPDATE employeerecords SET
                EmailId = @EmailId,
                Name = @Name,
                Country = @Country,
                State = @State, 
                City = @City, 
                TelephoneNumber = @TelephoneNumber, 
                AddressLine1 = @AddressLine1, 
                AddressLine2 = @AddressLine2, 
                DateOfBirth = @DateOfBirth, 
                GrossSalaryFY2019_20 = @GrossSalaryFY2019_20, 
                GrossSalaryFY2020_21 = @GrossSalaryFY2020_21, 
                GrossSalaryFY2021_22 = @GrossSalaryFY2021_22, 
                GrossSalaryFY2022_23 = @GrossSalaryFY2022_23, 
                GrossSalaryFY2023_24 = @GrossSalaryFY2023_24
                WHERE EmailId = @EmailId", employeeRecord);

            if (result == 0) { return BadRequest(); };
            return Ok(result);
        }

        // POST: api/EmployeeRecords
        [HttpPost]
        public async Task<ActionResult<EmployeeRecord>> PostEmployeeRecord(EmployeeRecord employeeRecord)
        {
            using var connection = new MySqlConnection(connectionString);
            var result = await connection.ExecuteAsync(@"INSERT INTO employeerecords 
                (EmailId, Name, Country, State, City, TelephoneNumber, AddressLine1, AddressLine2, DateOfBirth, GrossSalaryFY2019_20, GrossSalaryFY2020_21, GrossSalaryFY2021_22, GrossSalaryFY2022_23, GrossSalaryFY2023_24, RowIndex) 
                VALUES (@EmailId, @Name, @Country, @State, @City, @TelephoneNumber, @AddressLine1, @AddressLine2, @DateOfBirth, @GrossSalaryFY2019_20, @GrossSalaryFY2020_21, @GrossSalaryFY2021_22, @GrossSalaryFY2022_23, @GrossSalaryFY2023_24, @RowIndex)", employeeRecord);

            if (result == 0) { return BadRequest("Unable to insert record"); }

            return CreatedAtAction(nameof(GetEmployeeRecord), new { EmailId = employeeRecord.EmailId }, employeeRecord);
        }

        //POST: api/uplaodData
        [HttpPost]
        [Route("uploadCsvData")]
        public async Task<IActionResult> UploadCsvData(IFormFile file)
        {
            var factory = new ConnectionFactory { HostName = "localhost" };
            using var connection = factory.CreateConnection();
            using var channel = connection.CreateModel();

            if (file == null || file.Length == 0) { return BadRequest("file not found!"); }
            using var stream = new MemoryStream();
            await file.CopyToAsync(stream);

            var csvData = Encoding.UTF8.GetString(stream.ToArray());
            List<EmployeeRecord> records = ConvertStringToEmployeeRecords(csvData);
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
        private List<EmployeeRecord> ConvertStringToEmployeeRecords(string content)
        {
            var lines = content.Split(new[] { '\r', '\n' }, StringSplitOptions.RemoveEmptyEntries);
            var headers = lines[0].Split(',');
            var records = new List<EmployeeRecord>();

            foreach (var line in lines.Skip(1))
            {
                var values = line.Split(',');

                var record = new EmployeeRecord
                {
                    EmailId = values[0],
                    Name = values[1],
                    Country = values[2],
                    State = values[3],
                    City = values[4],
                    TelephoneNumber = values[5],
                    AddressLine1 = values[6],
                    AddressLine2 = values[7],
                    DateOfBirth = values[8],
                    GrossSalaryFY2019_20 = values[9],
                    GrossSalaryFY2020_21 = values[10],
                    GrossSalaryFY2021_22 = values[11],
                    GrossSalaryFY2022_23 = values[12],
                    GrossSalaryFY2023_24 = values[13],
                };

                records.Add(record);
            }

            return records;
        }

        // DELETE: api/TodoItems/5
        [HttpDelete("{EmailId}")]
        public async Task<IActionResult> DeleteEmployeeRecord(String EmailId)
        {
            using var connection = new MySqlConnection(connectionString);
            var result = await connection.ExecuteAsync("DELETE FROM employeerecords WHERE EmailId = @EmailId", new { EmailId = EmailId });

            if (result == 0) { return NotFound(); };
            return NoContent();
        }
        private bool TodoItemExists(long id)
        {
            return _context.TodoItems.Any(e => e.Id == id);
        }
    }
}
