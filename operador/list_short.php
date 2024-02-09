<?php
/*
operador/list_short.php
example
https://www.naguarabit.com/backend/operador/list_short.php
*/
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include("../bd/connection.php");

$sql ="SELECT * FROM operadores WHERE activo order by nombre";
$result = $conn->query($sql);

$outp = "";
while($rs = $result->fetch_array(MYSQLI_ASSOC)) {
  if ($outp != "") {$outp .= ",";}
    $outp   .= '{"id":"'     . $rs["id"]  . '"';
    $outp .= ',"user_id":"' . $rs["user_id"]  . '"';
    $outp .= ',"login":"'   . $rs["login"]  . '"';
  $outp   .= ',"nombre":"' . $rs["nombre"] . '"';
  $outp   .= '}';
}
$outp ='{"records":['.$outp.']}';
//TODO. manejar el error cuando no se consigue data
$conn->close();

echo($outp);

/*todo, hacer join de tabla paises y ciudades*/
/*
  $outp .= ',"ciudad":"' . $rs["cod_ciudad"] . '"';
  $outp .= ',"pais":"'  . $rs["cod_pais"]  . '"';
*/
?>