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



$sql="SELECT a.origen_codpais, a.destino_codpais"
.", sum(a.monto_dolares) as monto_dolares"
.", sum(a.origen_monto) as origen_monto"
.", sum(a.destino_monto) as destino_monto"
.", count(a.id) as count_transacc"
."  FROM transacciones a LEFT JOIN user u USING (login)"
//.$where
." WHERE a.activo=1"
." GROUP BY a.origen_codpais"
." ORDER BY a.origen_codpais";

$result = $conn->query($sql);

//echo $sql;


//OTRA OPCION para forma la referencia puede ser en php: sprintf("%05d", 184); //devuelve 00184


$outp = "";

//$outp = '{{"sql:"' .$sql. '"}';

while($rs = $result->fetch_array(MYSQLI_ASSOC)) {

  if ($outp != "") {$outp .= ",";}

  $outp .= '{';

  /*
  $outp .= '"id":"'     		       . $rs["id"]  	         .'"';

  $outp .= ',"referencia":"'        . $rs["referencia"]     .'"'; //la referencia es de 5 caracteres, formado por el id con ceros a la izq

  $outp .= ',"login":"'  		       . $rs["login"] 	       .'"';

  $outp .= ',"nombre":"' 		       . $rs["nombre"]	       .'"';


  $outp .= ',"status":"'           . $rs["status"]         .'"';

  $outp .= ',"status_PO":"'        . $rs["status_PO"]      .'"';

  $outp .= ',"status_PD":"'        . $rs["status_PD"]      .'"';

  $outp .= ',"date_created":"'     . $rs["date_created"]   .'"';


  */

  $outp .= '"origen_codpais":"'   . $rs["origen_codpais"] .'"';

  $outp .= ',"destino_codpais":"'  . $rs["destino_codpais"].'"';

  $outp .= ',"monto_dolares":'    . round($rs["monto_dolares"], 2)  .'';

  $outp .= ',"origen_monto":'     . round($rs["origen_monto"], 0)  .'';

  $outp .= ',"destino_monto":'    . round($rs["destino_monto"],2)  .'';

  $outp .= ',"count_transacc":'   . $rs["count_transacc"]  .'';

  $outp .= ',"sql":"'.$sql.'"';

  $outp .= '}';


  //TODO. traer nombres de monedas en vez de paises

}

$outp ='{"records":['.$outp.']}';

//TODO. manejar el error cuando no se consigue data

$conn->close();



echo($outp);



/*todo, hacer join de tabla users, con paises	 y ciudades*/

/*

  $outp .= ',"ciudad":"' . $rs["cod_ciudad"] . '"';

  $outp .= ',"pais":"'  . $rs["cod_pais"]  . '"';

*/

?>

