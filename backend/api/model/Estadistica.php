<?php 

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

define("ASSETS", "assets/reports/");

class Estadistica{

    // CHARTS

    private static $chartsAgeQueries = array(
        "",
        " AND edad_actual < 15",
        " AND (edad_actual >= 15 AND edad_actual <= 19)",
        " AND (edad_actual >= 20 AND edad_actual <= 29)",
        " AND (edad_actual >= 30 AND edad_actual <= 39)",
        " AND (edad_actual >= 40 AND edad_actual <= 49)",
        " AND (edad_actual >= 50)"
    );

    private static $chartsQueries = array(
        //  NÚMERO DE EVALUADORES POR CENTRO
        "SELECT (SELECT COUNT(usuarios.ID) FROM usuarios LEFT JOIN roles ON usuarios.ID = roles.ID LEFT JOIN centros_usuarios ON centros_usuarios.ID = usuarios.ID WHERE usuarios.activo = 1 AND roles.rol = 2 AND centros_usuarios.centro = centros.ID AND (usuarios.registro >= :desde AND usuarios.registro <= :hasta)) as entrenadores, (SELECT COUNT(usuarios.ID) FROM usuarios LEFT JOIN roles ON usuarios.ID = roles.ID LEFT JOIN centros_usuarios ON centros_usuarios.ID = usuarios.ID WHERE usuarios.activo = 1 AND roles.rol = 3 AND centros_usuarios.centro = centros.ID AND (usuarios.registro >= :desde AND usuarios.registro <= :hasta)) as nutriologos, centros.ID, centros.nombre FROM centros GROUP BY centros.ID",

        //  NÚMERO DE ALUMNOS POR CENTRO
        "SELECT (SELECT COUNT(usuarios.ID) FROM usuarios LEFT JOIN perfiles ON usuarios.ID = perfiles.ID LEFT JOIN centros_usuarios ON centros_usuarios.ID = usuarios.ID WHERE usuarios.activo = 1 AND usuarios.tipo = 3 AND perfiles.sexo = 0 AND centros_usuarios.centro = centros.ID AND (usuarios.registro >= :desde AND usuarios.registro <= :hasta)) as masculino, (SELECT COUNT(usuarios.ID) FROM usuarios LEFT JOIN perfiles ON usuarios.ID = perfiles.ID LEFT JOIN centros_usuarios ON centros_usuarios.ID = usuarios.ID WHERE usuarios.activo = 1 AND usuarios.tipo = 3 AND perfiles.sexo = 1 AND centros_usuarios.centro = centros.ID AND (usuarios.registro >= :desde AND usuarios.registro <= :hasta)) as femenino, centros.ID, centros.nombre FROM centros GROUP BY centros.ID",

        //  TOTAL DE USUARIOS POR CENTRO
        "SELECT (SELECT COUNT(usuarios.ID) FROM usuarios LEFT JOIN centros_usuarios ON usuarios.ID = centros_usuarios.ID WHERE usuarios.activo = 1 AND usuarios.tipo = 2 AND centros_usuarios.centro = centros.ID AND (usuarios.registro >= :desde AND usuarios.registro <= :hasta)) as evaluadores, (SELECT COUNT(usuarios.ID) FROM usuarios LEFT JOIN centros_usuarios ON usuarios.ID = centros_usuarios.ID WHERE usuarios.activo = 1 AND usuarios.tipo = 3 AND centros_usuarios.centro = centros.ID AND (usuarios.registro >= :desde AND usuarios.registro <= :hasta)) as alumnos, centros.ID, centros.nombre FROM centros",
        
        //  ALUMNOS ATENDIDOS POR CENTRO
        "SELECT (SELECT COUNT(DISTINCT(pruebas_alumnos.alumno)) FROM pruebas_alumnos WHERE pruebas_alumnos.centro = centros.ID AND (pruebas_alumnos.fecha >= :desde AND pruebas_alumnos.fecha <= :hasta)) as pruebas, (SELECT COUNT(DISTINCT(mediciones_alumnos.alumno)) FROM mediciones_alumnos WHERE mediciones_alumnos.centro = centros.ID AND (mediciones_alumnos.fecha >= :desde AND mediciones_alumnos.fecha <= :hasta)) as mediciones, centros.ID, centros.nombre FROM centros GROUP BY ID",

        //  ALUMNOS ATENDIDOS POR EVALUADOR
        "SELECT (count(DISTINCT(pruebas_alumnos.alumno)) / count(DISTINCT(pruebas_alumnos.evaluador))) as pruebas, (count(DISTINCT(mediciones_alumnos.alumno)) / count(DISTINCT(mediciones_alumnos.evaluador))) as mediciones, centros.ID, centros.nombre FROM centros LEFT JOIN pruebas_alumnos ON pruebas_alumnos.centro = centros.ID LEFT JOIN mediciones_alumnos ON mediciones_alumnos.centro = centros.ID WHERE (pruebas_alumnos.fecha >= :desde AND pruebas_alumnos.fecha <= :hasta) OR (mediciones_alumnos.fecha >= :desde AND mediciones_alumnos.fecha <= :hasta) GROUP BY centros.ID",

        //  EVALUACIONES PROMEDIO REALIZADAS POR DÍA
        "SELECT (SELECT (count(pruebas_alumnos.alumno) / count(DISTINCT(pruebas_alumnos.fecha))) FROM pruebas_alumnos WHERE pruebas_alumnos.centro = centros.ID AND (pruebas_alumnos.fecha >= :desde AND pruebas_alumnos.fecha <= :hasta)) as pruebas, (SELECT (count(mediciones_alumnos.alumno) / count(DISTINCT(mediciones_alumnos.fecha))) FROM mediciones_alumnos WHERE mediciones_alumnos.centro = centros.ID AND (mediciones_alumnos.fecha >= :desde AND mediciones_alumnos.fecha <= :hasta)) as mediciones, centros.ID, centros.nombre FROM centros GROUP BY centros.ID",

        //  CALIFICACIÓN PROMEDIO DE LAS EVALUACIONES
        "SELECT AVG(evaluaciones_rankings.ranking) as ranking, centros.ID, centros.nombre FROM evaluaciones_rankings LEFT JOIN centros ON  evaluaciones_rankings.centro = centros.ID WHERE evaluaciones_rankings.fecha >= :desde AND evaluaciones_rankings.fecha <= :hasta GROUP BY centros.ID",

        //  ACTIVIDAD FÍSICA
        "SELECT 
            AVG(pruebas_alumnos.equilibrio) as equilibrio, 
            AVG(pruebas_alumnos.coordinacion) as coordinacion,
            AVG(pruebas_alumnos.flexibilidad) as flexibilidad,
            AVG(pruebas_alumnos.brazos) as brazos,
            AVG(pruebas_alumnos.piernas) as piernas,
            AVG(pruebas_alumnos.abdomen) as abdomen,
            AVG(pruebas_alumnos.resistencia) as resistencia,
            centros.ID,
            centros.nombre 
        FROM pruebas_alumnos 
        LEFT JOIN centros ON pruebas_alumnos.centro = centros.ID
        LEFT JOIN perfiles ON pruebas_alumnos.alumno = perfiles.ID
        WHERE (pruebas_alumnos.fecha >= :desde AND pruebas_alumnos.fecha <= :hasta)",

        //  NUTRICIÓN
        "SELECT 
            AVG(mediciones_alumnos.peso) as peso,
            AVG(mediciones_alumnos.estatura) as estatura,
            AVG(mediciones_alumnos.cintura) as cintura,
            AVG(mediciones_alumnos.cadera) as cadera,
            AVG(mediciones_alumnos.pantorrilla) as pantorrilla,
            AVG(mediciones_alumnos.brazoRelajado) as brazoRelajado,
            AVG(mediciones_alumnos.brazoFlexionado) as brazoFlexionado,
            AVG(mediciones_alumnos.tricipital) as tricipital,
            AVG(mediciones_alumnos.subescapular) as subescapular,
            AVG(mediciones_alumnos.supraespinal) as supraespinal,
            AVG(mediciones_alumnos.abdominal) as abdominal,
            AVG(mediciones_alumnos.musloFrontal) as musloFrontal,
            AVG(mediciones_alumnos.pantorrillaMedial) as pantorrillaMedial,
            AVG(mediciones_alumnos.sistole) as sistole,
            AVG(mediciones_alumnos.pulso) as pulso,
            AVG(mediciones_alumnos.biestiloideo) as biestiloideo,
            AVG(mediciones_alumnos.biepicondileo) as biepicondileo,
            centros.ID,
            centros.nombre 
        FROM mediciones_alumnos 
        LEFT JOIN centros ON mediciones_alumnos.centro = centros.ID 
        LEFT JOIN perfiles ON mediciones_alumnos.alumno = perfiles.ID
        WHERE (mediciones_alumnos.fecha >= :desde AND mediciones_alumnos.fecha <= :hasta)"
    );

