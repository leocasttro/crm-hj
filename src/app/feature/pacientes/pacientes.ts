import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Paciente } from '../../shared/models/paciente';
import { PacienteForm } from '../../shared/component/paciente-form/paciente-form';

@Component({
  standalone: true,
  selector: 'app-pacientes',
  templateUrl: './pacientes.html',
  imports: [CommonModule, PacienteForm], // ✅ IMPORTANTE
})
export class Pacientes {

  pacientes: Paciente[] = [];
  mostrarFormulario = false;
  pacienteSelecionado?: Paciente;

  novo(): void {
    this.pacienteSelecionado = undefined;
    this.mostrarFormulario = true;
  }

  editar(paciente: Paciente): void {
    this.pacienteSelecionado = paciente;
    this.mostrarFormulario = true;
  }

  fecharFormulario(): void {
    this.mostrarFormulario = false;
  }
}
