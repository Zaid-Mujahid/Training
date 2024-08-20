CREATE TABLE Staff (
    emailID varchar(200) not null primary key,
    name varchar(50) not null,
    country varchar(50), 
    state varchar(50),
    city varchar(50),
    telephone int,
    address_line1 varchar(250),
    address_line2 varchar(250),
    dob datetime,
    fy2019_20 int,
    fy2020_21 int,
    fy2021_22 int,
    fy2022_23 int,
    fy2023_24 int
);
CREATE TABLE EmployeeRecords (
    email_id varchar(100) not null primary key,
    name varchar(50) not null,
    country varchar(20), 
    state varchar(20),
    city varchar(20),
    telephone_number varchar(20),
    address_line_1 varchar(100),
    address_line_2 varchar(100),
    date_of_birth datetime,
    gross_salary_FY2019_20 int,
    gross_salary_FY2020_21 int,
    gross_salary_FY2021_22 int,
    gross_salary_FY2022_23 int,
    gross_salary_FY2023_24 int,
    rowIndex int
);
