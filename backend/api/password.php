<?php

require 'SwiftMailer/autoload.php';

function getResponse($connection, $params){
    return Token::passwordRecovery($connection,$params);
}

?>