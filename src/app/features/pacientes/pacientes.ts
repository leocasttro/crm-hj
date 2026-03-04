import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

// ✅ IMPORTS CORRIGIDOS USANDO OS PATHS CONFIGURADOS
import { PacienteResumo, PacienteForm as PacienteFormModel } from '@models/paciente';
import { PacienteDto } from '@models/paciente';
import { PacienteFormComponent } from '@shared/component/paciente-form/paciente-form';
import { UiActionService } from '@services/utils';
import { mapFormToPacienteDto } from '@models/paciente/paciente.helpers';

@Component({
  standalone: true,
  selector: 'app-pacientes',
  templateUrl: './pacientes.html',
  imports: [CommonModule],
})
export class PacientesComponent implements OnInit { // ✅ Renomeado para evitar conflito

  // ✅ Usando PacienteResumo para a lista (mais adequado)
  pacientes: PacienteResumo[] = [];
  private sub!: Subscription;

  constructor(
    private uiAction: UiActionService,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    // TODO: Implementar chamada HTTP para buscar pacientes
    // this.pacienteService.listar().subscribe(...)

    this.sub = this.uiAction.action$.subscribe(action => {
      if (action === 'novo-paciente') {
        this.abrirModal();
      }
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  abrirModal(paciente?: PacienteResumo): void {
    const modalRef = this.modalService.open(PacienteFormComponent, {  // ✅ Componente correto
      size: 'lg',
      backdrop: 'static',
    });

    // ✅ Se for edição, precisa buscar o DTO completo
    if (paciente) {
      // TODO: Buscar paciente completo do backend
      // this.pacienteService.buscarPorId(paciente.id).subscribe(dto => {
      //   modalRef.componentInstance.paciente = dto;
      // });
    }

    modalRef.result.then((dados: Partial<PacienteDto>) => {
      if (dados) {
        this.salvarPaciente(dados);
      }
    }).catch(() => {}); // Ignora fechamento do modal
  }

  editar(paciente: PacienteResumo): void {
    this.abrirModal(paciente);
  }

  salvarPaciente(dados: Partial<PacienteDto>): void {  // ✅ Tipo correto
    console.log('Salvar paciente:', dados);

    // TODO: Implementar chamada HTTP para salvar
    // if (dados.id) {
    //   this.pacienteService.atualizar(dados.id, dados).subscribe(...)
    // } else {
    //   this.pacienteService.criar(dados).subscribe(...)
    // }
  }

  excluirPaciente(id: string): void {
    if (confirm('Tem certeza que deseja excluir este paciente?')) {
      // TODO: Implementar chamada HTTP para excluir
      // this.pacienteService.excluir(id).subscribe(...)
    }
  }
}
