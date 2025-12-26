import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Paciente } from '../../models/paciente';

@Component({
  selector: 'app-paciente-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './paciente-form.html',
  styleUrl: './paciente-form.scss',
})
export class PacienteForm {

  @Input() paciente?: Paciente; // ✅ INPUT
  @Output() salvo = new EventEmitter<void>(); // ✅ OUTPUT

  pacienteForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.pacienteForm = this.fb.group({
      nomeCompleto: ['', Validators.required],
      cpf: ['', Validators.required],
      telefone1: ['', Validators.required],
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

    console.log('Paciente salvo:', this.pacienteForm.value);

    // emite evento para o componente pai
    this.salvo.emit();
  }
}
