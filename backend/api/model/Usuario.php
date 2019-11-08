<?php 

require_once(API."/model/Mailer.php");

class Usuario{

    const loadUsuariosQuery = "usuarios.ID, usuarios.registrante, usuarios.usuario, usuarios.email, usuarios.telefono, usuarios.tipo, usuarios.activo, usuarios.validada, perfiles.nombres, perfiles.apellidos, perfiles.sexo, perfiles.nacimiento, usuarios.registro, roles.rol, centros_usuarios.centro, (SELECT nombre FROM centros WHERE centros_usuarios.centro = centros.ID) as centro_nombre FROM";

    public static function insert($connection, $IDPrefix, $tipo, $params, &$response){
        $registrante = $params->ID ? $params->ID : '';
        $insert = $params->insert;
        $usuario = $params->usuario;
        $contrasena = $params->contrasena;

        $user = $usuario->usuario;
        $centro = $usuario->centro?$usuario->centro:null;

        //  ALUMNO
        if ($tipo === 3 && $insert) {
            $sql = "SELECT usuario FROM usuarios WHERE usuario = :user LIMIT 1";
            $stmt = $connection->prepare($sql);
            $stmt->bindParam(":user",$user);
            $stmt->execute();
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            $stmt = NULL;
            if ($row) {
                $user = '';
                $response["data"]=$user;
                $response["error"] = Errors::$list["duplicatedUser"];
                return;
            }
        }

        if(!$user){
            $sql = "SELECT MAX(CAST(SUBSTR(usuario,6,2) AS SIGNED)) + 1 AS n FROM usuarios WHERE tipo = :tipo";
            $stmt = $connection->prepare($sql);
            $stmt->bindParam(":tipo",$tipo);
            $stmt->execute();
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            $stmt = NULL;
            if($row && $row["n"]){
                $user = $IDPrefix.$row["n"];
            }else{
                $user = $IDPrefix."1";
            }
        }

        $err = false;

        try {
            $connection->beginTransaction();

            //  USUARIOS
            $sql = "INSERT INTO usuarios (ID, usuario, registro, email, telefono, tipo, ";
            if($contrasena)$sql.="contrasena, ";
            $sql.="activo, validada, registrante) VALUES (:ID, :usuario, :registro, :email, :telefono, :tipo, ";
            if($contrasena)$sql.=":contrasena, ";
            $sql.=":activo, 0, :registrante) ON DUPLICATE KEY UPDATE usuario = :usuario, email = :email, telefono = :telefono, ";
            if($contrasena)$sql.="contrasena = :contrasena, ";
            $sql.="activo = :activo";
            $stmt = $connection->prepare($sql);
            $stmt->bindParam(":ID", $usuario->ID);
            $stmt->bindValue(":usuario", str_replace(" ","",$user));
            $stmt->bindValue(":registro",time()*1000);
            $stmt->bindValue(":email", trim($usuario->email));
            $stmt->bindValue(":telefono", trim($usuario->telefono));
            $stmt->bindParam(":tipo",$tipo);
            if($contrasena)$stmt->bindValue(":contrasena", md5($contrasena));
            $stmt->bindValue(":activo", $usuario->activo);
            $stmt->bindParam(":registrante",$registrante);
            $stmt->execute();
            $stmt = NULL;

            //  PERFILES
            $sql = "INSERT INTO perfiles (ID, nombres, apellidos, sexo, nacimiento) VALUES (:ID, :nombres, :apellidos, :sexo, :nacimiento) ON DUPLICATE KEY UPDATE nombres = :nombres, apellidos = :apellidos, sexo = :sexo, nacimiento = :nacimiento";
            $stmt = $connection->prepare($sql);
            $stmt->bindParam(":ID", $usuario->ID);
            $stmt->bindValue(":nombres", trim($usuario->nombres));
            $stmt->bindValue(":apellidos", trim($usuario->apellidos));
            $stmt->bindParam(":sexo",$usuario->sexo);
            $stmt->bindParam(":nacimiento",$usuario->nacimiento);
            $stmt->execute();
            $stmt = NULL;

            //  ROLES
            $sql = "INSERT INTO roles (ID, rol) VALUES (:ID, :rol) ON DUPLICATE KEY UPDATE rol = :rol";
            $stmt = $connection->prepare($sql);
            $stmt->bindParam(":ID", $usuario->ID);
            $stmt->bindParam(":rol",$usuario->rol);
            $stmt->execute();
            $stmt = NULL;

            //  CENTRO
            if($centro) {
                $sql = "INSERT INTO centros_usuarios (ID, centro) VALUES (:ID, :centro) ON DUPLICATE KEY UPDATE centro = :centro";
                $stmt = $connection->prepare($sql);
                $stmt->bindParam(":ID", $usuario->ID);
                $stmt->bindParam(":centro",$centro);
                $stmt->execute();
                $stmt = NULL;
            }

            $connection->commit();

        } catch (PDOException $e) {
            $err = true;
            $connection->rollback();
        }

        if (!$err) {
            if (trim($usuario->email) && $contrasena) {
                $nombres = trim($usuario->nombres);
                $email = trim($usuario->email);
                    
                $variables = array(
                    array("key"=>"|*USER*|","value"=>$user),
                    array("key"=>"|*PASSWORD*|","value"=>$contrasena),
                    array("key"=>"|*FNAME*|","value"=>$nombres),
                    array("key"=>"|*EMAIL*|","value"=>$email)
                );
    
                $result = Mailer::send(API."/SignIn.html", API."/SignIn.txt", $variables, 'Te damos la bienvenida, ' . $nombres, array($email => $nombres));
            }
    
            $response["data"]=$user;
            $response["error"] = null;
        } else {
            $response["data"]= null;
            $response["error"] = Errors::$list["noChanges"];;
        }
    }