    private static function validateAdminUser($connection, $params) {
        $usuario = $params->usuario;
        if ($usuario) {
            $sql = "SELECT ID FROM usuarios WHERE ID = :usuario AND tipo = 1 AND activo = 1 LIMIT 1";
            $stmt = $connection->prepare($sql);
            $stmt->bindParam(":usuario", $usuario);
            $stmt->execute();
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            $stmt = NULL;
            return $row ? true : false;
        }
        return false;
    }

    public static function chartsData($connection, $params, &$response){
        $response["error"] = Errors::$list["process"];
        
        if (!Estadistica::validateAdminUser($connection, $params)) {
            $response["error"] = Errors::$list["userNotFound"];
            return;
        }

        $parametro = $params->parametro;
        $edad = $params->edad;
        $sexo = $params->sexo;
        $desde = $params->desde;
        $hasta = $params->hasta;

        $sql = self::$chartsQueries[$parametro];

        if ($parametro >= 7) {
            if ($sexo != 2) {
                $sql .= " AND sexo = :sexo";
            }
            $sql .= self::$chartsAgeQueries[$edad];
            $sql .= " GROUP BY centro";
        }

        $stmt = $connection->prepare($sql);
        $stmt->bindParam(":desde", $desde);
        $stmt->bindParam(":hasta", $hasta);
        if ($parametro >= 7 && $sexo != 2) {
            $stmt->bindParam(":sexo", $sexo);
        }
        $stmt->execute();
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $stmt = NULL;

        if(!$rows){
            $response["error"] = Errors::$list["noData"];
        }else{
            $response["data"] = $rows;
            $response["error"] = null;
        }
    }

