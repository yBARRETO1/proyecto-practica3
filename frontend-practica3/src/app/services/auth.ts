import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class Auth {

  private apiUrl = 'https://backend-practica3-973508854375.us-central1.run.app';

  constructor(private http: HttpClient) {}

  login(correo: string, contrasena: string) {

    return this.http.post(this.apiUrl,{
      correo,
      contrasena
    });

  }

}