    public static function updateSelf($connection, $params, $token, &$response) {
        $usuario = $params->usuario;
        $contrasena = $params->contrasena;
        $updated = 0;

        $nuevaContrasena = trim($params->nuevaContrasena);
        if($nuevaContrasena && $nuevaContrasena !== $contrasena){
            if(Token::updatePass($connection,$token,$nuevaContrasena, $response)){
                $updated++;
            };
        }

        $sql = "UPDATE usuarios, perfiles SET usuarios.usuario = :usuario, usuarios.email = :email, usuarios.telefono = :telefono, perfiles.nombres = :nombres, perfiles.apellidos = :apellidos, perfiles.sexo = :sexo WHERE (usuarios.ID = :ID AND usuarios.contrasena = :contrasena) AND perfiles.ID = :ID";

        $stmt = $connection->prepare($sql);
        $stmt->bindValue(":usuario", str_replace(" ","",$usuario->usuario));
        $stmt->bindValue(":email", trim($usuario->email));
        $stmt->bindValue(":nombres", trim($usuario->nombres));
        $stmt->bindValue(":apellidos", trim($usuario->apellidos));
        $stmt->bindValue(":telefono", trim($usuario->telefono));
        $stmt->bindParam(":sexo", $usuario->sexo);
        $stmt->bindParam(":ID", $usuario->ID);
        $stmt->bindValue(":contrasena", md5(($nuevaContrasena?$nuevaContrasena:$contrasena)));
        $stmt->execute();
        $updated += $stmt->rowCount();
        $stmt = NULL;

        if($updated)return (object)array("ID"=>$usuario->ID, "pass"=>($nuevaContrasena?$nuevaContrasena:$contrasena));
        else return null;
    }

    public static function loadUsuarios($connection, $params, &$response){
        $response["error"] = Errors::$list["process"];

        $tipo = $params->tipo;
        $usuarios = array();

        $sql = "SELECT ".self::loadUsuariosQuery." usuarios LEFT JOIN perfiles ON usuarios.ID = perfiles.ID LEFT JOIN roles ON usuarios.ID = roles.ID LEFT JOIN centros_usuarios ON usuarios.ID = centros_usuarios.ID";
        if($tipo)$sql.=" WHERE usuarios.tipo = :tipo";
        $stmt = $connection->prepare($sql);
        if($tipo)$stmt->bindParam(":tipo",$tipo);
        $stmt->execute();
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $stmt = NULL;

        if(!$rows){
            $response["error"] = Errors::$list["noData"];
        }else{
            foreach($rows as $row){
                $usuario = $row;
                $usuario["activo"] = $row["activo"]?true:false;
                $usuario["validada"] = $row["validada"]?true:false;
                $usuario["master"] = $row["rol"] == 1?true:false;
                $usuario["sexo"] = intval($row["sexo"]);
                $usuario["tipo"] = intval($row["tipo"]);
                $usuario["nacimiento"] = $row["nacimiento"]?intval($row["nacimiento"]):null;
                $usuario["registro"] = $row["registro"]?intval($row["registro"]):null;
                $usuario["centro"] =  $row["centro"]?array("ID"=>$row["centro"],"nombre"=>$row["centro_nombre"]):null;
                array_push($usuarios,$usuario);
            }

            $response["error"] = null;
        }
        return $usuarios;
    }

