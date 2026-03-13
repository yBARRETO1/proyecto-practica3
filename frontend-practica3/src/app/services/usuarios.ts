import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class Usuarios {

  private api = "http://localhost:3000/api/usuarios";

  constructor(private http: HttpClient) {}

  registrar(data:any){

    return this.http.post(`${this.api}/registro`,data);

  }

}