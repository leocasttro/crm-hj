import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Paciente } from '../../models/paciente';

@Component({
  selector: 'app-paciente-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './paciente-form.html',
  styleUrl: './paciente-form.scss',
})
export class PacienteForm {
  @Input() paciente?: Paciente;

  pacienteForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    public activeModal: NgbActiveModal // 👈 ESSENCIAL
  ) {}

  ngOnInit(): void {
    this.pacienteForm = this.fb.group({
      // ======================
      // DADOS PESSOAIS
      // ======================
      nomeCompleto: ['', Validators.required],
      dataNascimento: ['', Validators.required],
      cpf: ['', Validators.required],
      sexo: ['', Validators.required],

      // ======================
      // CONTATO
      // ======================
      endereco: ['', Validators.required],
      telefone1: ['', Validators.required],
      telefone2: [''],
      email: ['', [Validators.required, Validators.email]],

      // ======================
      // CONVÊNIO
      // ======================
      convenio: ['', Validators.required],
      numeroCarteirinha: ['', Validators.required],
      validadeCarteirinha: ['', Validators.required],
      anexoCarteirinha: [null, Validators.required],
      anexoIdentidade: [null, Validators.required],

      // ======================
      // DADOS MÉDICOS
      // ======================
      medicoSolicitante: ['', Validators.required],
      crmMedico: ['', Validators.required],
      procedimento: ['', Validators.required],
      cid: ['', Validators.required],
      lateralidade: [''],
      prioridade: ['', Validators.required],
      dataPedido: ['', Validators.required],
    });

    if (this.paciente) {
      this.pacienteForm.patchValue(this.paciente);
    }
  }

  salvar(): void {
    if (this.pacienteForm.invalid) {
      this.pacienteForm.markAllAsTouched();
      return;
    }

    // fecha o modal retornando os dados
    this.activeModal.close(this.pacienteForm.value);
  }

  cancelar(): void {
    this.activeModal.dismiss();
  }

  onFileChange(event: Event, campo: string): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.pacienteForm.get(campo)?.setValue(file);
    }
  }
}
