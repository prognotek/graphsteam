import { Component, OnInit } from '@angular/core';
import { UploadService } from '../../services/upload/upload.service';
import { MessageService } from 'primeng/api';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.css'],
  providers: [MessageService]
})
export class OverviewComponent implements OnInit {
  file: File = null as unknown as File; //variable que almacena el archivo seleccionado
  grafo: string = ''; //variable que almacena el grafo en formato Base64
  tamanoTextoNodos: number = 15 //variable que contiene el tamaño del texto de los nodos
  opacidadNodos: number = 0.5  //variable con la opacidad de los nodos
  diametroRA: number = 700; //parametro de diametro para los nodos RA
  diametroK: number = 400;  //parametro de diametro para el nodo K
  multiplicadorAlgoritmo: number = 0.8; //parametro de multiplicador para el algoritmo de centralidad de intermediación
  multiplicadorPeso: number = 0.7;  //parametro de multiplicador para el peso de los nodos
  loading: boolean = false; //variable que indica si se esta cargando el grafico
  pestaña: number = 0  //variable con la pestaña en la que estamos
  form!: FormGroup; //variable con el formulario creado para seleccionar el fichero para el grafo
  habilidadSwitched: boolean = false  //switch para la posibilidad de cambiar la habilidad 'K' por la 'P'

  constructor(
    private messageService: MessageService, //modulo de mensajes a mostrar por pantalla (pop-ups)
    private uploadService: UploadService, //modulo de carga de ficheros
  ) {}

  ngOnInit(): void {
    //definimos un nuevo grupo de de controles de formulario para controlar el texto que aparece cuando seleccionas un fichero para el grafico
    this.form = new FormGroup({
      fichero: new FormControl('')  //creamos un control para el formulario y lo inicializamos vacio
    });
  }

  //funcion que se ejecuta cuando se selecciona un archivo
  onFilechange(event: any) {
    this.file = event.target.files[0] //obtenemos el archivo seleccionado
  }

  //funcion que determina en que pestaña estamos, reacciona al cambio de pestaña
  onTabChange(event: any) {
    this.pestaña = event.index  //asignamos el indice de la pestaña a la variable
    this.form.get('fichero')?.reset() //cuando cambiamos de pestaña, reseteamos el valor del control de formulario para que aparezca vacio
    this.file = null as unknown as File //eliminamos el fichero seleccionado de la variable
    this.tamanoTextoNodos = 15  //volvemos a poner el valor original al texto de los nodos
    this.opacidadNodos = 0.5 //volvemos a poner el nivel de transparencia de los nodos
  }
  
  //funcion que se ejecuta cuando se presiona el boton de 'Ver Grafo'
  upload() {
    this.loading = true; //indicamos que se esta cargando
    this.grafo = ''; //limpiamos la variable 'grafo'
    //si se ha seleccionado un fichero...
    if (this.file) {
      //en funcion del tipo de fichero que estemos subiendo (segun la pestaña en la que estemos)...
      switch(this.pestaña) {
        case 0:
          //...llamamos al servicio que envia el fichero y los parametros a la api...
          this.uploadService.globalupload(this.diametroRA, this.diametroK, this.multiplicadorAlgoritmo, this.multiplicadorPeso, this.tamanoTextoNodos, this.opacidadNodos, this.habilidadSwitched, this.file).subscribe(resp => {
            //...si hay respuesta con el fichero en formato Base64, lo guardamos en la variable 'grafo' y si no, mostramos el error
            if(resp) {
              this.grafo = 'data:image/png;base64,' + resp;
              this.loading = false; //indicamos que ya no se esta cargando
            } else {
              this.loading = false; //indicamos que ya no se esta cargando
              alert("Atención: El fichero seleccionado no es válido o no tiene la estructura correcta")
              this.form.get('fichero')?.reset() //cuando cambiamos de pestaña, reseteamos el valor del control de formulario para que aparezca vacio
              this.file = null as unknown as File //eliminamos el fichero seleccionado de la variable
            }
          })
          break;
        case 1:
          //...llamamos al servicio que envia el fichero y los parametros a la api...
          this.uploadService.odsupload(this.tamanoTextoNodos, this.opacidadNodos, this.file).subscribe(resp => {
            if(resp) {
              this.grafo = 'data:image/png;base64,' + resp;
              this.loading = false; //indicamos que ya no se esta cargando
            } else {
              this.loading = false; //indicamos que ya no se esta cargando
              alert("Atención: El fichero seleccionado no es válido o no tiene la estructura correcta")
              this.form.get('fichero')?.reset() //cuando cambiamos de pestaña, reseteamos el valor del control de formulario para que aparezca vacio
              this.file = null as unknown as File //eliminamos el fichero seleccionado de la variable
            }
          })
          break;
        case 2:
          //...llamamos al servicio que envia el fichero y los parametros a la api...
          this.uploadService.steamupload(this.tamanoTextoNodos, this.opacidadNodos, this.file).subscribe(resp => {
            if(resp) {
              this.grafo = 'data:image/png;base64,' + resp;
              this.loading = false; //indicamos que ya no se esta cargando
            } else {
              this.loading = false; //indicamos que ya no se esta cargando
              alert("Atención: El fichero seleccionado no es válido o no tiene la estructura correcta")
              this.form.get('fichero')?.reset() //cuando cambiamos de pestaña, reseteamos el valor del control de formulario para que aparezca vacio
              this.file = null as unknown as File //eliminamos el fichero seleccionado de la variable
            }
          })
          break;
      }
    } else {
      //...si no se ha seleccionado un fichero, mostramos un mensaje de alerta
      alert("Atención: Debe adjuntar un fichero para generar el grafo.")
      //this.messageService.add({severity:'warn', summary:'Atención: ', detail:'Debe seleccionar un archivo para el gráfico'});
      this.loading = false; //indicamos que ya no se esta cargando
    }
  }

  //funcion que se ejecuta cuando se presiona el boton de 'Descargar Grafo'
  download() {
    let fecha = new Date(); //obtenemos la fecha actual
    let link = document.createElement('a'); //creamos un enlace
    link.href = this.grafo; //le asignamos la imagen del grafo
    link.download = 'grafo_' + fecha.toISOString() + '.png';  //le asignamos el nombre del archivo
    link.click(); //simulamos un click en el enlace
  }

  //funcion que detecta el cambio en el switch para cambiar la 'K' por la 'P'
  habilidadSwitchedChanged(event: any) {
    this.habilidadSwitched = event.checked
  }
}