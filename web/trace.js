//********************************************************************** */
//Programa que se encarga de realizar la toma de datos del usuario
//********************************************************************** */

let trace_data = new Array() ; //variable que almacenara los sucesso
var tmp_trace_data = new Array() ;
var time_tran = null; //Variable que se usa para tomar los tiempos de cambio de pag
var row_event = 0;
var Debug_status = true;
var time_send_trace = 3000 //Tiempo en que se debe enviar los trace por defecto 3 segundos
var page_prev = 0 //Almacena la pagina anterior
const  rule_time_dowload = 20000 // Poder descargar a los 20 segundo
var verifi_time_dowload = false;
var ready_page = false;

//Inicializamos los datos del trace
function load_trace(){
    //Mostramos el evento al cargar documento
    time_tran = new Date();
    trace_data[row_event] = {"event": "LoadFile", "time" : time_tran , "time_tran": 0,   'status' : 0, "row" :row_event}
    row_event++;
    setInterval(send_data_trace(), time_send_trace);
    debug_event();

    //------Creamos el boton de descarga dinamicamente----
    if(document.createStyleSheet) {
        document.createStyleSheet('trace.css');
        document.createStyleSheet('font-awesome-4.7.0/css/font-awesome.min.css');
      }
      else {
        var styles = "trace.css";
        var newSS=document.createElement('link');
        newSS.rel='stylesheet';
        newSS.href=styles;
        document.getElementsByTagName("head")[0].appendChild(newSS);

        styles = "font-awesome-4.7.0/css/font-awesome.min.css";
        newSS=document.createElement('link');
        newSS.rel='stylesheet';
        newSS.href=styles;
        document.getElementsByTagName("head")[0].appendChild(newSS);
      }
      var element = document.createElement("button");
      element.classList.add("botonF1");
      var mybody = document.getElementById("viewer");
      mybody.appendChild(element);

      var element1 = document.createElement("span");
      element1.setAttribute("id", "cmddowload");
      element1.addEventListener("click", descargar_doc, false);

      var element2 = document.createElement("i");
      element2.classList.add("fa");
      element2.classList.add("fa-download");

      element1.appendChild(element2);
      element.appendChild(element1);

      //------fin del boton descarga --------
}

//Funcion que ocurre cuando esta el documento listo en pantalla
function render_documento(){
    if (ready_page == false){
        //empezamos a contar los segundo para poder descargar el documento
        setTimeout(validar_regla_descarga, rule_time_dowload);
        ready_page = true;
    }
}

//Funcion que tomara los eventos de cambio de pagina sacara un conteo de cuanto estuvo
//en dicha pagina
function trace_page(number_pag){
    var tmp_date = new Date();
    var time_num =  tmp_date.getTime() - time_tran.getTime(); //coversion Math.round(time_num/ (1000*60*60*24))
    time_num = time_num / 1000; //convertimos a segundo
    time_tran = tmp_date;
    trace_data[row_event] = {"event": "ChangePage", "time" : time_tran , "time_tran": time_num,  "page" : number_pag, "previousPage": page_prev ,  'status' : 0, "row" :row_event}
    page_prev = number_pag;
    row_event++;
    debug_event();
}

//funcion para cuando se hace click en el link haga trace
function trace_click_link (object_doc){
    var number_pag = document.getElementById("pageNumber").value;
    var tmp_date = new Date();
    trace_data[row_event] = {"event": "ClickEvent", "time" : tmp_date , "object" : object_doc.innerHTML, "page" : number_pag , 'status' : 0,  "row" :row_event}
    row_event++;
    debug_event();
}

//Funcion que se encarga de tomar el dato si el usuario imprimio
function trace_print(){
    var tmp_date = new Date();
    trace_data[row_event] = {"event": "printfile", "time" : tmp_date ,  'status' : 0,  "row" :row_event}
    row_event++;
    debug_event();
}

//funcion quu se encarga de determinar si el usuario descargo el archivo
function trace_download(){
    var tmp_date = new Date();
    trace_data[row_event] = {"event": "Downloadfile", "time" : tmp_date ,  'status' : 0, "row" :row_event}
    row_event++;
    debug_event();
}

//funcion que envia los datos de vuleta al server para ser procesados
function send_data_trace(){
    //creamos solo la que no se han enviado
    var i, j=0;
    for (i = 0; i < trace_data.length; i++) {
        if (trace_data[i].status == 0 ){
            tmp_trace_data[j] = trace_data[i];
            j++;
        }
    }

    var request = new XMLHttpRequest();
    request.open("POST", "/web/procesar", true);
    request.setRequestHeader("Content-Type", "application/json;  charset=UTF-8");
    request.onload = function() {
        if (request.status === 200 && request.responseText !== newName) {
            for (i = 0; i < tmp_trace_data.length; i++) {
                var myrow = tmp_trace_data[i].row;
                trace_data[myrow].status = 1;
            }
            tmp_trace_data = new Array();
            console.log("Trace Enviado");
        }
        else if (request.status !== 200) {
            tmp_trace_data = new Array();
            console.log("Error no se puede Enviar el trace code:" +request.status );
        }
    };

    request.send(JSON.stringify(tmp_trace_data));
}

//funcion que se dispara cuando pasa los segundos para poder descargar
function validar_regla_descarga(){
    verifi_time_dowload = true;
}

//funcion que descarga el documenteo segun regla
function descargar_doc(){
     //validamos que este en la ultima pagina puede descargar
    /* if (document.getElementById("pageNumber").value != document.getElementById("pageNumber").getAttribute("max") && verifi_time_dowload == false) {
        alert ("para Poder descarga debe bajar hasta la ultima pagina" );
        return;
    }else{
        verifi_time_dowload = true;
    }*/

    //validacion regla de los segundo
    if (verifi_time_dowload == false){
        alert ("para Poder descarga debe esperar " + (rule_time_dowload  / 1000) + " segundos" );
        return;
    }


}

function debug_event(){
    if (Debug_status){
        console.log("eventos debug:");
        //console.log(JSON.stringify(trace_data));
        console.log(trace_data);
        console.log("----------------------------------------");
    }

}
