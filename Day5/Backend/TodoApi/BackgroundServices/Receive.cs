// See https://aka.ms/new-console-template for more information
using System.Text;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using Newtonsoft.Json;
using Dapper;
using MySql.Data.MySqlClient;
using TodoApi.Models;


namespace TodoApi.BackgroundServices
{
    public class RabbitMQReceiverService : BackgroundService
    {
        private readonly ILogger<RabbitMQReceiverService> _logger;
        private readonly ConnectionFactory _factory;
        private IConnection _connection;
        private IModel _channel;
        private int _countIndex;
        
        public RabbitMQReceiverService(ILogger<RabbitMQReceiverService> logger)
        {
            _logger = logger;
            _factory = new ConnectionFactory { HostName = "localhost" };
            _connection = _factory.CreateConnection();
            _channel = _connection.CreateModel();
        }
        protected override Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _channel.QueueDeclare(queue: "csvDataQueue",
                                  durable: true,
                                  exclusive: false,
                                  autoDelete: false,
                                  arguments: null);

            _logger.LogInformation(" [*] Waiting for messages.");

            var consumer = new EventingBasicConsumer(_channel);
            consumer.Received += async (model, ea) =>
            {
                var body = ea.Body.ToArray();
                var message = Encoding.UTF8.GetString(body);
                var chunk = JsonConvert.DeserializeObject<List<EmployeeRecord>>(message);

                // Insert data in chunks into MySQL database
                await InsertRecordsAsync(chunk!);
                _logger.LogInformation(" [x] Processed and inserted chunk");
            };

            _channel.BasicConsume(queue: "csvDataQueue",
                                  autoAck: true,
                                  consumer: consumer);

            return Task.CompletedTask;
        }

        private async Task InsertRecordsAsync(List<EmployeeRecord> records)
        {
            const string connectionString = "Server=localhost;User ID=root;Password=root;Database=employeerecords";
            using var connection = new MySqlConnection(connectionString);
            await connection.OpenAsync();

            var chunkId = _countIndex + 1;  // Unique identifier for each chunk
            var startTime = DateTime.Now;
            bool isSuccess = true;
            string errorMsg = string.Empty;

            var sql = new StringBuilder("INSERT INTO employeerecords (EmailId, Name, Country, State, City, TelephoneNumber, AddressLine1, AddressLine2, DateOfBirth, GrossSalaryFY2019_20, GrossSalaryFY2020_21, GrossSalaryFY2021_22, GrossSalaryFY2022_23, GrossSalaryFY2023_24, rowIndex) VALUES ");
            var values = new List<string>();
            var count = 0;
            var constCount = _countIndex * 10000;
            _countIndex++;

            foreach (var record in records)
            {
                count++;
                var rowIndex = constCount + count;
                values.Add($"('{record.EmailId}', '{record.Name}', '{record.Country}', '{record.State}', '{record.City}', '{record.TelephoneNumber}', '{record.AddressLine1}', '{record.AddressLine2}', '{record.DateOfBirth:yyyy-MM-dd}', '{record.GrossSalaryFY2019_20}', '{record.GrossSalaryFY2020_21}', '{record.GrossSalaryFY2021_22}', '{record.GrossSalaryFY2022_23}', '{record.GrossSalaryFY2023_24}', {rowIndex})");
            }

            sql.Append(string.Join(", ", values));
            _logger.LogInformation($"Inserting {count} records into database.");


            using var transaction = await connection.BeginTransactionAsync();
            try
            {
                // Execute the bulk insert
                await connection.ExecuteAsync(sql.ToString(), transaction: transaction);

                // Commit the transaction if successful
                await transaction.CommitAsync();
            }
            catch (Exception ex)
            {
                // Rollback the transaction on failure
                await transaction.RollbackAsync();
                isSuccess = false;
                errorMsg = ex.Message;
                _logger.LogError($"Error inserting chunk: {errorMsg}");
            }

            //update log entry
            var logSql = "INSERT INTO ChunkLogs (LogId, InsertTime, Status, ErrorMsg) " + "VALUES (@LogId, @InsertTime, @Status, @ErrorMsg)";

            await connection.ExecuteScalarAsync<int>(logSql, new{
                LogId = chunkId,
                InsertTime = startTime,
                Status = isSuccess,
                ErrorMsg = isSuccess ? "Null" : errorMsg
            });
        }
        public override void Dispose()
        {
            _channel?.Close();
            _connection?.Close();
            base.Dispose();
        }
    }
}



