<?php 

    class Errors{
        public static $list = array(
            "connection"=>"No es posible conectar con el servidor.",
            "request"=>"No se hizo ninguna petición.",
            "login"=>"Los datos de usuario son incorrectos.",
            "auth"=>"No se ha iniciado sesión o la sesión ha expirado.",
            "inactive"=>"La cuenta está desactivada",
            "process"=>"No se realizó la acción",
            "noChanges"=>"No se realizaron cambios",
            "noData"=>"No hay datos para mostrar",
            "duplicatedUser"=>"El nombre de usuario ya existe",
            "userNotFound" => "No se encontró el usuario",
            "multipleAccounts" => "Hay varias cuentas asociadas al usuario. Intenta con el nombre de usuario exacto o contacta a tu evaluador o coordinador para poder restaurar tu contraseña.",
            "mailer" => "No fue posible enviar el correo al usuario.",
            "mailerError" => "Ocurrió un problema al intentar enviar el correo al usuario.",
            "createFile" => "No es posible generar el archivo."
        );
    }

?>