    public static function loadAthletesWithEvaluatorID($connection, $params, &$response){
        $response["error"] = Errors::$list["process"];

        $tipo = $params->tipo;
        $evaluador = $params->ID;
        $source = ($params->source ? $params->source . '_alumnos' : 'pruebas_alumnos');

        $usuarios = array();
        $list = (($source === "pruebas_alumnos") ? implode(",':',",Referencia::$PRUEBAS) : implode(",':',",Referencia::$MEDICIONES));
        $sql = "SELECT DISTINCT (SELECT MAX(fecha) FROM {$source} WHERE alumno = usuarios.ID) as max_fecha, (SELECT GROUP_CONCAT($list SEPARATOR ',') FROM {$source} WHERE alumno = usuarios.ID AND fecha = max_fecha) as evaluacion, actividades_alumnos.actividades, actividades_alumnos.eventos, ".self::loadUsuariosQuery." usuarios LEFT JOIN perfiles ON usuarios.ID = perfiles.ID LEFT JOIN roles ON usuarios.ID = roles.ID LEFT JOIN centros_usuarios ON usuarios.ID = centros_usuarios.ID LEFT JOIN actividades_alumnos ON actividades_alumnos.ID = usuarios.ID WHERE (usuarios.registrante = :evaluador OR EXISTS (SELECT alumno FROM {$source} WHERE usuarios.ID = {$source}.alumno AND {$source}.evaluador = :evaluador)) AND usuarios.tipo = :tipo ORDER BY perfiles.nombres, max_fecha DESC";
        $stmt = $connection->prepare($sql);
        $stmt->bindParam(":tipo",$tipo);
        $stmt->bindParam(":evaluador",$evaluador);
        $stmt->execute();
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $stmt = NULL;

        if(!$rows){
            $response["error"] = Errors::$list["noData"];
        }else{
            foreach($rows as $row){
                $usuario = $row;
                $usuario["activo"] = $row["activo"]?true:false;
                $usuario["validada"] = $row["validada"]?true:false;
                $usuario["master"] = $row["rol"] == 1?true:false;
                $usuario["sexo"] = intval($row["sexo"]);
                $usuario["tipo"] = intval($row["tipo"]);
                $usuario["nacimiento"] = $row["nacimiento"]?intval($row["nacimiento"]):null;
                $usuario["registro"] = $row["registro"]?intval($row["registro"]):null;
                $usuario["centro"] =  $row["centro"]?array("ID"=>$row["centro"],"nombre"=>$row["centro_nombre"]):null;
                $usuario["actividades"] = $row["actividades"] ? explode(",",$row["actividades"]) :array();
                $usuario["eventos"] = $row["eventos"] ? explode(",",$row["eventos"]) :array();
                if ($row["evaluacion"]) {
                    $evaluaciones = explode(":", $row["evaluacion"]);
                    $usuario["evaluacion"] = array(
                        "fecha"=> intval($row["max_fecha"]),
                        "evaluaciones"=> array()
                    );
                    for ($i = 0; $i < count($evaluaciones); $i++) {
                        $evaluacion = $evaluaciones[$i];
                        array_push($usuario["evaluacion"]["evaluaciones"], array(
                            "ID"=>strval($i),
                            "valor"=>doubleval($evaluacion)
                        ));
                    }
                }
                array_push($usuarios,$usuario);
            }

            $response["error"] = null;
        }
        return $usuarios;
    }

