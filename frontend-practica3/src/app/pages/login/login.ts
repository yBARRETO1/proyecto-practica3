import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  correo = '';
  contrasena = '';

  mensaje = '';
  mostrarModal = false;

  constructor(
    private auth: Auth,
    private router: Router
  ) { }

  login() {

    const data = {
      correo: this.correo,
      contrasena: this.contrasena
    };

    this.auth.login(data.correo, data.contrasena).subscribe({

      next: (res: any) => {

        localStorage.setItem("usuario",JSON.stringify(res.usuario));
        localStorage.setItem('token', res.token);
        this.router.navigate(['/dashboard']);

      },

      error: (err) => {

        console.log("ERROR LOGIN:", err);

        this.mensaje = err?.error?.mensaje || "Credenciales inválidas";

        // forzar apertura del modal inmediatamente
        setTimeout(() => {
          this.mostrarModal = true;
        });

      }


    });

  }

  cerrarModal() {
    this.mostrarModal = false;
  }

}