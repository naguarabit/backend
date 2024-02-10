<?php

/*

file: transacc/list_filtrada.php



descripcion:

obtiene datos de todas las transacciones, segun unos filtros



Uso:

en el parametro $_GET['filtros'] hay que pasarle una cadena con los valores de los filtros

ejemplo: list_filtrada?

*/

//TOOO. agregar un filtro de periodo de fechas, ejemplo: la ultima semana, el ultimo mes, los ultimos N dias, hoy

header("Access-Control-Allow-Origin: *");

header("Content-Type: application/json; charset=UTF-8");





//se obtiene el parametro 'filtros' para usar en el query

  $filtros="";

  if (isset($_GET['filtros'])){

    $filtros = $_GET['filtros'];

  }else{

    $filtros="";

    //TODO. en este caso devolver un json vacio

  }



  //*echo $filtros;



$outp = "";



if (!isset($filtros) || $filtros == ""){

  //TODO. devolver mensaje de error

  $err = "No se proporcionio parametro para filtrar la data: filtros";

  $outp .='{"resultado":"ERROR"'; //es un error pero no generara mensaje en la vista

  $outp .=',"mensaje":"' .$err. '"';

  $outp .= '}';

}else{



  //operadores y caracteres para hacer los filtros

  $filtros = str_replace(':','=',      $filtros);  //igual

  $filtros = str_replace('!', '!=',    $filtros);  //diferente

  $filtros = str_replace('.AND.', ' AND ', $filtros); //condiciones AND

  $filtros = str_replace('.OR.',  ' OR ',  $filtros); //condiciones OR

  //new replace added dec.10th.2021, to compare values null
  //$filtros = str_replace("\'\'", ' IS NULL ',    $filtros);  //IS NULL

}



//realizar la busqueda



include("../bd/connection.php");



//TODO. armar la condicion del where

$where="";

if ($filtros != ""){

  $where = " WHERE " . $filtros;

}



//TODO. agregar a referencia: codpaisorigen,codipaisdestino

/*
$sql = "SELECT a.*, CONCAT(a.origen_codpais,a.destino_codpais,LPAD(a.id, 4, '0')) AS refcompleta, LPAD(a.id, 4, '0') AS referencia, u.nombre from transacciones a INNER JOIN user u USING (login) ".$where." ORDER BY a.date_created DESC, a.login DESC";
*/
$sql="SELECT o.user_id as operador_user_id, o.login as operador_login, o.nombre as operador_nombre
, coalesce(DATE_FORMAT(o.last_payment, '%d/%m/%Y'), '-') AS last_payment
, a.origen_codpais, a.destino_codpais
, round(sum(a.monto_dolares), 2) as monto_dolares
, round(sum(a.origen_monto), 2) as origen_monto
, round(sum(a.destino_monto), 2) as destino_monto
, count(a.id) as count_transacc"
." FROM operador_transaccion ot"
." INNER JOIN operadores    o ON o.id = ot.operador_id"
." INNER JOIN transacciones a ON a.id = ot.transaccion_id"
." LEFT JOIN user u ON u.login=a.login"
." WHERE a.activo=1 AND o.activo=1 AND ot.activo=1 "
.$where

//DEBUG. prueba de filtro directo
//." AND o.login='dianatorales'"

." GROUP BY ot.operador_id"
." ORDER BY ot.operador_id";



//TODO. puedo enviar el query resultante como parte del json, para debug



//echo $where."\n";

//echo $sql."\n";



$outp = "";

$result = $conn->query($sql);



//$outp .= '{{"sql":"'     . $sql   .'"}';



while($rs = $result->fetch_array(MYSQLI_ASSOC)) {

  if ($outp != "") {$outp .= ",";}

  $outp .= '{';

  $outp .= '"operador_user_id":'   . $rs["operador_user_id"]  .'';

  $outp .= ',"operador_login":"'   . $rs["operador_login"]  .'"';

  $outp .= ',"operador_nombre":"'   . $rs["operador_nombre"]  .'"';

  $outp .= ',"last_payment":"'       . $rs["last_payment"]  .'"';

  $outp .= ',"origen_codpais":"'   . $rs["origen_codpais"] .'"';

  $outp .= ',"destino_codpais":"'  . $rs["destino_codpais"].'"';

  $outp .= ',"origen_monto":"'     . $rs["origen_monto"]   .'"';

  $outp .= ',"destino_monto":"'    . $rs["destino_monto"]  .'"';

  $outp .= ',"monto_dolares":"'    . $rs["monto_dolares"]  .'"';

  $outp .= ',"count_transacc":'   . $rs["count_transacc"]  .'';

  $outp .= '}';

}

$outp ='{"records":['.$outp.']}';

/*TODO. probar el EXPERIMENTO. retornar la cosulta sql como un campo dentro del json
$outp = '{"records":['.$outp.']';
$outp .= ',"sql":"'.$sql.'"}';
*/

//TODO. manejar el error cuando no se consigue data

$conn->close();

echo($outp);

/*

  $outp .= ',"ciudad":"' . $rs["cod_ciudad"] . '"';

  $outp .= ',"pais":"'  . $rs["cod_pais"]  . '"';

*/

?>

