<?php 

    function getResponse($connection, $params){
        
        $response = array("error"=>Errors::$list["noChanges"], "data"=>null);

        $action = $params->action;
        
        $updated = 0;

        if($action === Actions::$list["insert"]){
            Centro::insert($connection, $params, $response);
        }
        elseif ($action === Actions::$list["select"]){
            try{
                $response["data"] = Centro::load($connection,$params,$response);
            }catch(Exception $e){
                $response["error"] = $e->getMessage();
            }
        }elseif ($action === Actions::$list["delete"]){
            $result = Centro::delete($connection,$params,$response);
            if($result){
                $response["data"] = $result;
            }
        }

        return $response;
    }
?>