import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CompaniasService {

  private apiUrl = `${environment.apiUrl}/companias`;

  constructor(private http: HttpClient) {}

  crear(data: any) {
    return this.http.post(this.apiUrl, data);
  }

  listar() {
    return this.http.get(this.apiUrl);
  }
}