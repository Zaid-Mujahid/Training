namespace TodoApi.Models;

using System.Data;
using Newtonsoft.Json;
public class TodoItem
{
    public long Id { get; set; }
    public string? Name { get; set; }
    public bool IsComplete { get; set; }
}

public class EmployeeRecord{
    public string? EmailId { get; set; }
    public string? Name { get; set; }
    public string? Country { get; set; }
    public string? State { get; set; }
    public string? City { get; set; }
    public string? TelephoneNumber { get; set; }
    public string? AddressLine1 { get; set; }
    public string? AddressLine2 { get; set; }
    public string? DateOfBirth { get; set; }
    public string? GrossSalaryFY2019_20 { get; set; }
    public string? GrossSalaryFY2020_21 { get; set; }
    public string? GrossSalaryFY2021_22 { get; set; }
    public string? GrossSalaryFY2022_23 { get; set; }
    public string? GrossSalaryFY2023_24 { get; set; }
    [JsonIgnore]
    public int RowIndex { get; set; }
}

public class ChunkLogs{
    public int LogId {get;set;}
    public DateTime InsertedTime {get;set;}
    public bool Status {get;set;}
    public string? ErrorMsg {get;set;}
}