<?php 

class Actividad{

    public static function insert($connection, $params, &$response){

        $item = $params->item;

        try {
            $connection->beginTransaction();

            $sql ="INSERT INTO actividades (ID, centro, lugar, nombre, disciplina, descripcion, tipo) VALUES (:ID, :centro, :lugar, :nombre, :disciplina, :descripcion, :tipo) ON DUPLICATE KEY UPDATE centro = :centro, lugar = :lugar, nombre = :nombre, disciplina = :disciplina, descripcion = :descripcion, tipo = :tipo; DELETE actividades_horarios, detalles FROM actividades_horarios LEFT JOIN detalles ON actividades_horarios.ID = detalles.referente WHERE actividades_horarios.actividad = :ID";

            $stmt = $connection->prepare($sql);
            $stmt->bindParam(":ID", $item->ID);
            $stmt->bindParam(":centro", $item->centro);
            $stmt->bindParam(":lugar", $item->lugar);
            $stmt->bindParam(":nombre", $item->nombre);
            $stmt->bindParam(":disciplina", $item->disciplina);
            $stmt->bindParam(":descripcion", $item->descripcion);
            $stmt->bindParam(":tipo", $item->tipo);
            $stmt->execute();
            $stmt = NULL;

            if ($item->horarios && count($item->horarios) > 0) {
                foreach ($item->horarios as $h) {
                    $sql = "INSERT INTO actividades_horarios (ID, actividad, dias, de_hora, hasta_hora, edad_min, edad_max, sexo) VALUES (:ID, :actividad, :dias, :de_hora, :hasta_hora, :edad_min, :edad_max, :sexo)";

                    $stmt = $connection->prepare($sql);
                    $stmt->bindParam(":ID", $h->ID);
                    $stmt->bindParam(":actividad", $item->ID);
                    $stmt->bindValue(":dias", join(',', $h->dias));
                    $stmt->bindValue(":de_hora", ($h->de_hora->h . ';' . $h->de_hora->m));
                    $stmt->bindValue(":hasta_hora", ($h->hasta_hora->h . ';' . $h->hasta_hora->m));
                    $stmt->bindValue(":edad_min", $h->edad_min ? $h->edad_min : 0);
                    $stmt->bindValue(":edad_max", $h->edad_max ? $h->edad_max : 0);
                    $stmt->bindParam(":sexo", $h->sexo);
                    $stmt->execute();
                    $stmt = NULL;

                    $detalles = array_merge($h->costos, $h->requisitos);
                    if (count($detalles) > 0) {
                        foreach($detalles as $d) {
                            $sql ="INSERT INTO detalles (ID, referente, concepto, valor, tipo) VALUES (:ID, :referente, :concepto, :valor, :tipo)";

                            $stmt = $connection->prepare($sql);
                            $stmt->bindParam(":ID", $d->ID);
                            $stmt->bindParam(":referente", $h->ID);
                            $stmt->bindParam(":concepto", $d->concepto);
                            $stmt->bindValue(":valor", !$d->valor ? 0 : $d->valor);
                            $stmt->bindParam(":tipo", $d->tipo);
                            $stmt->execute();
                            $stmt = NULL;
                        }
                    }
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

        $sql = "SELECT ID, centro, lugar, nombre, disciplina, descripcion, tipo FROM actividades ORDER BY nombre ASC";
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
                $item["horarios"] = array();

                $sql = "SELECT ID, dias, de_hora, hasta_hora, edad_min, edad_max, sexo FROM actividades_horarios WHERE actividad = :actividad ORDER BY dias ASC";
                $stmt = $connection->prepare($sql);
                $stmt->bindParam(":actividad", $item["ID"]);
                $stmt->execute();
                $horarios = $stmt->fetchAll(PDO::FETCH_ASSOC);
                $stmt = NULL;

                if ($horarios) {
                    foreach ($horarios as $h) {
                        $horario = $h;
                        $horario["dias"] = array_map('intval', explode(',', $h["dias"]));

                        if ($h["de_hora"]) {
                            $de_hora = explode(";",$h["de_hora"]);
                            $horario["de_hora"] = array("h"=>$de_hora[0], "m"=>$de_hora[1]);
                        } else {
                            $horario["de_hora"] = array("h"=>0, "m"=>0);
                        }

                        if ($h["hasta_hora"]) {
                            $hasta_hora = explode(";",$h["hasta_hora"]);
                            $horario["hasta_hora"] = array("h"=>$hasta_hora[0], "m"=>$hasta_hora[1]);
                        } else {
                            $horario["hasta_hora"] = array("h"=>0, "m"=>0);
                        }

                        $horario["edad_min"] = intval($h["edad_min"]);
                        $horario["edad_max"] = intval($h["edad_max"]);
                        $horario["sexo"] = intval($h["sexo"]);

                        $sql = "SELECT ID, concepto, valor, tipo FROM detalles WHERE referente = :horario ORDER BY concepto ASC";
                        $stmt = $connection->prepare($sql);
                        $stmt->bindParam(":horario", $h["ID"]);
                        $stmt->execute();
                        $detalles = $stmt->fetchAll(PDO::FETCH_ASSOC);
                        $stmt = NULL;

                        $horario["costos"] = array();
                        $horario["requisitos"] = array();

                        if ($detalles) {
                            foreach ($detalles as $d) {
                                $detalle = array(
                                    "ID" => $d["ID"],
                                    "concepto" => $d["concepto"],
                                    "valor" => ($d["valor"] ? doubleval($d["valor"]) : ""),
                                    "tipo" => intval($d["tipo"])
                                );

                                if ($d["tipo"] == 0) {
                                    array_push($horario["costos"], $detalle);
                                } else {
                                    array_push($horario["requisitos"], $detalle);
                                }
                            }
                        }

                        array_push($item["horarios"], $horario);
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
            $sql = "DELETE actividades, actividades_horarios, detalles FROM actividades LEFT JOIN actividades_horarios ON actividades.ID = actividades_horarios.actividad LEFT JOIN detalles ON actividades_horarios.ID = detalles.referente WHERE actividades.ID = :ID";
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

    public static function insertRecommendation($connection, $params, &$response){

        $item = $params->item;

        try {
            if ($item->ID >= 0) {
                $sql = "UPDATE recomendaciones SET envia = :envia, recibe = :recibe, fecha = :fecha, texto = :texto, titulo = :titulo, tipo = :tipo WHERE ID = :ID";
            } else {
                $sql ="INSERT INTO recomendaciones (envia, recibe, fecha, texto, titulo, tipo) VALUES (:envia, :recibe, :fecha, :texto, :titulo, :tipo)";
            }

            $stmt = $connection->prepare($sql);
            if ($item->ID >= 0)
                $stmt->bindParam(":ID", $item->ID);
            $stmt->bindParam(":envia", $item->envia);
            $stmt->bindParam(":recibe", $item->recibe);
            $stmt->bindParam(":fecha", $item->fecha);
            $stmt->bindParam(":texto", $item->texto);
            $stmt->bindParam(":titulo", $item->titulo);
            $stmt->bindParam(":tipo", $item->tipo);
            $stmt->execute();
            $ID = $connection->lastInsertId();
            $stmt = NULL;

            $response["error"] = null;
            return intval($ID);
        } catch (PDOException $e) {
            $response["error"] = Errors::$list["process"];
            return null;
        }
    }

    public static function selectRecommendations($connection, $params, &$response){

        $ID = $params->ID;

        try {
            $sql = "SELECT recomendaciones.ID, recomendaciones.envia, recomendaciones.recibe, recomendaciones.fecha, recomendaciones.texto, recomendaciones.titulo, recomendaciones.tipo, perfiles.nombres, perfiles.apellidos, IFNULL(roles.rol, 0) as rol FROM recomendaciones LEFT JOIN perfiles ON perfiles.ID = recomendaciones.envia LEFT JOIN roles ON roles.ID = recomendaciones.envia WHERE recibe = :ID ORDER BY recomendaciones.fecha ASC";

            $stmt = $connection->prepare($sql);
            $stmt->bindParam(":ID", $ID);
            $stmt->execute();
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $stmt = NULL;
            if($rows){
                $data = array();
                foreach($rows as $row){
                    $i = $row;
                    $i["fecha"] = intval($row["fecha"]);
                    $i["nombres"] = $row["nombres"] ? $row["nombres"] . " " . $row["apellidos"] : "";
                    $i["rol"] = intval($row["rol"]);
                    $i["tipo"] = intval($row["tipo"]);
                    array_push($data, $i);
                }
                $response["error"] = null;
                return $data;
            }
            $response["error"] = Errors::$list["noData"];
            return null;

        } catch (PDOException $e) {
            $response["error"] = Errors::$list["process"];
            return null;
        }
    }

    public static function deleteRecommendation($connection, $params, &$response) {
        $response["error"] = Errors::$list["process"];
        
        $ID = $params->ID;

        $sql = "DELETE FROM recomendaciones WHERE ID = :ID";
        $stmt = $connection->prepare($sql);
        $stmt->bindParam(":ID", $ID);
        $stmt->execute();
        $deleted = $stmt->rowCount();
        $stmt = NULL;

        if($deleted){
            $response["error"] = null;
            return true;
        }
        $response["error"] = Errors::$list["noChanges"];
        return false;
    }
}

?>