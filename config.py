import os

# 是否开启debug模式
DEBUG = True

# 读取数据库环境变量
username = os.environ.get("MYSQL_USERNAME", 'worker')
password = os.environ.get("MYSQL_PASSWORD", 'Atlas040310631')
db = os.environ.get("MYSQL_DB", 'funroom')
db_address = os.environ.get("MYSQL_ADDRESS", 'sh-cynosdbmysql-grp-kukvu26y.sql.tencentcdb.com:28249')