    public static function loadAthletesWithEvaluatorCenterAndSearch($connection, $params, &$response){
        $response["error"] = Errors::$list["process"];

        $tipo = $params->tipo;
        $centro = $params->centro;
        $search = $params->search;
        $source = ($params->source ? $params->source . '_alumnos' : 'pruebas_alumnos');

        $usuarios = array();
        $list = (($source === "pruebas_alumnos") ? implode(",':',",Referencia::$PRUEBAS) : implode(",':',",Referencia::$MEDICIONES));
        $sql = "SELECT DISTINCT (SELECT MAX(fecha) FROM {$source} WHERE alumno = usuarios.ID) as max_fecha, (SELECT GROUP_CONCAT($list SEPARATOR ',') FROM {$source} WHERE alumno = usuarios.ID AND fecha = max_fecha) as evaluacion, actividades_alumnos.actividades, actividades_alumnos.eventos, ".self::loadUsuariosQuery." usuarios LEFT JOIN perfiles ON usuarios.ID = perfiles.ID LEFT JOIN roles ON usuarios.ID = roles.ID LEFT JOIN centros_usuarios ON usuarios.ID = centros_usuarios.ID LEFT JOIN actividades_alumnos ON actividades_alumnos.ID = usuarios.ID WHERE usuarios.tipo = :tipo AND centros_usuarios.centro = :centro AND (LOWER(CONCAT(usuarios.email, usuarios.usuario, usuarios.telefono, perfiles.nombres, perfiles.apellidos)) LIKE :search) ORDER BY perfiles.nombres, max_fecha DESC";
        $stmt = $connection->prepare($sql);
        $stmt->bindParam(":tipo",$tipo);
        $stmt->bindValue(":search", "%".$search."%");
        $stmt->bindParam(":centro",$centro);
        $stmt->execute();
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $stmt = NULL;

        if(!$rows){
            $response["error"] = Errors::$list["noData"];
        }else{
            foreach($rows as $row){
                $usuario = $row;
                $usuario["activo"] = $row["activo"]?true:false;
                $usuario["validada"] = $row["validada"]?true:false;
                $usuario["master"] = $row["rol"] == 1?true:false;
                $usuario["sexo"] = intval($row["sexo"]);
                $usuario["tipo"] = intval($row["tipo"]);
                $usuario["nacimiento"] = $row["nacimiento"]?intval($row["nacimiento"]):null;
                $usuario["registro"] = $row["registro"]?intval($row["registro"]):null;
                $usuario["centro"] =  $row["centro"]?array("ID"=>$row["centro"],"nombre"=>$row["centro_nombre"]):null;
                $usuario["actividades"] = $row["actividades"] ? explode(",",$row["actividades"]) :array();
                $usuario["eventos"] = $row["eventos"] ? explode(",",$row["eventos"]) :array();
                if ($row["evaluacion"]) {
                    $evaluaciones = explode(":", $row["evaluacion"]);
                    $usuario["evaluacion"] = array(
                        "fecha"=> intval($row["max_fecha"]),
                        "evaluaciones"=> array()
                    );
                    for ($i = 0; $i < count($evaluaciones); $i++) {
                        $evaluacion = $evaluaciones[$i];
                        array_push($usuario["evaluacion"]["evaluaciones"], array(
                            "ID"=>strval($i),
                            "valor"=>doubleval($evaluacion)
                        ));
                    }
                }
                array_push($usuarios,$usuario);
            }

            $response["error"] = null;
        }
        return $usuarios;
    }

