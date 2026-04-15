import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

import { UsuariosService } from '../../services/usuarios';
import { CompaniasService } from '../../services/companias';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register implements OnInit, AfterViewInit {

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

  // 🔥 MISMO COMPORTAMIENTO QUE LOGIN
  ngAfterViewInit() {
    const video = document.querySelector('.video-bg') as HTMLVideoElement;

    if (video) {
      video.muted = true;
      video.play().catch(() => {});
    }
  }

  onCompaniaChange() {
    this.crearCompaniaModo = this.compania_id === "crear";
  }

  crearCompania() {
    this.companiasService.crear({ nombre: this.nuevaCompania })
      .subscribe({
        next: () => {
          alert("Compañía creada");

          this.companiasService.listar()
            .subscribe((data: any) => {
              this.companias = data.data;
              this.compania_id = this.companias[0].id;
            });

          this.crearCompaniaModo = false;
          this.nuevaCompania = "";
        },
        error: () => alert("Error creando compañía")
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
        next: () => {
          alert("Usuario creado correctamente");
          this.router.navigate(["/"]);
        },
        error: (err: any) => {
          alert(err.error?.mensaje || "Error al registrar");
        }
      });
  }

}