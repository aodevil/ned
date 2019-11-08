<?php
    require 'SpreadSheet/autoload.php';

    function getResponse($connection, $params){
        
        $response = array("error"=>Errors::$list["noData"], "data"=>null);

        $action = $params->action;

        if ($action === Actions::$list["select"]."charts"){
            try{
                Estadistica::chartsData($connection,$params,$response);
            }catch(Exception $e){
                $response["error"] = $e->getMessage();
            }
        }elseif ($action === Actions::$list["select"]."export"){
            try{
                Estadistica::exportData($connection,$params,$response);
            }catch(Exception $e){
                $response["error"] = $e->getMessage();
            }
        }

        return $response;
    }
?>