import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { PacienteDto } from '@models/paciente';
import {
  mapPacienteDtoToForm,
  mapFormToPacienteDto
} from '@models/paciente';

@Component({
  selector: 'app-paciente-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './paciente-form.html',
  styleUrl: './paciente-form.scss',
})
export class PacienteFormComponent {
  @Input() paciente?: PacienteDto;  // ✅ Recebe DTO

  pacienteForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    public activeModal: NgbActiveModal
  ) {}

  ngOnInit(): void {
    this.initForm();

    if (this.paciente) {
      // ✅ Converte DTO para Form usando helper
      const formData = mapPacienteDtoToForm(this.paciente);
      this.pacienteForm.patchValue(formData);
    }
  }

  private initForm(): void {
    this.pacienteForm = this.fb.group({
      // ✅ Campos do PacienteForm (types)
      primeiroNome: ['', Validators.required],
      sobrenome: ['', Validators.required],
      dataNascimento: ['', Validators.required],
      sexoCodigo: ['', Validators.required],
      documentoTipo: ['', Validators.required],
      documentoNumero: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telefonePrincipal: ['', Validators.required],
      telefoneSecundario: [''],
      possuiWhatsApp: [false],
      logradouro: ['', Validators.required],
      numero: ['', Validators.required],
      complemento: [''],
      bairro: ['', Validators.required],
      cidade: ['', Validators.required],
      estado: ['', Validators.required],
      cep: ['', Validators.required],
      pais: ['Brasil'],
      observacoes: ['']
    });
  }

  salvar(): void {
    if (this.pacienteForm.invalid) {
      this.pacienteForm.markAllAsTouched();
      return;
    }

    // ✅ Converte Form para DTO usando helper
    const dadosParaBackend = mapFormToPacienteDto(this.pacienteForm.value);
    this.activeModal.close(dadosParaBackend);
  }

  cancelar(): void {
    this.activeModal.dismiss();
  }
}
