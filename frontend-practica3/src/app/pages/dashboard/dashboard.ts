import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard {

  menuAbierto = false;

  mostrarLogout = true;

  usuario: any;

  constructor(private router: Router) {

    this.usuario = JSON.parse(localStorage.getItem("usuario") || "{}");

  }

  toggleMenu() {
    this.menuAbierto = !this.menuAbierto;
  }

  logout() {

    localStorage.removeItem("token");
    localStorage.removeItem("usuario");

    this.router.navigate(["/"]);

  }

}