    public static function findAthleteWithUserName($connection, $params, &$response){
        $response["error"] = Errors::$list["process"];

        $userName = $params->userName;
        $evaluador = $params->evaluador;
        $source = ($params->source ? $params->source . '_alumnos' : 'pruebas_alumnos');
        $usuario = null;
        $list = $source === "pruebas_alumnos" ? implode(",':',",Referencia::$PRUEBAS) : implode(",':',",Referencia::$MEDICIONES);
        $sql = "SELECT (SELECT MAX(fecha) FROM {$source} WHERE alumno = usuarios.ID) as max_fecha, (SELECT GROUP_CONCAT({$list} SEPARATOR ',') FROM {$source} WHERE alumno = usuarios.ID AND fecha = max_fecha) as evaluacion, actividades_alumnos.actividades, actividades_alumnos.eventos, ".self::loadUsuariosQuery." usuarios LEFT JOIN perfiles ON usuarios.ID = perfiles.ID LEFT JOIN roles ON usuarios.ID = roles.ID LEFT JOIN centros_usuarios ON usuarios.ID = centros_usuarios.ID LEFT JOIN actividades_alumnos ON actividades_alumnos.ID = usuarios.ID WHERE LOWER(usuarios.usuario) = :usuario AND usuarios.registrante <> :evaluador LIMIT 1";
        $stmt = $connection->prepare($sql);
        $stmt->bindParam(":usuario",$userName);
        $stmt->bindParam(":evaluador",$evaluador);
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        $stmt = NULL;

        if(!$row){
            $response["error"] = Errors::$list["noData"];
        }else{
            $usuario = $row;
            $usuario["activo"] = $row["activo"]?true:false;
            $usuario["validada"] = $row["validada"]?true:false;
            $usuario["master"] = $row["rol"] == 1?true:false;
            $usuario["sexo"] = intval($row["sexo"]);
            $usuario["tipo"] = intval($row["tipo"]);
            $usuario["nacimiento"] = $row["nacimiento"]?intval($row["nacimiento"]):null;
            $usuario["registro"] = $row["registro"]?intval($row["registro"]):null;
            $usuario["centro"] =  $row["centro"]?array("ID"=>$row["centro"],"nombre"=>$row["centro_nombre"]):null;
            $usuario["actividades"] = $row["actividades"] ? explode(",",$row["actividades"]) :array();
            $usuario["eventos"] = $row["eventos"] ? explode(",",$row["eventos"]) :array();
            if ($row["evaluacion"]) {
                $evaluaciones = explode(":", $row["evaluacion"]);
                $usuario["evaluacion"] = array(
                    "fecha"=> intval($row["max_fecha"]),
                    "evaluaciones"=> array()
                );
                for ($i = 0; $i < count($evaluaciones); $i++) {
                    $evaluacion = $evaluaciones[$i];
                    array_push($usuario["evaluacion"]["evaluaciones"], array(
                        "ID"=>strval($i),
                        "valor"=>doubleval($evaluacion)
                    ));
                }
            }
            $response["error"] = null;
        }
        return $usuario;
    }

    public static function deleteUsuario($connection, $params, &$response){

        $response["error"] = Errors::$list["noChanges"];

        $ID = $params->ID;

        try {

            $connection->beginTransaction();

            $sql = "DELETE FROM usuarios WHERE ID = :ID";
            $stmt = $connection->prepare($sql);
            $stmt->bindParam(":ID",$ID);
            $stmt->execute();
            $stmt = NULL;

            $sql = "DELETE FROM perfiles WHERE ID = :ID";
            $stmt = $connection->prepare($sql);
            $stmt->bindParam(":ID",$ID);
            $stmt->execute();
            $stmt = NULL;

            $sql = "DELETE FROM roles WHERE ID = :ID";
            $stmt = $connection->prepare($sql);
            $stmt->bindParam(":ID",$ID);
            $stmt->execute();
            $stmt = NULL;

            $sql = "DELETE FROM centros_usuarios WHERE ID = :ID";
            $stmt = $connection->prepare($sql);
            $stmt->bindParam(":ID",$ID);
            $stmt->execute();
            $stmt = NULL;

            $sql = "DELETE FROM pruebas_alumnos WHERE alumno = :ID";
            $stmt = $connection->prepare($sql);
            $stmt->bindParam(":ID",$ID);
            $stmt->execute();
            $stmt = NULL;

            $sql = "DELETE FROM mediciones_alumnos WHERE alumno = :ID";
            $stmt = $connection->prepare($sql);
            $stmt->bindParam(":ID",$ID);
            $stmt->execute();
            $stmt = NULL;

            $sql = "DELETE FROM recomendaciones WHERE recibe = :ID";
            $stmt = $connection->prepare($sql);
            $stmt->bindParam(":ID",$ID);
            $stmt->execute();
            $stmt = NULL;
            
            $sql = "DELETE FROM actividades_alumnos WHERE ID = :ID";
            $stmt = $connection->prepare($sql);
            $stmt->bindParam(":ID",$ID);
            $stmt->execute();
            $stmt = NULL;

            $connection->commit();

            $response["error"] = null;
            
            return true;

        } catch (Exception $e) {

            $response["error"] = Errors::$list["process"];

            return false;

        }
    }

