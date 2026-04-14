import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { UsuariosService } from '../../services/usuarios';
import { CompaniasService } from '../../services/companias';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register implements OnInit {

  nombre_completo = "";
  correo = "";
  contrasena = "";

  rol_id = 3;

  companias: any[] = [];
  compania_id: any = null;

  crearCompaniaModo = false;
  nuevaCompania = "";

  constructor(
    private usuarios: UsuariosService,
    private companiasService: CompaniasService,
    private router: Router
  ) {}

  ngOnInit() {

    this.companiasService.listar()
      .subscribe((res: any) => {
        this.companias = res.data;
      });

  }

  onCompaniaChange() {

    if (this.compania_id === "crear") {
      this.crearCompaniaModo = true;
    } else {
      this.crearCompaniaModo = false;
    }

  }

  activarCrearCompania() {
    this.crearCompaniaModo = true;
  }

  crearCompania() {

    this.companiasService.crear({ nombre: this.nuevaCompania })
      .subscribe({

        next: (res: any) => {

          alert("Compañía creada");

          // recargar lista
          this.companiasService.listar()
            .subscribe((data: any) => {

              this.companias = data.data;

              const ultima = this.companias[0];
              this.compania_id = ultima.id;

            });

          this.crearCompaniaModo = false;
          this.nuevaCompania = "";

        },

        error: (err: any) => {
          alert("Error creando compañía");
        }

      });

  }

  registrar() {

    const data = {
      compania_id: this.compania_id,
      rol_id: this.rol_id,
      nombre_completo: this.nombre_completo,
      correo: this.correo,
      contrasena: this.contrasena
    };

    this.usuarios.registrar(data)
      .subscribe({

        next: (res: any) => {

          alert("Usuario creado correctamente");
          this.router.navigate(["/"]);

        },

        error: (err: any) => {
          alert(err.error?.mensaje || "Error al registrar");
        }

      });

  }

}