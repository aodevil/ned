<?php  

    header("Access-Control-Allow-Origin: *");
    header('Content-Type: application/json; charset=utf-8');
    $postdata = file_get_contents('php://input');
    
    define("ROOT", __DIR__);

    define("API", (ROOT. "/api"));

    require_once(API."/errors.php");
    require_once(API."/actions.php");
    require_once(API."/token.php");
    require_once(API."/model/Usuario.php");
    require_once(API."/model/Centro.php");
    require_once(API."/model/Disciplina.php");
    require_once(API."/model/Actividad.php");
    require_once(API."/model/Evento.php");
    require_once(API."/model/Referencia.php");
    require_once(API."/model/Estadistica.php");

    $response = array("error"=>Errors::$list["request"], "data"=>null, "active"=>true);

    require_once(API."/connection.php");

    if (isset($postdata)) {

        if($connection){
            
            $auth = true;

            $body = json_decode($postdata);
            $route = $body->route;
            $params = $body->params;
            if($route){

                if($route !== "login"){
                    $action = $params->action;
                    if(
                        $route !== Actions::$public_routes["password"] &&
                        $route !== Actions::$public_routes["centros"] &&
                        $route !== Actions::$public_routes["actividades"] &&
                        $route !== Actions::$public_routes["eventos"] &&
                        $action !== Actions::$list["select"]
                    ){
                        $token = $body->token;
                        $auth = Token::validate($connection, $token, $response);
                    }
                }
                if($auth){
                    require_once(API."/".$route.".php");
                    $response = getResponse($connection, $params);
                    $response["active"] = true;
                }else{
                    $response["active"] = false;
                }
            }
        }
        $connection = null;
    }

    echo json_encode((object)$response);
?>