    //  EXPORT
    private static $tabsHeaders = array(
        "tab1" => array(
            "Centro",
            "Núm. de entrenadores",
            "Núm. de nutriólogos",
            "Total de evaluadores",
            "Alumnos",
            "Alumnas",
            "Total de alumnos",
            "Evaluaciones act. física",
            "Evaluaciones nutrición",
            "Total de evaluaciones"
        ),
        "tab2" => array(
            "ID evaluador",
            "Estado",
            "Centro",
            "Rol",
            "Alumnos atendidos",
            "Evaluación promedio (según alumnos)"
        ),
        "tab3" => array(
            "Fecha",
            "ID alumno",
            "Centro",
            "ID evaluador",
            "Sexo",
            "Edad (al momento)",
            "Peso (Kg)",
            "Estatura (m)",
            "Cintura (cm)",
            "Cadera (cm)",
            "C. Pantorrilla (cm)",
            "C. Brazo relajado (cm)",
            "C. Brazo flexionado (cm)",
            "Pl. Tricipital (mm)",
            "Pl. Subescapular (mm)",
            "Pl. Supraespinal (mm)",
            "Pl. Abdominal (mm)",
            "Pl. Muslo (mm)",
            "Pl. Pantorrilla (mm)",
            "Sístole",
            "Diástole",
            "Pulso (ppm)",
            "D. Biestiloideo",
            "D. Biepicondileo",
            "Peso ideal (Kg)",
            "IMC",
            "ICC",
            "Sumatoria de pliegues",
            "Grasa (%)"
        ),
        "tab4" => array(
            "Fecha",
            "ID alumno",
            "Centro",
            "ID evaluador",
            "Sexo",
            "Edad (al momento)",
            "Equilibrio (seg)",
            "Coordinacion (min)",
            "Flexibilidad (cm)",
            "Fuerza en brazos (reps)",
            "Fuerza en piernas (reps)",
            "Fuerza en abdomen (reps)",
            "Cooper (Km)",
            "VO2Máx"
        )
    );

