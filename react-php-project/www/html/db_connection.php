<?php
$db_conn = mysqli_connect("mysql","user","pass","db");
if (!$db_conn) {
    echo json_encode(["success"=>0,"msg"=>"Error: Unable to connect to MySQL.","DebuggingErrno"=>mysqli_connect_errno(),"DebuggingError"=>mysqli_connect_error()]);
    exit;
}

// echo "Success: A proper connection to MySQL was made! The my_db database is great." . PHP_EOL;
// echo "Host information: " . mysqli_get_host_info($db_conn) . PHP_EOL;

// mysqli_close($db_conn);