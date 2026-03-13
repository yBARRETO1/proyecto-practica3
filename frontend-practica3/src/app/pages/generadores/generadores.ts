import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CargasService } from '../../services/cargas';
import { RouterModule } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';


@Component({
selector:'app-generadores',
standalone:true,
imports:[CommonModule,FormsModule,RouterModule],
templateUrl:'./generadores.html',
styleUrl:'./generadores.css'
})

export class Generadores implements OnInit{

menuAbierto=false;

archivo:any;
numero_encuesta=1;
fecha_carga="";

cargas:any[]=[];

actor_id=1;

constructor(
private cargasService:CargasService,
private cdr:ChangeDetectorRef
){}



ngOnInit(){
this.listar();
}


toggleMenu(){
this.menuAbierto=!this.menuAbierto;
}


onFileChange(event:any){

this.archivo=event.target.files[0];

}


cargar(){

const formData=new FormData();

formData.append("archivo",this.archivo);
formData.append("actor_id",this.actor_id.toString());
formData.append("numero_encuesta",this.numero_encuesta.toString());
formData.append("fecha_carga",this.fecha_carga);

this.cargasService.cargarEncuesta(formData)
.subscribe((res:any)=>{

alert(res.mensaje);

this.listar();

});

}


listar(){

this.cargasService.listarCargas(this.actor_id)
.subscribe((res:any)=>{

console.log(res);

this.cargas=res.data;

this.cdr.detectChanges();

});

}
eliminar(id:number){

const confirmar = confirm("¿Está seguro de eliminar esta carga?");

if(!confirmar) return;

this.cargasService.eliminarCarga(id)
.subscribe((res:any)=>{

alert("Carga eliminada correctamente");

this.listar();

});

}

}