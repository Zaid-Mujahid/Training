namespace TodoApi.Models;

public class TodoItem
{
    public long Id { get; set; }
    public string? Name { get; set; }
    public bool IsComplete { get; set; }
}

public class EmployeeRecord{
    public long Id {get; set;}
    public string? FirstName { get; set;}
    public string? LastName { get; set;}
    public int Age { get; set; }
    public int Height { get; set; }
    public string? Gender { get; set; }
}