    public static function updateAthleteEvents($connection, $params, &$response) {
        $item = $params->item;
        $sql = "INSERT INTO actividades_alumnos (ID, actividades, eventos) VALUES (:ID, :actividades, :eventos) ON DUPLICATE KEY UPDATE actividades = :actividades, eventos = :eventos";
        $stmt = $connection->prepare($sql);
        $stmt->bindParam(":ID", $item->ID);
        $stmt->bindValue(":actividades", join(",", $item->actividades));
        $stmt->bindValue(":eventos", join(",", $item->eventos));
        $stmt->execute();
        $updated = $stmt->rowCount();
        $stmt = NULL;

        if($updated){
            $response["error"] = null;
            return true;
        }
        else return null;
    }

    public static function loadAthleteEvents($connection, $params, &$response) {
        try {
            $item = $params->item;
            $sql = "SELECT actividades, eventos FROM actividades_alumnos WHERE ID = :ID";
            $stmt = $connection->prepare($sql);
            $stmt->bindParam(":ID", $item->ID);
            $stmt->execute();
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            $stmt = NULL;

            if($row){
                $response["error"] = null;
                $data = $row;
                $data["actividades"] = $row["actividades"] ? explode(",",$row["actividades"]) :array();
                $data["eventos"] = $row["eventos"] ? explode(",",$row["eventos"]) :array();
                return $data;
            }
            else return null;
        } catch (Exception $e) {
            return null;
        }
    }

    public static function insertAthleteTests($connection, $params, &$response) {
        $data = $params->data;

        $source = $data->source;

        $sql = "";
        if($source === "pruebas") {
            $sql = "INSERT INTO pruebas_alumnos (ID, alumno, edad_actual, evaluador, evaluador_nombre, centro, fecha, equilibrio, coordinacion, flexibilidad, brazos, piernas, abdomen, resistencia) VALUES (:ID, :alumno, :edad, :evaluador, :evaluador_nombre, :centro, :fecha, :equilibrio, :coordinacion, :flexibilidad, :brazos, :piernas, :abdomen, :resistencia) ON DUPLICATE KEY UPDATE evaluador = :evaluador, evaluador_nombre = :evaluador_nombre, equilibrio = :equilibrio, coordinacion = :coordinacion, flexibilidad = :flexibilidad, brazos = :brazos, piernas = :piernas, abdomen = :abdomen, resistencia = :resistencia";
        } else {
            $sql = "INSERT INTO mediciones_alumnos (ID, alumno, edad_actual, evaluador, evaluador_nombre, centro, fecha, peso, estatura, cintura, cadera, pantorrilla, brazoRelajado, brazoFlexionado, tricipital, subescapular, supraespinal, abdominal, musloFrontal, pantorrillaMedial, sistole, diastole, pulso, biestiloideo, biepicondileo) VALUES (:ID, :alumno, :edad, :evaluador, :evaluador_nombre, :centro, :fecha, :peso, :estatura, :cintura, :cadera, :pantorrilla, :brazoRelajado, :brazoFlexionado, :tricipital, :subescapular, :supraespinal, :abdominal, :musloFrontal, :pantorrillaMedial, :sistole, :diastole, :pulso, :biestiloideo, :biepicondileo) ON DUPLICATE KEY UPDATE evaluador = :evaluador, evaluador_nombre = :evaluador_nombre, peso = :peso, estatura = :estatura, cintura = :cintura, cadera = :cadera, pantorrilla = :pantorrilla, brazoRelajado = :brazoRelajado, brazoFlexionado = :brazoFlexionado, tricipital = :tricipital, subescapular = :subescapular, supraespinal = :supraespinal, abdominal = :abdominal, musloFrontal = :musloFrontal, pantorrillaMedial = :pantorrillaMedial, sistole = :sistole, diastole = :diastole, pulso = :pulso, biestiloideo = :biestiloideo, biepicondileo = :biepicondileo";
        }

        try {
            $ID = md5($data->evaluador . $data->alumno . $data->fecha);
            $stmt = NULL;
            $stmt = $connection->prepare($sql);
            $stmt->bindParam(":ID", $ID);
            $stmt->bindParam(":alumno", $data->alumno);
            $stmt->bindParam(":evaluador", $data->evaluador);
            $stmt->bindParam(":evaluador_nombre", $data->evaluadorNombre);
            $stmt->bindParam(":centro", $data->centro);
            $stmt->bindParam(":fecha", $data->fecha);
            $stmt->bindParam(":edad", $data->edad);
            
            foreach($data->evaluaciones as $i) {
                $prop = ($source === "pruebas" ? Referencia::$PRUEBAS[$i->ID] : Referencia::$MEDICIONES[$i->ID]);
                $stmt->bindValue(":".$prop, $i->valor);
            }

            $stmt->execute();
            $stmt = NULL;

            $response["error"] = null;
            return true;

        } catch (PDOException $e) {
            $response["error"] = Errors::$list["process"];
            return null;
        }
    }

