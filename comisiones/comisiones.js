'use strict';



angular.module('myApp.comisiones', ['ngRoute'])


//enrutamiento a lista de estadistica

.config(['$routeProvider', function($routeProvider) {

  $routeProvider.when('/comisiones', {

    templateUrl: 'comisiones/list.html',

    controller: 'ctrlComisiones'

  });

}])





//para auto enfocar un input

.directive('autoFocus', function($timeout) {

  return {

    restrict: 'A',

    link: function (scope, element, attrs) {

          /*

            attrs.$observe("autoFocus", function(newValue){

                if (newValue === "true")

                    $timeout(function(){element.focus()});

            });

            */

            $timeout(function() {

          // use a timout to foucus outside this digest cycle!

              element[0].focus(); //use focus function instead of autofocus attribute to avoid cross browser problem. And autofocus should only be used to mark an element to be focused when page loads.

            }, 0);

          }

        };

      })





//TODO. agregar opciones de ordenamiento a columnas

.controller('ctrlComisiones', ['$scope', '$http', function($scope, $http) {



//variables

  $scope.condicionWhere = '';



//formatear valores de campo date_created

$scope.formatearDateCreated = function (data){

  // Obteniendo todas las claves del JSON

  var json = angular.copy(data);

  for (var clave in json){

    // Controlando que json realmente tenga esa propiedad

    if (json.hasOwnProperty(clave)) {

      // Mostrando en pantalla la clave junto a su valor

      //*-console.log('fecha: ' + json[clave].date_created);

      //*-console.log('fecha formateada: ' + formatDate(json[clave].date_created));

      //se llama a funcion de libreria util/fechas.js

      json[clave].date_created = formatDate(json[clave].date_created);

    }

  }

  return json;

};



/*obtiene lista de TODAS las transacciones registradas*/

//TODO. agregar rango de fechas, puesto que cuando sean muchas se puede ralentizar

$scope.getAllData = function(){

  console.log('controlador -transacciones-getDataAll.inicio');

	   //devuelve lista de transacciones en formato json

    $http.get("./comisiones/list.php")

    .then(function (response) {

     $scope.resultados = response.data.records;

     //-$scope.resultados = $scope.formatearDateCreated($scope.resultados);

   });

    console.log('controlador -transacciones-getData.fin');

  };





  /*establece condiciones para el WHERE del query, segun los filtros elegidos en la vista, usando simbolos que luego son reemplazados por operaciones SQL
  ejemplos.
  : ===se convierte  en ===> =  
  */
//TODO. agregar condicion para busqueda por year
//TODO. agregar condicion para busqueda por mes
  $scope.getCondiciones = function(){

    console.log('controlador -transacciones-getCondiciones.inicio');

    var cond = "", c1 = "", c2 = "", c3 = "", cc = "";
    var cyear = "", cmonth = "";
    var cpais1 = "", cond_operador = "";

    if ($scope.filtros.status != ''){

      if ($scope.filtros.status == 'CANC'){

        c1 = "a.status IN ('CANC','CA','CC','CO')"; //tipos de Cancelaciones, estan agrupadas en un solo status: CANCELADA

      }else{

        c1 = "a.status:'" + $scope.filtros.status + "'";  //se usa el filtro que se ha seleccionado

      }

      cond = c1;

    }else{

      c1 = "";

    }

    //TODO. revisar esta condicion, ya que parece chocar con c1
    //condicion not cancelled
    cc    = "a.status NOT IN ('CANC','CA','CC','CO')";
    
    //Start-formar la condicion completa

    /*TODO. evaluar borrar estos bloques de condiciones
    if ($scope.mostrarFiltroPO ==true){
      //la interfaz esta mostrando el filtro de PAGO ORIGEN
      cond = (cond=="" ? cc : cond+".AND."+cc); //add:no mostrar las canceladas

      cond = (cond=="" ? c2 : cond+".AND."+c2); //add:filtrar estatus='PO'

    }

    if ($scope.mostrarFiltroPD ==true){//la interfaz esta mostrando el filtro de PAGO DESTINO 

      cond = (cond=="" ? cc : cond+".AND."+cc); //add: no mostrar las canceladas
      
      cond = (cond=="" ? c3 : cond+".AND."+c3); //add: filtrar estatus='PD'y no mostrar las canceladas

    }
    */

    if ($scope.mostrarFiltroYear ==true){//el usuario selecciono un año para filtrar
      cond = (cond == "" ? cc : cond + ".AND." + cc); //add: no mostrar las canceladas
    }

    if ($scope.mostrarFiltroMonth ==true){//el usuario selecciono un mes para filtrar

      cond = (cond == "" ? cc : cond + ".AND." + cc); //add: no mostrar las canceladas
      
    }

    //filtro por año. Ya funciona
    if ($scope.filtros.year && $scope.filtros.year!=null){
      if (cond != ''){
        cyear = "EXTRACT(YEAR FROM a.date_created)='" + $scope.filtros.year.trim() + "' ";
      }
        

      //filtro por mes, depende de que haya año seleccionado
      if ($scope.filtros.month && $scope.filtros.month!=null){
        cmonth = "EXTRACT(MONTH FROM a.date_created)='" + $scope.filtros.month.trim() + "' ";
      }
    
    }

    //agregar filtro año a la condicion, con o sin AND
    if (cyear != "")
      cond = (cond == "" ? cyear : cond + ".AND." + cyear);
    
    if (cmonth != "")
      cond = (cond == "" ? cmonth : cond + ".AND." + cmonth);


    //filtro por mes, depende de que haya año seleccionado
    if ($scope.filtros.cod_pais1 && $scope.filtros.cod_pais1 != null && $scope.filtros.cod_pais1 != ''){
      cpais1 = "a.origen_codpais='" + $scope.filtros.cod_pais1.trim() + "'";
    }

    //agregar filtro de pais origen
    if (cpais1 != "")
      cond = (cond == "" ? cpais1 : cond + ".AND." + cpais1);

    //TODO. descomentar bloque
    if ($scope.filtros.operador && $scope.filtros.operador!=null){
      cond_operador = "o.login='" + $scope.filtros.operador.trim() + "' ";
    }
      
    //agregar filtros a la condicion, con/sin AND
    if (cyear != "")
      cond = (cond == "" ? cyear : cond + ".AND." + cyear);
      
    if (cmonth != "")
      cond = (cond == "" ? cmonth : cond + ".AND." + cmonth);
      
    if (cond_operador != "")
      cond = (cond == "" ? cond_operador : cond + ".AND." + cond_operador);
    /**/

    //end-formar la condicion completa

    console.log('c1: '+ c1);
    console.log('c2: '+ c2);
    console.log('c3: '+ c3);
    console.log('cc: '+ cc);
    console.log('cyear: '+ cyear);
    console.log('cmonth: '+ cmonth);    
    console.log('cond_operador: '+ cond_operador);

    //*DEBUG
    console.log('condicion aplicada string (no es sql): '+ cond);

/*

    //TODO. usar json para almacenar las condiciones como un arreglo, asi no importaria el orden

    cond.c1 = angular.copy(c1);

    cond.c2 = angular.copy(c2);

    cond.c3 = angular.copy(c3);

    console.log('cond json: '+ JSON.stringify($scope.cond));

*/


    console.log('cond: '+ cond);

    console.log('controlador -transacciones-getCondiciones.fin');

    $scope.condicionWhere = cond;

    return cond;

  };




//TODO. agregar filtro de login usuario, para usar la lupa del usuario.

//TODO. doing. agregar filtro año
//TODO. doing. agregar filtro de mes

//function que se llama cuando se selecciona filtro de status 

//establece que botones de filtros mostrar que son excluyentes 

$scope.selectedYear = function(){
  
  if($scope.filtros.year != ''){

    $scope.mostrarFiltroYear = true;

    return;

  }else{
    
    $scope.mostrarFiltroYear = false;

  }

}


  /*inicializa filtros*/

  $scope.initFiltros = function(){

    $scope.filtros = {status: '', cod_pais1: 'PAR', cod_pais2: 'VEN'};

    //TODO. POSIBLE. pasar estas variables al arreglo filtros

    //TODO. estas combinaciones deberian ajustarse, cuando se trate de cada tipo de operador.

    //combinacion para operador destino:

    //TODO. borrar, no se usa este filtro en las estadisticas
    /*BLOCK.NO SE USA
    $scope.pago1_status = false; //filtro pago origen verificado/ o no
    //TODO. borrar, no se usa este filtro en las estadisticas
    $scope.pago2_status = false; //filtro pago destino realizado/ o pendiente
    */


    /*combinacion para operador A-origen:
    //$scope.pago1_status = false; //pago origen verificado, para que pueda aparecer algo
    //$scope.pago2_status = false; //pago destino no verificado
    */ 



    //combinacion para superadmin
    /*BLOCK.NO SE USA
    $scope.mostrarFiltroPO = true; //mostrar filtro de pago origen
    $scope.mostrarFiltroPD = true; //mostrar filtro de pago destino
    */


    /*combinacion para operador-origen. y nunca

    //$scope.mostrarFiltroPO = true; //mostrar filtro de pago origen

    //$scope.mostrarFiltroPD = false; //nunca mostrar filtro de pago destino

    */



    /*combinacion para operador-destinoB

    //$scope.mostrarFiltroPO = false; // nunca mostrar filtro de pago origen

    //$scope.mostrarFiltroPD = true; //mostrar filtro de pago destino

    */

    //se limpia filtro caja de busqueda
    $scope.busq1 = ''; 

  };  



  /*obtiene lista de las transacciones, que cumplen con los filtros*/

$scope.cargarDataFiltrada = function(){

   console.log('controlador -transacciones-getDataFiltrada.inicio');
   
   $scope.resultados = [];

   //cambiar estados de botones

   //TODO. simplicar este bloque de codigo.

   $scope.condicionWhere = '';

   $scope.getCondiciones();

   //si no hay filtros se muestra toda la data
   if ($scope.condicionWhere == ''){

    $scope.getAllData();

    return;

   }

  
   //lista data aplicando filtros

   $http.get("./comisiones/list_filtrada.php?filtros=" + $scope.condicionWhere)

       .then(function (response) {

        $scope.resultados = response.data.records;

        //-$scope.resultados = $scope.formatearDateCreated($scope.resultados);

        //-$scope.resultados = $scope.formatearDateCreated($scope.resultados);

      });

    console.log('controlador -transacciones-cargarDataFiltrada.fin');

}; //cargarDataFiltrada = function($nroBoton)



  /*obtiene lista de las transacciones, que cumplen con los filtros*/

  $scope.cargarDataFiltrada = function($nroBoton){

   console.log('controlador -transacciones-getDataFiltrada.inicio');

   //TODO. simplicar este bloque de codigo.

   $scope.condicionWhere = '';

   $scope.getCondiciones();

   if ($scope.condicionWhere == ''){

    $scope.getAllData();

    return;

   }

  //devuelve lista de transacciones, aplicando filtros

   $http.get("./comisiones/list_filtrada.php?filtros=" + $scope.condicionWhere)

       .then(function (response) {

        $scope.resultados = response.data.records;

        $scope.resultados = $scope.formatearDateCreated($scope.resultados);

      });

    console.log('controlador -transacciones-getDataFiltrada.fin');

  };//cargarDataFiltrada-end





  //TODO. agregar parametro de usuario que inicia la rermesa, o preguntar el cliente al abrir la patalla /calc/
  $scope.new = function (){

    location.href = '#!/calc/';

  };      




  //TODO. obtener lista de transacciones por usuario logueado

  $scope.listByUser = function($login){

  };//listByUser-end



  //carga lista de paises para poblar el select

  $scope.cargarPaisesDestino = function () {

    console.log('controlador:calc. funcion: cargarPaisesDestino. start');

    $http.get("./paises/list_short.php")

    .then(function (response) {

      $scope.lista_paises = response.data.records;

      console.log($scope.lista_paises);

    },

    function(data, status) {

      console.error('Error en SERVICIO de consulta de cargar lista Paises. ', status, data);

      $scope.msg = "Error consultando datos: SERVICIO de consulta de cargar lista Paises";

    })

    console.log('controlador:calc. funcion: cargarPaisesDestino. end');

  };

    //carga lista de paises para poblar el select

    $scope.cargarPaisesOrigen = function () {

      console.log('controlador:calc. funcion: cargarPaisesOrigen. start');
  
      $http.get("./paises/list_short_origen.php")
  
      .then(function (response) {
  
        $scope.lista_paises_origen = response.data.records;
  
        console.log($scope.lista_paises_origen);
  
      },
  
      function(data, status) {
  
        console.error('Error en SERVICIO de consulta de cargar lista Paises de origen. ', status, data);
  
        $scope.msg = "Error consultando datos: SERVICIO de consulta de cargar lista Paises de origen";
  
      })
  
      console.log('controlador:calc. funcion: cargarPaisesOrigen. end');
  
    };//cargarPaisesOrigen-end


    //carga lista de operadores para poblar el select widget
    $scope.cargarListaOperadores = function () {

      console.log('controlador:calc. funcion: cargarListaOperadores. start');
  
      $http.get("./operador/list_short.php")
  
      .then(function (response) {
  
        $scope.lista_operadores = response.data.records;
  
        console.log($scope.lista_operadores);
  
      },
  
      function(data, status) {
  
        console.error('Error en SERVICIO de consulta de cargarListaOperadores. ', status, data);
  
        $scope.msg = "Error consultando datos: SERVICIO de consulta de cargarListaOperadores";
  
      })
  
      console.log('controlador:calc. funcion: cargarListaOperadores. end');
  
    };//cargarListaOperadores-end



  $scope.onInit = function(){

    console.log('controlador -transacciones- inicio');

    $scope.condicionWhere = '';

    $scope.initFiltros();

    $scope.getAllData();

    $scope.cargarPaisesOrigen();

    $scope.cargarPaisesDestino();

    $scope.cargarListaOperadores();

    console.log('controlador -transacciones- fin');

  };

  //funcion llamada al inicio de la pantalla
  $scope.onInit();

  //$scope.saludo = "Saludo desde ctrl Comisiones";




}]);






/*GARBAGE:

.controller('ctrlTransaccionResumen', ['$scope', '$http', '$routeParams', function($scope, $http, $routeParams) {



  $scope.init = function(){

    console.log('controlador -transaccionResumen- inicio');

    console.log('controlador -transaccionResumen- fin');

  }



  $scope.init();

}]);

*/

