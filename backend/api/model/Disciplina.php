<?php 

class Disciplina{

    public static function insert($connection, $params, &$response){

        $item = $params->item;

        try {
            $sql ="INSERT INTO disciplinas (ID, nombre) VALUES (:ID, :nombre) ON DUPLICATE KEY UPDATE nombre = :nombre";

            $stmt = $connection->prepare($sql);
            $stmt->bindParam(":ID", $item->ID);
            $stmt->bindParam(":nombre", $item->nombre);
            $stmt->execute();
            $stmt = NULL;

            $response["data"]=true;
            $response["error"] = null;

        } catch (PDOException $e) {
            $connection->rollback();
            $response["data"]=null;
            $response["error"] = Errors::$list["process"];
        }
    }

    public static function load($connection, $params, &$response){
        $response["error"] = Errors::$list["process"];

        $items = array();

        $sql = "SELECT ID, nombre FROM disciplinas ORDER BY nombre ASC";
        $stmt = $connection->prepare($sql);
        $stmt->execute();
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $stmt = NULL;

        if(!$rows){
            $response["error"] = Errors::$list["noData"];
        }else{
            foreach($rows as $row){
                array_push($items,$row);
            }
            $response["error"] = null;
        }
        return $items;
    }

    public static function delete($connection, $params, &$response){

        $response["error"] = Errors::$list["noChanges"];

        $ID = $params->ID;

        try {

            $sql = "DELETE FROM disciplinas WHERE ID = :ID";
            $stmt = $connection->prepare($sql);
            $stmt->bindParam(":ID",$ID);
            $stmt->execute();
            $stmt = NULL;

            $response["error"] = null;
            
            return array("ID"=>$ID);

        } catch (Exception $e) {

            $response["error"] = Errors::$list["process"];

            return false;
        }
    }
}

?>