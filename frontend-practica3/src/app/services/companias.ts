import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class Companias {

  private api = "http://localhost:3000/api/Companias";

  constructor(private http: HttpClient) {}

  listar(){
    return this.http.get(this.api);
  }

  crear(nombre:string){
    return this.http.post(this.api,{nombre});
  }

}