    public static function loadAthleteTests($connection, $params, &$response) {
        try {
            $alumno = $params->alumno;
            $ranking = $params->ranking;
            $evaluaciones = array();

            $connection->beginTransaction();
            
            if ($ranking) {
                $sql = "SELECT pruebas_alumnos.*, evaluaciones_rankings.ranking FROM pruebas_alumnos LEFT JOIN evaluaciones_rankings ON pruebas_alumnos.ID = evaluaciones_rankings.ID WHERE pruebas_alumnos.alumno = :alumno AND FROM_UNIXTIME(pruebas_alumnos.fecha / 1000) >= CURRENT_DATE - INTERVAL 1 YEAR ORDER BY pruebas_alumnos.fecha DESC";
            } else {
                $sql = "SELECT * FROM pruebas_alumnos WHERE alumno = :alumno AND FROM_UNIXTIME(fecha / 1000) >= CURRENT_DATE - INTERVAL 1 YEAR ORDER BY fecha DESC";
            }
            
            $stmt = $connection->prepare($sql);
            $stmt->bindParam(":alumno",$alumno);
            $stmt->execute();
            $pruebas = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $stmt = NULL;

            if($pruebas){
                foreach($pruebas as $i) {
                   $prueba = array();
                   $prueba["ID"] = $i["ID"];
                   $prueba["rol"] = "pruebas";
                   $prueba["alumno"] = $i["alumno"];
                   $prueba["evaluador"] = $i["evaluador"];
                   $prueba["evaluadorNombre"] = $i["evaluador_nombre"];
                   $prueba["fecha"] = $i["fecha"];
                   $prueba["centro"] = $i["centro"];
                   $prueba["evaluaciones"] = array();
                   $prueba["ranking"] = $i["ranking"] !== null ? intval($i["ranking"]) : null;
                   $keys = array_keys($i);
                   foreach($keys as $k) {
                        $index = array_search($k, Referencia::$PRUEBAS);
                        if ($index !== FALSE) {
                            array_push($prueba["evaluaciones"], array("ID"=>strval($index), "valor" => doubleval($i[$k])));
                        }
                   }
                   array_push($evaluaciones, $prueba);
                }
            }

            if ($ranking) {
                $sql = "SELECT mediciones_alumnos.*, evaluaciones_rankings.ranking FROM mediciones_alumnos LEFT JOIN evaluaciones_rankings ON mediciones_alumnos.ID = evaluaciones_rankings.ID WHERE mediciones_alumnos.alumno = :alumno AND FROM_UNIXTIME(mediciones_alumnos.fecha / 1000) >= CURRENT_DATE - INTERVAL 1 YEAR ORDER BY mediciones_alumnos.fecha DESC";
            } else {
                $sql = "SELECT * FROM mediciones_alumnos WHERE alumno = :alumno AND FROM_UNIXTIME(fecha / 1000) >= CURRENT_DATE - INTERVAL 1 YEAR ORDER BY fecha DESC";
            }

            $stmt = $connection->prepare($sql);
            $stmt->bindParam(":alumno",$alumno);
            $stmt->execute();
            $mediciones = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $stmt = NULL;

            if($mediciones){
                foreach($mediciones as $i) {
                   $prueba = array();
                   $prueba["ID"] = $i["ID"];
                   $prueba["rol"] = "mediciones";
                   $prueba["alumno"] = $i["alumno"];
                   $prueba["evaluador"] = $i["evaluador"];
                   $prueba["evaluadorNombre"] = $i["evaluador_nombre"];
                   $prueba["fecha"] = $i["fecha"];
                   $prueba["centro"] = $i["centro"];
                   $prueba["evaluaciones"] = array();
                   $prueba["ranking"] = $i["ranking"] !== null ? intval($i["ranking"]) : null;
                   $keys = array_keys($i);
                   foreach($keys as $k) {
                        $index = array_search($k, Referencia::$MEDICIONES);
                        if ($index !== FALSE) {
                            array_push($prueba["evaluaciones"], array("ID"=>strval($index), "valor" => doubleval($i[$k])));
                        }
                   }
                   array_push($evaluaciones, $prueba);
                }
            }

            $connection->commit();

            if (count($evaluaciones) <= 0) {
                $response["error"] = Errors::$list["noData"];
                return null;
            } else {
                $response["error"] = null;
                return $evaluaciones;
            }

        } catch (PDOException $e) {
            $connection->rollback();
            $response["data"]=null;
            $response["error"] = Errors::$list["process"];
        }
    }

