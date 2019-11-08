<?php 

class Referencia{

    public static $PRUEBAS = array("equilibrio", "coordinacion", "flexibilidad", "brazos", "piernas", "abdomen", "resistencia");

    public static $MEDICIONES = array("peso", "estatura", "cintura", "cadera", "pantorrilla", "brazoRelajado", "brazoFlexionado", "tricipital", "subescapular", "supraespinal", "abdominal", "musloFrontal", "pantorrillaMedial", "sistole", "diastole", "pulso", "biestiloideo", "biepicondileo");

    public static function load($connection, $params, &$response){
        $response["error"] = Errors::$list["process"];

        $items = array();

        $sql = "SELECT * FROM pruebas_referencias ORDER BY ID ASC";
        $stmt = $connection->prepare($sql);
        $stmt->execute();
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $stmt = NULL;

        if(!$rows){
            $response["error"] = Errors::$list["noData"];
        }else{
            foreach($rows as $row){
                $item = array(
                    "ID"=>$row["ID"],
                    "evaluacion"=>$row["evaluacion"],
                    "grupo"=>$row["grupo"],
                    "unidad"=>$row["unidad"],
                    "bajo"=>doubleval($row["bajo"]),
                    "normal"=>doubleval($row["normal"]),
                    "alto"=>doubleval($row["alto"])
                );
                array_push($items,$item);
            }
            $response["error"] = null;
        }
        return $items;
    }

    public static function update($connection, $params, &$response){
        $response["error"] = Errors::$list["noChanges"];

        $items = $params->items;

        try {
            $connection->beginTransaction();

            if ($items && count($items) > 0) {
                foreach ($items as $i) {
                    $sql = "UPDATE pruebas_referencias SET unidad = :unidad, bajo = :bajo, normal = :normal, alto = :alto WHERE ID = :ID";
                    $stmt = $connection->prepare($sql);
                    $stmt->bindParam(":ID", $i->ID);
                    $stmt->bindParam(":unidad", $i->unidad);
                    $stmt->bindParam(":bajo", $i->bajo);
                    $stmt->bindParam(":normal", $i->normal);
                    $stmt->bindParam(":alto", $i->alto);
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
            $response["error"] = $response["error"] = Errors::$list["process"];
        }
    }
}

?>