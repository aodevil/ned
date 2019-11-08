<?php 

class Centro{

    public static function insert($connection, $params, &$response){

        $centro = $params->centro;

        try {
            $connection->beginTransaction();

            $sql ="INSERT INTO centros (ID, nombre, domicilio, ciudad, estado, cp, pais, latitud, longitud, email) VALUES (:ID, :nombre, :domicilio, :ciudad, :estado, :cp, :pais, :latitud, :longitud, :email) ON DUPLICATE KEY UPDATE nombre = :nombre, domicilio = :domicilio, ciudad = :ciudad, estado = :estado, cp = :cp, pais = :pais, latitud = :latitud, longitud = :longitud, email = :email";

            $stmt = $connection->prepare($sql);
            $stmt->bindParam(":ID", $centro->ID);
            $stmt->bindParam(":nombre", $centro->nombre);
            $stmt->bindParam(":domicilio", $centro->domicilio);
            $stmt->bindParam(":ciudad", $centro->ciudad);
            $stmt->bindParam(":estado", $centro->estado);
            $stmt->bindParam(":cp", $centro->cp);
            $stmt->bindParam(":pais", $centro->pais);
            $stmt->bindParam(":latitud", $centro->lat);
            $stmt->bindParam(":longitud", $centro->long);
            $stmt->bindParam(":email", $centro->email);
            $stmt->execute();
            $stmt = NULL;

            $sql_telefonos = "INSERT INTO centros_telefonos (ID, centro, num) VALUES (:ID, :centro, :telefono) ON DUPLICATE KEY UPDATE num = :telefono";

            foreach($centro->telefonos as $tel){
                $stmt = $connection->prepare($sql_telefonos);
                $stmt->bindParam(":ID", $tel->ID);
                $stmt->bindParam(":centro", $centro->ID);
                $stmt->bindParam(":telefono", $tel->num);
                $stmt->execute();
                $stmt = NULL;
            }

            $sql_horarios = "INSERT INTO centros_horarios (ID, centro, tipo, de_dia, hasta_dia, de_hora, hasta_hora) VALUES (:ID, :centro, :tipo, :de_dia, :hasta_dia, :de_hora, :hasta_hora) ON DUPLICATE KEY UPDATE de_dia = :de_dia, hasta_dia = :hasta_dia, de_hora = :de_hora, hasta_hora = :hasta_hora";

            foreach($centro->horarios as $horario){
                $hora_i = $horario->de_hora->h . ";" .$horario->de_hora->m;
                $hora_e = $horario->hasta_hora->h . ";" .$horario->hasta_hora->m;
                $stmt = $connection->prepare($sql_horarios);
                $stmt->bindParam(":ID", $horario->ID);
                $stmt->bindParam(":centro", $centro->ID);
                $stmt->bindParam(":tipo", $horario->tipo);
                $stmt->bindParam(":de_dia", $horario->de_dia);
                $stmt->bindParam(":hasta_dia", $horario->hasta_dia);
                $stmt->bindParam(":de_hora", $hora_i);
                $stmt->bindParam(":hasta_hora", $hora_e);
                $stmt->execute();
                $stmt = NULL;
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

        $centros = array();

        $sql = "SELECT ID, nombre, domicilio, ciudad, estado, cp, pais, latitud AS lat, longitud AS 'long', email, (SELECT GROUP_CONCAT(CONCAT(ID,':',num) SEPARATOR ',') FROM centros_telefonos WHERE centro = centros.ID) AS telefonos, (SELECT GROUP_CONCAT(CONCAT(ID, ':', tipo, ':', de_dia, ':', hasta_dia, ':', de_hora, ':', hasta_hora) ORDER BY de_dia ASC SEPARATOR ',') FROM centros_horarios WHERE centro = centros.ID) AS horarios FROM centros ORDER BY centros.nombre";
        $stmt = $connection->prepare($sql);
        $stmt->execute();
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $stmt = NULL;

        if(!$rows){
            $response["error"] = Errors::$list["noData"];
        }else{
            foreach($rows as $row){

                $telefonos = array();
                $horarios = array();

                $rowTels = explode(",", $row["telefonos"]);
                $rowHrs = explode(",", $row["horarios"]);

                foreach($rowTels as $t) {
                    if(!$t) continue;
                    $data = explode(":", $t);
                    array_push($telefonos, array("ID"=>$data[0], "num"=>$data[1]));
                }

                foreach($rowHrs as $h){
                    if(!$h) continue;
                    $data = explode(":", $h);
                    $de_hora = explode(";", $data[4]);
                    $hasta_hora = explode(";", $data[5]);
                    array_push($horarios, array(
                        "ID"=>$data[0],
                        "tipo"=>intval($data[1]),
                        "de_dia"=>intval($data[2]),
                        "hasta_dia"=>intval($data[3]),
                        "de_hora"=>array("h"=>intval($de_hora[0]), "m"=>intval($de_hora[1])),
                        "hasta_hora"=>array("h"=>intval($hasta_hora[0]), "m"=>intval($hasta_hora[1]))
                    ));
                }

                $centro = $row;
                $centro["long"] = doubleval($row["long"]);
                $centro["lat"] = doubleval($row["lat"]);
                $centro["telefonos"] = $telefonos;
                $centro["horarios"] = $horarios;
                array_push($centros,$centro);
            }
            $response["error"] = null;
        }
        return $centros;
    }

    public static function delete($connection, $params, &$response){

        $response["error"] = Errors::$list["noChanges"];

        $ID = $params->ID;

        try {
            $connection->beginTransaction();
            
            $sql = "DELETE FROM centros WHERE ID = :ID";
            $stmt = $connection->prepare($sql);
            $stmt->bindParam(":ID",$ID);
            $stmt->execute();
            $stmt = NULL;

            $sql = "DELETE FROM centros_horarios WHERE centro = :ID";
            $stmt = $connection->prepare($sql);
            $stmt->bindParam(":ID",$ID);
            $stmt->execute();
            $stmt = NULL;

            $sql = "DELETE FROM centros_telefonos WHERE centro = :ID";
            $stmt = $connection->prepare($sql);
            $stmt->bindParam(":ID",$ID);
            $stmt->execute();
            $stmt = NULL;

            $sql = "DELETE FROM centros_usuarios WHERE centro = :ID";
            $stmt = $connection->prepare($sql);
            $stmt->bindParam(":ID",$ID);
            $stmt->execute();
            $stmt = NULL;

            $connection->commit();

            $response["error"] = null;
            
            return array("ID"=>$ID);

        } catch (Exception $e) {

            $response["error"] = Errors::$list["process"];

            return false;

        }
    }
}

?>