<?php
    function getResponse($connection, $params){
        
        $response = array("error"=>Errors::$list["noChanges"], "data"=>null);

        $action = $params->action;

        if ($action === Actions::$list["select"]){
            try{
                $response["data"] = Referencia::load($connection,$params,$response);
            }catch(Exception $e){
                $response["error"] = $e->getMessage();
            }
        } elseif ($action === Actions::$list["update"]) {
            try{
                Referencia::update($connection,$params,$response);
            }catch(Exception $e){
                $response["error"] = $e->getMessage();
            }
        }

        return $response;
    }
?>