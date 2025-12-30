import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { Paciente } from '../../shared/models/paciente';
import { PacienteForm } from '../../shared/component/paciente-form/paciente-form';
import { UiActionService } from '../../shared/services/ui-action.service';
import { PACIENTES_MOCK } from '../../shared/mocks/pacientes.mock'; // 👈 AQUI

@Component({
  standalone: true,
  selector: 'app-pacientes',
  templateUrl: './pacientes.html',
  imports: [CommonModule],
})
export class Pacientes implements OnInit, OnDestroy {

  pacientes: Paciente[] = [];
  private sub!: Subscription;

  constructor(
    private uiAction: UiActionService,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    // ✅ MOCK PARA LISTAGEM
    this.pacientes = structuredClone(PACIENTES_MOCK);

    this.sub = this.uiAction.action$.subscribe(action => {
      if (action === 'novo-paciente') {
        this.abrirModal();
      }
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  abrirModal(paciente?: Paciente): void {
    const modalRef = this.modalService.open(PacienteForm, {
      size: 'lg',
      backdrop: 'static',
    });

    modalRef.componentInstance.paciente = paciente;

    modalRef.result.then((dados) => {
      if (dados) {
        this.salvarPaciente(dados);
      }
    });
  }

  editar(paciente: Paciente): void {
    this.abrirModal(paciente);
  }

  salvarPaciente(dados: Paciente): void {
    console.log('Salvar paciente:', dados);

    // 🧪 MOCK: adiciona na lista
    this.pacientes.unshift({
      ...dados,
      id: Date.now(),
    });
  }
}
