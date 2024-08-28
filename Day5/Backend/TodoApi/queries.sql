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
    rowIndex int
);

CREATE TABLE ChunkLogs(
    LogId int not null primary key auto_increment,
    InsertTime datetime,
    Status boolean,
    ErrorMsg varchar(50)
);

