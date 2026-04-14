import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {

  private apiUrl = `${environment.apiUrl}/usuarios`;

  constructor(private http: HttpClient) {}

  registrar(data: any) {
    return this.http.post(`${this.apiUrl}/registro`, data);
  }

  listar() {
    return this.http.get(this.apiUrl);
  }
}