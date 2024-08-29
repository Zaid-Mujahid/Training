CREATE TABLE EmployeeRecords (
    EmailId varchar(100) not null primary key,
    Name varchar(50) not null,
    Country varchar(20), 
    State varchar(20),
    City varchar(20),
    TelephoneNumber varchar(20),
    AddressLine1 varchar(100),
    AddressLine2 varchar(100),
    DateOfBirth varchar(100),
    GrossSalaryFY2019_20 int,
    GrossSalaryFY2020_21 int,
    GrossSalaryFY2021_22 int,
    GrossSalaryFY2022_23 int,
    GrossSalaryFY2023_24 int, 
    RowIndex int
);

CREATE TABLE ChunkLogs(
    LogId int not null primary key auto_increment,
    InsertTime datetime,
    Status boolean,
    ErrorMsg varchar(50)
);

[HttpPut("batch")]
public async Task<IActionResult> UpdateEmployeeRecords([FromBody] List<EmployeeRecord> employeeRecords)
{
    using var connection = new MySqlConnection(connectionString);
    foreach (var record in employeeRecords){
        var result = await connection.ExecuteAsync(@"
            UPDATE employeerecords SET
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
            WHERE EmailId = @EmailId", record);

        if (result == 0)
        {
            return BadRequest($"Failed to update record with EmailId: {record.EmailId}");
        }
    }

    return Ok("Records updated successfully!");
}
async handleReplace() {
    let searchInput = document
        .querySelector("#searchInput")
        .value.toLowerCase();
    let replaceInput = document.querySelector("#replaceInput").value;

    if (searchInput === "") return;

    let updatedRecords = [];

    for (let i = 0; i < this.data.length; i++) {
        for (let j = 0; j < this.data[i].length; j++) {
            if (this.data[i][j].toString().toLowerCase().includes(searchInput)) {
                this.data[i][j] = this.data[i][j]
                    .toString()
                    .replace(new RegExp(searchInput, "gi"), replaceInput);

                // Collect the updated record
                let employeeRecord = {
                    EmailId: this.data[i][0],
                    Name: this.data[i][1],
                    Country: this.data[i][3],
                    State: this.data[i][4],
                    City: this.data[i][5],
                    TelephoneNumber: this.data[i][6],
                    AddressLine1: this.data[i][7],
                    AddressLine2: this.data[i][8],
                    DateOfBirth: this.data[i][9],
                    GrossSalaryFY2019_20: this.data[i][10],
                    GrossSalaryFY2020_21: this.data[i][11],
                    GrossSalaryFY2021_22: this.data[i][12],
                    GrossSalaryFY2022_23: this.data[i][13],
                    GrossSalaryFY2023_24: this.data[i][14]
                };

                updatedRecords.push(employeeRecord);
            }
        }
    }

    // Send the updated records to the server
    try {
        const res = await fetch("http://localhost:5294/api/EmployeeRecords/batch", {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedRecords),
        });

        if (!res.ok) {
            throw new Error("Failed to update data");
        }

        console.log("Data updated successfully!");
    } catch (error) {
        console.error('Error updating the records: ', error);
    }

    this.handleSearch();
    this.render();
    alert("Data replaced and updated successfully!");
}


