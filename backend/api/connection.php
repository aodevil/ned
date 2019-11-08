<?php
try {
        $connection = new PDO("mysql:host=localhost;dbname=...;charset=utf8", "user", "pass");
        $connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    }
catch(PDOException $e)
    {
        $response["error"] = Errors::$list["connection"];
    }
?>