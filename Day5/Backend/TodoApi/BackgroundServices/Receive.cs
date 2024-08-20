// See https://aka.ms/new-console-template for more information
using System.Text;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using Newtonsoft.Json;
using Dapper;
using MySql.Data.MySqlClient;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;


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
                var chunk = JsonConvert.DeserializeObject<List<Dictionary<string, string>>>(message);

                // Insert data in chunks into MySQL database
                await InsertRecordsAsync(chunk!);
                _logger.LogInformation(" [x] Processed and inserted chunk");
            };

            _channel.BasicConsume(queue: "csvDataQueue",
                                  autoAck: true,
                                  consumer: consumer);

            return Task.CompletedTask;
        }

        private async Task InsertRecordsAsync(List<Dictionary<string, string>> records)
        {
            const string connectionString = "Server=localhost;User ID=root;Password=root;Database=employeerecords";
            using var connection = new MySqlConnection(connectionString);
            await connection.OpenAsync();

            var sql = new StringBuilder("INSERT INTO employeerecords (email_id, name, country, state, city, telephone_number, address_line_1, address_line_2, date_of_birth, gross_salary_FY2019_20, gross_salary_FY2020_21, gross_salary_FY2021_22, gross_salary_FY2022_23, gross_salary_FY2023_24, rowIndex) VALUES ");
            var values = new List<string>();
            var count = 0;
            var constCount = _countIndex * 10000;
            _countIndex++;

            foreach (var record in records)
            {
                count++;
                var rowIndex = constCount + count;
                values.Add($"('{record["email_id"]}', '{record["name"]}', '{record["country"]}', '{record["state"]}', '{record["city"]}', '{record["telephone_number"]}', '{record["address_line_1"]}', '{record["address_line_2"]}', '{record["date_of_birth"]}', '{record["gross_salary_FY2019_20"]}', '{record["gross_salary_FY2020_21"]}', '{record["gross_salary_FY2021_22"]}', '{record["gross_salary_FY2022_23"]}', '{record["gross_salary_FY2023_24"]}', {rowIndex})");
            }

            sql.Append(string.Join(", ", values));
            _logger.LogInformation($"Inserting {count} records into database.");

            // Execute the bulk insert
            await connection.ExecuteAsync(sql.ToString());
        }
                public override void Dispose()
        {
            _channel?.Close();
            _connection?.Close();
            base.Dispose();
        }
    }
}



