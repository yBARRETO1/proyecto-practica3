import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class Auth {

  private apiUrl = 'http://localhost:3000/api/auth/login';

  constructor(private http: HttpClient) {}

  login(correo: string, contrasena: string) {

    return this.http.post(this.apiUrl,{
      correo,
      contrasena
    });

  }

}