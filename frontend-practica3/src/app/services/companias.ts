import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class Companias {

  private api = "https://backend-practica3-973508854375.us-central1.run.app";

  constructor(private http: HttpClient) {}

  listar(){
    return this.http.get(this.api);
  }

  crear(nombre:string){
    return this.http.post(this.api,{nombre});
  }

}