    private static $tab1Query = "SELECT centros.nombre as centro,
    (SELECT COUNT(roles.ID) FROM roles LEFT JOIN centros_usuarios ON roles.ID = centros_usuarios.ID LEFT JOIN usuarios ON roles.ID = usuarios.ID WHERE usuarios.activo = 1 AND roles.rol = 2 AND centros_usuarios.centro = centros.ID AND usuarios.registro >= :desde AND usuarios.registro <= :hasta) as entrenadores,
    (SELECT COUNT(roles.ID) FROM roles LEFT JOIN centros_usuarios ON roles.ID = centros_usuarios.ID LEFT JOIN usuarios ON roles.ID = usuarios.ID WHERE usuarios.activo = 1 AND roles.rol = 3 AND centros_usuarios.centro = centros.ID AND usuarios.registro >= :desde AND usuarios.registro <= :hasta) as nutriologos,
    (SELECT entrenadores + nutriologos) as evaluadores,
    (SELECT COUNT(usuarios.ID) FROM usuarios LEFT JOIN centros_usuarios ON usuarios.ID = centros_usuarios.ID LEFT JOIN perfiles ON perfiles.ID = usuarios.ID WHERE usuarios.activo = 1 AND usuarios.tipo = 3 AND centros_usuarios.centro = centros.ID AND perfiles.sexo = 0 AND usuarios.registro >= :desde AND usuarios.registro <= :hasta) as alumnos_masculino,
    (SELECT COUNT(usuarios.ID) FROM usuarios LEFT JOIN centros_usuarios ON usuarios.ID = centros_usuarios.ID LEFT JOIN perfiles ON perfiles.ID = usuarios.ID WHERE usuarios.activo = 1 AND usuarios.tipo = 3 AND centros_usuarios.centro = centros.ID AND perfiles.sexo = 1 AND usuarios.registro >= :desde AND usuarios.registro <= :hasta) as alumnos_femenino,
    (SELECT alumnos_femenino + alumnos_masculino) as alumnos,
    (SELECT COUNT(pruebas_alumnos.alumno) FROM pruebas_alumnos WHERE pruebas_alumnos.centro = centros.ID AND pruebas_alumnos.fecha >= :desde AND pruebas_alumnos.fecha <= :hasta) as evaluaciones_fisicas,
    (SELECT COUNT(mediciones_alumnos.alumno) FROM mediciones_alumnos WHERE mediciones_alumnos.centro = centros.ID AND mediciones_alumnos.fecha >= :desde AND mediciones_alumnos.fecha <= :hasta) as evaluaciones_nutricion,
    (SELECT evaluaciones_fisicas + evaluaciones_nutricion) as evaluaciones
    FROM centros;";

    private static $tab2Query = "SELECT usuarios.usuario as evaluador,
    (CASE WHEN usuarios.activo = 1 THEN 'activo' ELSE 'inactivo' END) as estado,
    centros.nombre as centro,
    (CASE WHEN roles.rol = 2 THEN 'entrenador' WHEN roles.rol = 3 THEN 'nutriologo' ELSE '' END) AS rol,
    IF(roles.rol = 2, 
        (SELECT COUNT(DISTINCT(pruebas_alumnos.alumno)) FROM pruebas_alumnos WHERE pruebas_alumnos.evaluador = usuarios.ID AND pruebas_alumnos.fecha >= :desde AND pruebas_alumnos.fecha <= :hasta), 
        (SELECT COUNT(DISTINCT(mediciones_alumnos.alumno)) FROM mediciones_alumnos WHERE mediciones_alumnos.evaluador = usuarios.ID AND mediciones_alumnos.fecha >= :desde AND mediciones_alumnos.fecha <= :hasta)
    ) as alumnos_atendidos,
    IFNULL((SELECT AVG(evaluaciones_rankings.ranking) + 1 FROM evaluaciones_rankings WHERE evaluaciones_rankings.evaluador = usuarios.ID AND evaluaciones_rankings.fecha >= :desde AND evaluaciones_rankings.fecha <= :hasta), 0) as calificacion
    FROM usuarios
    LEFT JOIN roles ON usuarios.ID = roles.ID
    LEFT JOIN centros_usuarios ON usuarios.ID = centros_usuarios.ID
    LEFT JOIN centros ON centros_usuarios.centro = centros.ID
    WHERE usuarios.tipo = 2  
    ORDER BY centro, rol;";

