<?php
    function getResponse($connection, $params){
        
        $response = array("error"=>Errors::$list["noChanges"], "data"=>null);

        $action = $params->action;

        if($action === Actions::$list["insert"]){
            Actividad::insert($connection, $params, $response);
        } elseif ($action === Actions::$list["select"]){
            try{
                $response["data"] = Actividad::load($connection,$params,$response);
            }catch(Exception $e){
                $response["error"] = $e->getMessage();
            }
        } elseif ($action === Actions::$list["delete"]){
            $result = Actividad::delete($connection,$params,$response);
            if($result){
                $response["data"] = $result;
            }
        } elseif ($action === Actions::$list["insert"] . "recomendaciones"){
            $result = Actividad::insertRecommendation($connection,$params,$response);
            if($result){
                $response["data"] = $result;
            }
        } elseif ($action === Actions::$list["select"] . "recomendaciones"){
            $result = Actividad::selectRecommendations($connection,$params,$response);
            if($result){
                $response["data"] = $result;
            }
        } elseif ($action === Actions::$list["delete"] . "recomendaciones"){
            $result = Actividad::deleteRecommendation($connection,$params,$response);
            if($result){
                $response["data"] = $result;
            }
        }

        return $response;
    }
?>