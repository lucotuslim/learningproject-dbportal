CREATE TABLE #ReconcileCustomerPermission
(
    GroupName NVARCHAR(100),
    DatabaseName VARCHAR(100),
    Permission Varchar(100)
);

Insert into #ReconcileCustomerPermission
values
    ('NonProd-Owner-Group', 'NonProdClientDb1', 'db_owner'),
    ('NonProd-Owner-Group2', 'NonProdClientDb2', 'db_owner'),
    ('NonProd-Owner-Group', 'NonProdClientDb3', 'db_owner'),
    ('NonProd-Owner-Group', 'NonProdClientDb4', 'db_owner'),
    ('NonProd-Owner-Group', 'NonProdClientDb5', 'db_owner'),
    ('NonProd-Owner-Group', 'NonProdClientDb6', 'db_owner'),
    ('NonProd-Owner-Group', 'NonProdClientDb7', 'db_owner'),
    ('NonProd-Owner-Group', 'NonProdClientDb8', 'db_owner'),
    ('NonProd-Owner-Group', 'NonProdClientDb9', 'db_owner'),
    ('NonProd-Owner-Group', 'NonProdClientDb10', 'db_owner');

select distinct GroupName
from #ReconcileCustomerPermission
where GroupName not in (
select name
from sys.server_principals
)

Drop table #ReconcileCustomerPermission;