    private static $tab3Query = "SELECT DATE_FORMAT(FROM_UNIXTIME(mediciones_alumnos.fecha / 1000), '%d/%m/%Y') AS fecha,
    usuarios.usuario,
    centros.nombre as centro,
    IFNULL((SELECT usuarios.usuario FROM usuarios WHERE usuarios.ID = mediciones_alumnos.evaluador), '[Borrado]') as evaluador,
    (CASE WHEN perfiles.sexo = 0 THEN 'M' ELSE 'F' END) as sexo,
    mediciones_alumnos.edad_actual as edad,
    mediciones_alumnos.peso,
    mediciones_alumnos.estatura,
    mediciones_alumnos.cintura,
    mediciones_alumnos.cadera,
    mediciones_alumnos.pantorrilla,
    mediciones_alumnos.brazoRelajado,
    mediciones_alumnos.brazoFlexionado,
    mediciones_alumnos.tricipital,
    mediciones_alumnos.subescapular,
    mediciones_alumnos.supraespinal,
    mediciones_alumnos.abdominal,
    mediciones_alumnos.musloFrontal,
    mediciones_alumnos.pantorrillaMedial,
    mediciones_alumnos.sistole,
    mediciones_alumnos.diastole,
    mediciones_alumnos.pulso,
    mediciones_alumnos.biestiloideo,
    mediciones_alumnos.biepicondileo,
    ROUND(IF(perfiles.sexo = 0, POW(mediciones_alumnos.estatura, 2) * 23, POW(mediciones_alumnos.estatura, 2) * 22), 2) as pesoIdeal,
    IFNULL(ROUND(mediciones_alumnos.peso / POW(mediciones_alumnos.estatura, 2)), 0) as imc,
    IFNULL(ROUND(mediciones_alumnos.cintura / mediciones_alumnos.cadera, 2), 0) as icc,
    (
        mediciones_alumnos.tricipital +
        mediciones_alumnos.subescapular +
        mediciones_alumnos.supraespinal +
        mediciones_alumnos.abdominal +
        mediciones_alumnos.muslofrontal +
        mediciones_alumnos.pantorrillamedial
    ) as sumatoriaDePliegues,
    (SELECT IF(sumatoriaDePliegues > 0, ROUND(IF(perfiles.sexo = 0, sumatoriaDePliegues * 0.1052 + 2.585, sumatoriaDePliegues * 0.1548 + 3.58), 2), 0)) as grasa
    FROM mediciones_alumnos
    LEFT JOIN usuarios ON mediciones_alumnos.alumno = usuarios.ID
    LEFT JOIN perfiles ON usuarios.ID = perfiles.ID
    LEFT JOIN centros_usuarios ON usuarios.ID = centros_usuarios.ID
    LEFT JOIN centros ON centros_usuarios.centro = centros.ID
    WHERE usuarios.tipo = 3 AND mediciones_alumnos.fecha >= :desde AND mediciones_alumnos.fecha <= :hasta
    ORDER BY centro, mediciones_alumnos.fecha";

    private static $tab4Query = "SELECT
	DATE_FORMAT(FROM_UNIXTIME(pruebas_alumnos.fecha / 1000), '%d/%m/%Y') AS fecha,
    usuarios.usuario,
    centros.nombre as centro,
    IFNULL((SELECT usuarios.usuario FROM usuarios WHERE usuarios.ID = pruebas_alumnos.evaluador), '[Borrado]') as evaluador,
    (CASE WHEN perfiles.sexo = 0 THEN 'M' ELSE 'F' END) as sexo,
    pruebas_alumnos.edad_actual as edad,
    pruebas_alumnos.equilibrio,
    pruebas_alumnos.coordinacion,
    pruebas_alumnos.flexibilidad,
    pruebas_alumnos.brazos,
    pruebas_alumnos.piernas,
    pruebas_alumnos.abdomen,
    pruebas_alumnos.resistencia as cooper,
    IFNULL(ROUND(22.351 * pruebas_alumnos.resistencia - 11.288,2), 0) as vo2max
    FROM pruebas_alumnos
    LEFT JOIN usuarios ON pruebas_alumnos.alumno = usuarios.ID
    LEFT JOIN perfiles ON usuarios.ID = perfiles.ID
    LEFT JOIN centros_usuarios ON usuarios.ID = centros_usuarios.ID
    LEFT JOIN centros ON centros_usuarios.centro = centros.ID
    WHERE usuarios.tipo = 3 AND pruebas_alumnos.fecha >= :desde AND pruebas_alumnos.fecha <= :hasta
    ORDER BY centro, pruebas_alumnos.fecha";


