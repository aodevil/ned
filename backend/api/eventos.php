<?php
    function getResponse($connection, $params){
        
        $response = array("error"=>Errors::$list["noChanges"], "data"=>null);

        $action = $params->action;

        if($action === Actions::$list["insert"]){
            Evento::insert($connection, $params, $response);
        }
        elseif ($action === Actions::$list["select"]){
            try{
                $response["data"] = Evento::load($connection,$params,$response);
            }catch(Exception $e){
                $response["error"] = $e->getMessage();
            }
        }elseif ($action === Actions::$list["delete"]){
            $result = Evento::delete($connection,$params,$response);
            if($result){
                $response["data"] = $result;
            }
        }

        return $response;
    }
?>