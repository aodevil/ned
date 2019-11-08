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
            Usuario::insert($connection, "ALUMN", 3, $params, $response);
        }elseif ($action === Actions::$list["select"]){
            try{
                if ($params->userName) {
                    $response["data"] = Usuario::findAthleteWithUserName($connection,$params,$response);
                } else if ($params->search) {
                    $response["data"] = Usuario::loadAthletesWithEvaluatorCenterAndSearch($connection,$params,$response);
                } else {
                    $response["data"] = Usuario::loadAthletesWithEvaluatorID($connection,$params,$response);
                }
            }catch(Exception $e){
                $response["error"] = $e->getMessage();
            }
            
        }elseif ($action === Actions::$list["delete"]){
            $result = Usuario::deleteUsuario($connection,$params,$response);
            if($result){
                $response["data"] = $result;
            }
        } elseif ($action === Actions::$list["update"]."actividades") {
            $result = Usuario::updateAthleteEvents($connection, $params, $response);
            if($result){
                $response["data"] = $result;
            }
        } elseif ($action === Actions::$list["select"]."actividades") {
            $result = Usuario::loadAthleteEvents($connection, $params, $response);
            if($result){
                $response["data"] = $result;
            }
        } elseif ($action === Actions::$list["select"]."evaluaciones") {
            $result = Usuario::loadAthleteTests($connection, $params, $response);
            if($result){
                $response["data"] = $result;
            }
        } elseif ($action === Actions::$list["insert"]."evaluaciones") {
            $result = Usuario::insertAthleteTests($connection, $params, $response);
            if($result){
                $response["data"] = $result;
            }
        } elseif ($action === Actions::$list["delete"]."evaluaciones") {
            $result = Usuario::deleteAthleteTests($connection, $params, $response);
            if($result){
                $response["data"] = $result;
            }
        } elseif ($action === Actions::$list["select"]."recomendaciones") {
            $result = Usuario::loadAthleteRecommendations($connection, $params, $response);
            if($result){
                $response["data"] = $result;
            }
        } elseif ($action === Actions::$list["insert"]."recomendaciones") {
            $result = Usuario::insertAthleteRecommendation($connection, $params, $response);
            if($result){
                $response["data"] = $result;
            }
        } elseif ($action === Actions::$list["delete"]."recomendaciones") {
            $result = Usuario::deleteAthleteRecommendation($connection, $params, $response);
            if($result){
                $response["data"] = $result;
            }
        } elseif ($action === Actions::$list["insert"]."ranking") {
            $result = Usuario::insertAthleteTestRanking($connection, $params, $response);
            if($result){
                $response["data"] = $result;
            }
        }

        return $response;
    }
?>