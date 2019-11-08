<?php 

    function getResponse($connection, $params){
        return Token::login($connection,$params);
    }

?>