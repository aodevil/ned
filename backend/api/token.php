<?php 
    
    require_once(API."/model/Mailer.php");

    class Token {
        public static function validate($connection, $token, &$response){

            $response["error"] = Errors::$list["auth"];
            $response["data"] = NULL;

            if(!$token){return false;}

            $sql = "SELECT ID, activo from usuarios WHERE MD5(CONCAT(ID,usuario,contrasena)) = :token LIMIT 1";
            $stmt = $connection->prepare($sql);
            $stmt->bindParam(":token", $token);
            $stmt->execute();
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            $stmt = NULL;

            if($row){
                if(!$row["activo"]){
                    $response["error"] = Errors::$list["inactive"];
                }else{
                    $response["error"] = NULL;
                    $response["data"] = $row;
                    return true;
                }
            }

            return false;
        }

        public static function updatePass($connection, $token, $pass, &$response){
            $response["error"] = Errors::$list["process"];

            if(!$token || !trim($pass)){return false;}

            $sql = "UPDATE usuarios SET contrasena = :contrasena WHERE MD5(CONCAT(ID,usuario,contrasena)) = :token LIMIT 1";
            $stmt = $connection->prepare($sql);
            $stmt->bindValue(":contrasena", md5(trim($pass)));
            $stmt->bindParam(":token", $token);
            $stmt->execute();
            $count = $stmt->rowCount();
            $stmt = NULL;

            if($count <= 0){
                $response["error"] = Errors::$list["noChanges"];
            }else{
                $response["error"] = null;
            }

            return $count > 0?true:false;
        }

        public static function login($connection, $params){
            $user = $params->user;
            $pass = $params->pass;
            
            $error = Errors::$list["login"];

            $usuario = null;

            $sql = "SELECT usuarios.ID, usuarios.usuario, usuarios.email, usuarios.telefono, usuarios.tipo, usuarios.activo, usuarios.validada, usuarios.registrante, MD5(CONCAT(usuarios.ID,usuarios.usuario,usuarios.contrasena)) as token, perfiles.nombres, perfiles.apellidos, perfiles.sexo, perfiles.nacimiento, usuarios.registro, roles.rol, centros_usuarios.centro, (SELECT nombre FROM centros WHERE centros_usuarios.centro = centros.ID) as centro_nombre, actividades_alumnos.actividades, actividades_alumnos.eventos FROM usuarios LEFT JOIN perfiles ON usuarios.ID = perfiles.ID LEFT JOIN roles ON usuarios.ID = roles.ID LEFT JOIN centros_usuarios ON usuarios.ID = centros_usuarios.ID LEFT JOIN actividades_alumnos ON actividades_alumnos.ID = usuarios.ID WHERE usuarios.usuario = :user AND usuarios.contrasena = :pass LIMIT 1";
            $stmt = $connection->prepare($sql);
            $stmt->bindValue(":user", trim($user));
            $stmt->bindValue(":pass", md5(trim($pass)));
            $stmt->execute();
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            $stmt = NULL;

            if($row){
                $error = null;
                $usuario = $row;
                $usuario["activo"] = $row["activo"]?true:false;
                $usuario["validada"] = $row["validada"]?true:false;
                $usuario["master"] = ($row["rol"] == 1)?true:false;
                $usuario["centro"] = $row["centro"]?array("ID"=>$row["centro"],"nombre"=>$row["centro_nombre"]):null;
                $usuario["sexo"] = intval($row["sexo"]);
                $usuario["tipo"] = intval($row["tipo"]);
                $usuario["nacimiento"] = $row["nacimiento"]?intval($row["nacimiento"]):null;
                $usuario["registro"] = $row["registro"]?intval($row["registro"]):null;
                $usuario["actividades"] = $row["actividades"] ? explode(",",$row["actividades"]) :array();
                $usuario["eventos"] = $row["eventos"] ? explode(",",$row["eventos"]) :array();

                if(!$usuario["validada"]){
                    $sql = "UPDATE usuarios SET validada = 1 WHERE ID = :ID";
                    $stmt = $connection->prepare($sql);
                    $stmt->bindParam(":ID",$usuario["ID"]);
                    $stmt->execute();
                    $stmt = NULL;
                }
            }

            return array(
                "error"=>$error,
                "data"=>$usuario
            );
        }

        public static function loginWithID($connection, $params){
            $ID = $params->ID;
            $pass = $params->pass;
            
            $error = Errors::$list["login"];

            $usuario = null;

            $sql = "SELECT usuarios.ID, usuarios.usuario, usuarios.email, usuarios.telefono, usuarios.tipo, usuarios.activo, usuarios.validada, usuarios.registrante, MD5(CONCAT(usuarios.ID,usuarios.usuario,usuarios.contrasena)) as token, perfiles.nombres, perfiles.apellidos, perfiles.sexo, perfiles.nacimiento, usuarios.registro, roles.rol, centros_usuarios.centro, (SELECT nombre FROM centros WHERE centros_usuarios.centro = centros.ID) as centro_nombre, actividades_alumnos.actividades, actividades_alumnos.eventos FROM usuarios LEFT JOIN perfiles ON usuarios.ID = perfiles.ID LEFT JOIN roles ON usuarios.ID = roles.ID LEFT JOIN centros_usuarios ON usuarios.ID = centros_usuarios.ID LEFT JOIN actividades_alumnos ON actividades_alumnos.ID = usuarios.ID WHERE usuarios.ID = :ID AND usuarios.contrasena = :pass LIMIT 1";
            $stmt = $connection->prepare($sql);
            $stmt->bindValue(":ID", trim($ID));
            $stmt->bindValue(":pass", md5(trim($pass)));
            $stmt->execute();
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            $stmt = NULL;

            if($row){
                $error = null;
                $usuario = $row;
                $usuario["activo"] = $row["activo"]?true:false;
                $usuario["validada"] = $row["validada"]?true:false;
                $usuario["master"] = ($row["rol"] == 1)?true:false;
                $usuario["centro"] = $row["centro"]?array("ID"=>$row["centro"],"nombre"=>$row["centro_nombre"]):null;
                $usuario["sexo"] = intval($row["sexo"]);
                $usuario["tipo"] = intval($row["tipo"]);
                $usuario["nacimiento"] = $row["nacimiento"]?intval($row["nacimiento"]):null;
                $usuario["registro"] = $row["registro"]?intval($row["registro"]):null;
                $usuario["actividades"] = $row["actividades"] ? explode(",",$row["actividades"]) :array();
                $usuario["eventos"] = $row["eventos"] ? explode(",",$row["eventos"]) :array();
            }

            return array(
                "error"=>$error,
                "data"=>$usuario
            );
        }

        public static function loginWithToken($connection, $token){
            $error = Errors::$list["login"];

            $usuario = null;

            $sql = "SELECT usuarios.ID, usuarios.usuario, usuarios.email, usuarios.telefono, usuarios.tipo, usuarios.activo, usuarios.validada, usuarios.registrante, MD5(CONCAT(usuarios.ID,usuarios.usuario,usuarios.contrasena)) as token, perfiles.nombres, perfiles.apellidos, perfiles.sexo, perfiles.nacimiento, usuarios.registro, roles.rol, centros_usuarios.centro, (SELECT nombre FROM centros WHERE centros_usuarios.centro = centros.ID) as centro_nombre, actividades_alumnos.actividades, actividades_alumnos.eventos FROM usuarios LEFT JOIN perfiles ON usuarios.ID = perfiles.ID LEFT JOIN roles ON usuarios.ID = roles.ID LEFT JOIN centros_usuarios ON usuarios.ID = centros_usuarios.ID LEFT JOIN actividades_alumnos ON actividades_alumnos.ID = usuarios.ID WHERE MD5(CONCAT(usuarios.ID,usuarios.usuario,usuarios.contrasena)) = :token LIMIT 1";
            $stmt = $connection->prepare($sql);
            $stmt->bindParam(":token", $token);
            $stmt->execute();
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            $stmt = NULL;

            if($row){
                $error = null;
                $usuario = $row;
                $usuario["activo"] = $row["activo"]?true:false;
                $usuario["validada"] = $row["validada"]?true:false;
                $usuario["master"] = ($row["rol"] == 1)?true:false;
                $usuario["centro"] = $row["centro"]?array("ID"=>$row["centro"],"nombre"=>$row["centro_nombre"]):null;
                $usuario["sexo"] = intval($row["sexo"]);
                $usuario["tipo"] = intval($row["tipo"]);
                $usuario["nacimiento"] = $row["nacimiento"]?intval($row["nacimiento"]):null;
                $usuario["registro"] = $row["registro"]?intval($row["registro"]):null;
                $usuario["actividades"] = $row["actividades"] ? explode(",",$row["actividades"]) :array();
                $usuario["eventos"] = $row["eventos"] ? explode(",",$row["eventos"]) :array();
            }

            return array(
                "error"=>$error,
                "data"=>$usuario
            );
        }

        public static function passwordRecovery($connection, $params){
            $user = $params->user;

            if (!$user) $user = "";
            $error = Errors::$list["userNotFound"];

            $email = null;

            $sql = "SELECT usuarios.usuario, usuarios.email, perfiles.nombres FROM usuarios LEFT JOIN perfiles ON usuarios.ID = perfiles.ID WHERE LOWER(usuario) = :user OR LOWER(email) = :user";
            $stmt = $connection->prepare($sql);
            $stmt->bindValue(":user", trim(strtolower($user)));
            $stmt->execute();
            $count = $stmt->rowCount();
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $stmt = NULL;

            if ($count > 1) {
                $error = Errors::$list["multipleAccounts"];
            } else if ($count === 1 && $rows[0]["email"]) {
                $error = null;
                $nombres = $rows[0]["nombres"];
                $usuario = $rows[0]["usuario"];
                $email = $rows[0]["email"];
                $password = uniqid();
                
                $variables = array(
                    array("key"=>"|*USER*|","value"=>$usuario),
                    array("key"=>"|*PASSWORD*|","value"=>$password)
                );

                $result = Mailer::send(API."/PasswordRecovery.html", API."/PasswordRecovery.txt", $variables, 'Recupera tu contraseña', array($email => $nombres));

                if(!$result)
                {
                    $error = Errors::$list["mailer"];
                    $email = null;
                }
                else
                {
                    $sql = "UPDATE usuarios SET contrasena = :contrasena WHERE usuario = :usuario LIMIT 1";
                    $stmt = $connection->prepare($sql);
                    $stmt->bindValue(":contrasena", md5($password));
                    $stmt->bindParam(":usuario", $usuario);
                    $stmt->execute();
                    $count = $stmt->rowCount();
                    $stmt = NULL;

                    if($count <= 0){
                        $email = null;
                        $error = Errors::$list["noChanges"];
                    }else{
                        $error = null;
                    }
                }
            }

            return array(
                "error"=>$error,
                "data"=>$email
            );
        }
    }
?>