import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class Usuarios {

  private api = "https://backend-practica3-973508854375.us-central1.run.app";

  constructor(private http: HttpClient) {}

  registrar(data:any){

    return this.http.post(`${this.api}/registro`,data);

  }

}