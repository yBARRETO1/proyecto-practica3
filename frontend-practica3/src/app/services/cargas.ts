import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CargasService {

  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  private getHeaders() {
    const token = localStorage.getItem('token');

    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`
      })
    };
  }

  cargarEncuesta(formData: FormData) {
    return this.http.post(
      `${this.apiUrl}/respuestas/carga-masiva`,
      formData,
      this.getHeaders()
    );
  }

  listarCargas(actor_id: number) {
    return this.http.get(
      `${this.apiUrl}/cargas?actor_id=${actor_id}`,
      this.getHeaders()
    );
  }

  eliminarCarga(id: number) {
    return this.http.delete(
      `${this.apiUrl}/cargas/${id}`,
      this.getHeaders()
    );
  }
}