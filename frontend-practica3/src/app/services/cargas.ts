import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
providedIn:'root'
})
export class CargasService {

api="http://localhost:3000/api";

constructor(private http:HttpClient){}

private getHeaders(){

const token = localStorage.getItem("token");

return {
headers: new HttpHeaders({
Authorization: `Bearer ${token}`
})
};

}

cargarEncuesta(formData:FormData){
return this.http.post(
`${this.api}/respuestas/carga-masiva`,
formData,
this.getHeaders()
);
}

listarCargas(actor_id:number){

return this.http.get(
`${this.api}/cargas?actor_id=${actor_id}`,
this.getHeaders()
);

}
eliminarCarga(id:number){

const token = localStorage.getItem("token");

return this.http.delete(`${this.api}/cargas/${id}`,{
headers:{
Authorization:`Bearer ${token}`
}
});

}

}