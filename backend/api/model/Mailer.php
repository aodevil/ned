<?php 

class Mailer{
    private static $mailer_username_name = "";
    private static $mailer_server = "";
    private static $mailer_username = "";
    private static $mailer_password = "";
    private static $mailer_port = 000;
    private static $mailer_transport_protocol = "";

    /**
     * @param $variables: array(
                        array("key"=>"|*TAG*|","value"=>"VALUE")
                    )
      * @param $to: array("email" => "name")
     */
    public static function send($html_template, $part_template, $variables, $subject, $to){
        try {
            if(file_exists($html_template) && file_exists($part_template))
            {
                $html =  file_get_contents($html_template);
                $part =  file_get_contents($part_template);

                if ($variables) {
                    foreach($variables as $replace)
                    {
                        $html = str_ireplace($replace["key"],$replace["value"],$html);
                        $part = str_ireplace($replace["key"],$replace["value"],$part);
                    }
                }

                $message = (new Swift_Message())
                ->setSubject($subject)
                ->setFrom(array(self::$mailer_username => self::$mailer_username_name))
                ->setTo($to)
                ->setBody($html,"text/html")
                ->addPart($part,"text/plain");

                $transport = (new Swift_SmtpTransport(self::$mailer_server,self::$mailer_port,self::$mailer_transport_protocol))
                ->setUsername(self::$mailer_username)
                ->setPassword(self::$mailer_password);

                $mailer = new Swift_Mailer($transport);

                $result = $mailer->send($message);

                return !$result ? false : true;
            } else {
                return false;
            }
        } catch (Exception $e) {
            return false;
        }   
    }
}

?>