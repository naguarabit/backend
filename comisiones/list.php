<?php

/*

transacc/list.php

obtiene lista de todas las transacciones registradas

*/

//TOOO. agregar un filtro de periodo de fechas, ejemplo: la ultima semana, el ultimo mes, los ultimos N dias, hoy

header("Access-Control-Allow-Origin: *");

header("Content-Type: application/json; charset=UTF-8");



include("../bd/connection.php");



//TODO. agregar condiciones iniciales, pq cuando ya la lista sea larga tardara en mostrar...

$where = ""; //condiciones...



$sql="SELECT o.user_id as operador_user_id, o.login as operador_login, o.nombre as operador_nombre
, coalesce(DATE_FORMAT(o.last_payment, '%d/%m/%Y'), '-') AS last_payment
, a.origen_codpais, a.destino_codpais
, sum(a.monto_dolares) as monto_dolares
, sum(a.origen_monto) as origen_monto
, sum(a.destino_monto) as destino_monto
, count(a.id) as count_transacc
FROM operador_transaccion ot
INNER JOIN operadores    o ON o.id = ot.operador_id
INNER JOIN transacciones a ON a.id = ot.transaccion_id
LEFT JOIN user u ON u.login=a.login"
//.$where
." WHERE a.activo=1 AND ot.activo=1 AND o.activo=1
GROUP BY ot.operador_id
ORDER BY ot.operador_id";

$result = $conn->query($sql);

//echo $sql;


//OTRA OPCION para forma la referencia puede ser en php: sprintf("%05d", 184); //devuelve 00184


$outp = "";

//$outp = '{{"sql:"' .$sql. '"}';

while($rs = $result->fetch_array(MYSQLI_ASSOC)) {

  if ($outp != "") {$outp .= ",";}

  $outp .= '{';

  $outp .= '"origen_codpais":"'   . $rs["origen_codpais"] .'"';

  $outp .= ',"destino_codpais":"'  . $rs["destino_codpais"] .'"';

  $outp .= ',"monto_dolares":'    . round($rs["monto_dolares"], 2)  .'';

  $outp .= ',"origen_monto":'     . round($rs["origen_monto"], 0)  .'';

  $outp .= ',"destino_monto":'    . round($rs["destino_monto"],2)  .'';

  $outp .= ',"count_transacc":'   . $rs["count_transacc"]  .'';

  $outp .= ',"operador_user_id":'   . $rs["operador_user_id"]  .'';

  $outp .= ',"operador_login":"'   . $rs["operador_login"]  .'"';

  $outp .= ',"operador_nombre":"'   . $rs["operador_nombre"]  .'"';

  $outp .= ',"last_payment":"'       . $rs["last_payment"]  .'"';

  $outp .= '}';

  //TODO. traer nombres de monedas en vez de paises

}

$outp = '{"records":['.$outp.']}';

/*experimento, devolver el sql como otro campo del json
$outp = '{"records":['.$outp.']';
$outp .= ',"sql":"'.$sql.'"}';
*/

//TODO. manejar el error cuando no se consigue data

$conn->close();



echo($outp);



/*todo, hacer join de tabla users, con paises	 y ciudades*/

/*

  $outp .= ',"ciudad":"' . $rs["cod_ciudad"] . '"';

  $outp .= ',"pais":"'  . $rs["cod_pais"]  . '"';

*/

?>