    public static function deleteAthleteTests($connection, $params, &$response) {

        try {
            $ID = $params->ID;
            $source = $params->source;

            $sql = "DELETE FROM {$source}_alumnos WHERE ID = :ID";
            $stmt = $connection->prepare($sql);
            $stmt->bindParam(":ID",$ID);
            $stmt->execute();
            $stmt = NULL;

            $response["error"] = null;
            return true;

        } catch (PDOException $e) {
            $response["error"] = Errors::$list["process"];
            return null;
        }
    }

    public static function loadAthleteRecommendations($connection, $params, &$response) {
        $alumno = $params->alumno;
        $sql = "SELECT recomendaciones.ID, recomendaciones.envia, recomendaciones.recibe, recomendaciones.fecha, recomendaciones.texto, perfiles.nombres, perfiles.apellidos, IFNULL(roles.rol, 0) as rol FROM recomendaciones LEFT JOIN perfiles ON perfiles.ID = recomendaciones.envia LEFT JOIN roles ON roles.ID = recomendaciones.envia WHERE recibe = :alumno AND FROM_UNIXTIME(fecha / 1000) >= CURRENT_DATE - INTERVAL 90 DAY ORDER BY recomendaciones.fecha DESC";
        $stmt = $connection->prepare($sql);
        $stmt->bindParam(":alumno", $alumno);
        $stmt->execute();
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $stmt = NULL;

        if($rows){
            $response["error"] = null;
            $data = array();
            foreach($rows as $row){
                $i = $row;
                $i["fecha"] = intval($row["fecha"]);
                $i["nombres"] = $row["nombres"] ? $row["nombres"] . " " . $row["apellidos"] : "";
                $i["rol"] = intval($row["rol"]);
                array_push($data, $i);
            }
            return $data;
        }
        $response["error"] = Errors::$list["noData"];
        return null;
    }

    public static function insertAthleteRecommendation($connection, $params, &$response) {
        $response["error"] = Errors::$list["process"];
        
        $item = $params->item;
        $alumno = $params->alumno;

        $sql = "INSERT INTO recomendaciones (envia, recibe, fecha, texto) VALUES (:envia, :alumno, :fecha, :texto)";
        $stmt = $connection->prepare($sql);
        $stmt->bindParam(":envia", $item->envia);
        $stmt->bindParam(":alumno", $alumno);
        $stmt->bindParam(":fecha", $item->fecha);
        $stmt->bindParam(":texto", $item->texto);
        $stmt->execute();
        $id = $connection->lastInsertId();
        $stmt = NULL;

        if($id){
            $response["error"] = null;
            return $id;
        }
        $response["error"] = Errors::$list["noChanges"];
        return null;
    }

    public static function deleteAthleteRecommendation($connection, $params, &$response) {
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

    public static function insertAthleteTestRanking($connection, $params, &$response) {
        $sql = "INSERT INTO evaluaciones_rankings (ID, centro, evaluador, ranking, fecha) VALUES (:ID, :centro, :evaluador, :ranking, :fecha) ON DUPLICATE KEY UPDATE ranking = :ranking, fecha = :fecha";

        try {
            $stmt = $connection->prepare($sql);
            $stmt->bindParam(":ID", $params->ID);
            $stmt->bindParam(":ranking", $params->ranking);
            $stmt->bindParam(":fecha", $params->fecha);
            $stmt->bindParam(":centro", $params->centro);
            $stmt->bindParam(":evaluador", $params->evaluador);
            $stmt->execute();
            $stmt = NULL;

            $response["error"] = null;
            return true;

        } catch (PDOException $e) {
            $response["error"] = Errors::$list["process"];
            return null;
        }
    }
}

?>