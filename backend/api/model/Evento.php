<?php 

class Evento{

    public static function insert($connection, $params, &$response) {

        $item = $params->item;

        try {
            $connection->beginTransaction();

            $sql ="INSERT INTO eventos (ID, nombre, fecha, hora, centro, lugar, tipo, descripcion, disciplina, nombreDisciplina) VALUES (:ID,:nombre, :fecha, :hora, :centro, :lugar, :tipo, :descripcion, :disciplina, :nombreDisciplina) ON DUPLICATE KEY UPDATE nombre = :nombre, fecha = :fecha, hora = :hora, centro = :centro, lugar = :lugar, tipo = :tipo, descripcion = :descripcion, disciplina = :disciplina, nombreDisciplina = :nombreDisciplina; DELETE FROM eventos_enlaces WHERE evento = :ID; ";

            $stmt = $connection->prepare($sql);
            $stmt->bindParam(":ID", $item->ID);
            $stmt->bindParam(":nombre", $item->nombre);
            $stmt->bindParam(":fecha", $item->fecha);
            $stmt->bindValue(":hora", ($item->hora->h . ';' . $item->hora->m));
            $stmt->bindParam(":centro", $item->centro);
            $stmt->bindParam(":lugar", $item->lugar);
            $stmt->bindParam(":tipo", $item->tipo);
            $stmt->bindParam(":descripcion", $item->descripcion);
            $stmt->bindParam(":disciplina", $item->disciplina);
            $stmt->bindParam(":nombreDisciplina", $item->nombreDisciplina);
            $stmt->execute();
            $stmt = NULL;

            if ($item->enlaces && count($item->enlaces) > 0) {
                foreach ($item->enlaces as $i) {
                    $sql = "INSERT INTO eventos_enlaces (ID, titulo, url, evento) VALUES (:ID, :titulo, :url, :evento)";
                    $stmt = $connection->prepare($sql);
                    $stmt->bindParam(":ID", $i->ID);
                    $stmt->bindParam(":titulo", $i->titulo);
                    $stmt->bindParam(":url", $i->url);
                    $stmt->bindParam(":evento", $item->ID);
                    $stmt->execute();
                    $stmt = NULL;
                }
            }

            $connection->commit();

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

        $sql = "SELECT * FROM eventos WHERE FROM_UNIXTIME((fecha / 1000)) >= (NOW() - INTERVAL 2 DAY)";
        $stmt = $connection->prepare($sql);
        $stmt->execute();
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $stmt = NULL;

        if(!$rows){
            $response["error"] = Errors::$list["noData"];
        }else{
            foreach($rows as $row){
                $item = $row;
                $item["tipo"] = intval($row["tipo"]);
                $item["fecha"] = intval($row["fecha"]);
                if ($item["hora"]) {
                    $hora = explode(";",$item["hora"]);
                    $item["hora"] = array("h"=>$hora[0], "m"=>$hora[1]);
                } else {
                    $item["hora"] = array("h"=>0, "m"=>0);
                }
                $item["enlaces"] = array();

                $sql = "SELECT ID, titulo, url FROM eventos_enlaces WHERE evento = :evento";
                $stmt = $connection->prepare($sql);
                $stmt->bindParam(":evento", $item["ID"]);
                $stmt->execute();
                $enlaces = $stmt->fetchAll(PDO::FETCH_ASSOC);
                $stmt = NULL;

                if ($enlaces) {
                    foreach ($enlaces as $i) {
                        array_push($item["enlaces"], $i);
                    }
                }

                array_push($items,$item);
            }
            $response["error"] = null;
        }
        return $items;
    }

    public static function delete($connection, $params, &$response){

        $response["error"] = Errors::$list["noChanges"];

        $ID = $params->ID;

        try {

            $sql = "DELETE eventos, eventos_enlaces FROM eventos LEFT JOIN eventos_enlaces ON eventos.ID = eventos_enlaces.evento WHERE eventos.ID = :ID";
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