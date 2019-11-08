<?php 
    function getResponse($connection, $params){
        global $token;
        $response = array("error"=>Errors::$list["inactive"], "data"=>null);
        Token::validate($connection, $token, $response);
        return $response;
    }
?>