<?php 

    require 'SwiftMailer/autoload.php';

    function getResponse($connection, $params){
        global $token;
        
        $response = array("error"=>Errors::$list["noChanges"], "data"=>null);

        $action = $params->action;
        $self = $params->self;

        $updated = 0;

        if($self){
            $updated = Usuario::updateSelf($connection, $params, $token, $response);
            if($updated) {
                return Token::loginWithID($connection,$updated);
            }
        }elseif($action === Actions::$list["login"]){
            return Token::loginWithToken($connection,$params->token);
        }elseif ($action === Actions::$list["update"]){
            Usuario::insert($connection, "COORD", 1, $params, $response);
        }elseif ($action === Actions::$list["select"]){
            $response["data"] = Usuario::loadUsuarios($connection,$params,$response);
        }elseif ($action === Actions::$list["delete"]){
            $result = Usuario::deleteUsuario($connection,$params,$response);
            if($result){
                $response["data"] = $result;
            }
        }

        return $response;
    }
?>