    private static function requestData($connection, $params) {
        try {
            $sql = self::$tab1Query;
            $stmt = $connection->prepare($sql);
            $stmt->bindParam(":desde", $params->desde);
            $stmt->bindParam(":hasta", $params->hasta);
            $stmt->execute();
            $tab1 = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $stmt = NULL;

            $sql = self::$tab2Query;
            $stmt = $connection->prepare($sql);
            $stmt->bindParam(":desde", $params->desde);
            $stmt->bindParam(":hasta", $params->hasta);
            $stmt->execute();
            $tab2 = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $stmt = NULL;

            $sql = self::$tab3Query;
            $stmt = $connection->prepare($sql);
            $stmt->bindParam(":desde", $params->desde);
            $stmt->bindParam(":hasta", $params->hasta);
            $stmt->execute();
            $tab3 = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $stmt = NULL;

            $sql = self::$tab4Query;
            $stmt = $connection->prepare($sql);
            $stmt->bindParam(":desde", $params->desde);
            $stmt->bindParam(":hasta", $params->hasta);
            $stmt->execute();
            $tab4 = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $stmt = NULL;

            $result = array(
                "tab1"=>$tab1,
                "tab2"=>$tab2,
                "tab3"=>$tab3,
                "tab4"=>$tab4
            );
            return $result;
        } catch (Exception $e) {
            return null;
        }
    }

    private static function deletePrevSpreadSheets($sender) {
        try {
            $files = scandir(ASSETS);
            foreach ($files as $file) {
                if (stripos($file, $sender) !== false) {
                    unlink(ASSETS . $file);
                }
            }
            return true;
        } catch (Exception $e) {
            return false;
        }
    }

    private static function createSpreadSheet($headers, $tabs, $sender, $secure) {
        try {
            self::deletePrevSpreadSheets($sender);
            $uniq = uniqid();
            $fname = "{$sender}{$uniq}.xlsx";
            $path = ASSETS . $fname;
            $protocol = isset($_SERVER["HTTPS"]) ? "https://" : "http://";
            $host = $_SERVER["SERVER_NAME"];
            $fullPath = $protocol . $host . "/" . $path;

            $spreadsheet = new Spreadsheet();

            $sheet1 = $spreadsheet->getActiveSheet();
            $sheet1->setTitle("Existencias");
            $sheet1->fromArray(self::$tabsHeaders["tab1"], NULL, 'A1');

            $col = 1;
            $row = 1;
            foreach ($tabs["tab1"] as $arr) {
                $row++;
                $cell = $sheet1->getCellByColumnAndRow($col, $row)->getCoordinate();
                $sheet1->fromArray($arr, NULL, $cell);
            }
            
            $sheet2 = $spreadsheet->createSheet();
            $sheet2->setTitle("Evaluadores");
            $sheet2->fromArray(self::$tabsHeaders["tab2"], NULL, 'A1');

            $row = 1;
            foreach ($tabs["tab2"] as $arr) {
                $row++;
                $cell = $sheet2->getCellByColumnAndRow($col, $row)->getCoordinate();
                $sheet2->fromArray($arr, NULL, $cell);
            }

            $sheet3 = $spreadsheet->createSheet();
            $sheet3->setTitle("Nutrición");
            $sheet3->fromArray(self::$tabsHeaders["tab3"], NULL, 'A1');

            $row = 1;
            foreach ($tabs["tab3"] as $arr) {
                $row++;
                $cell = $sheet3->getCellByColumnAndRow($col, $row)->getCoordinate();
                $sheet3->fromArray($arr, NULL, $cell);
            }

            $sheet4 = $spreadsheet->createSheet();
            $sheet4->setTitle("Actividad física");
            $sheet4->fromArray(self::$tabsHeaders["tab4"], NULL, 'A1');

            $row = 1;
            foreach ($tabs["tab4"] as $arr) {
                $row++;
                $cell = $sheet4->getCellByColumnAndRow($col, $row)->getCoordinate();
                $sheet4->fromArray($arr, NULL, $cell);
            }

            $writer = new Xlsx($spreadsheet);
            $writer->save($path);
            $spreadsheet->disconnectWorksheets();
            unset($spreadsheet);

            return array("path"=>$fullPath);
        } catch (Exception $e) {
            return null;
        }
    }

    public static function exportData($connection, $params, &$response){
        $response["error"] = Errors::$list["process"];

        if (!Estadistica::validateAdminUser($connection, $params)) {
            $response["error"] = Errors::$list["userNotFound"];
            return;
        }

        $data = self::requestData($connection, $params);

        if(!$data){
            $response["error"] = Errors::$list["noData"];
        }else{
            $result = self::createSpreadSheet($headers, $data, $params->sender, true);
            if ($result) {
                $response["data"] = $result;
                $response["error"] = null;
            } else {
                $response["data"] = null;
                $response["error"] = Errors::$list["createFile"];
            }
        }
    }
}

?>