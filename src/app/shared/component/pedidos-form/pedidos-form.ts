import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-pedidos-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './pedidos-form.html',
  styleUrl: './pedidos-form.scss',
})
export class PedidosForm implements OnInit {

  pacienteForm!: FormGroup;

  readonly TITULO_MAX = 100;
  readonly DESCRICAO_MAX = 300;

  constructor(
    private fb: FormBuilder,
    public activeModal: NgbActiveModal
  ) {}

  ngOnInit(): void {
    this.pacienteForm = this.fb.group({

      /* ================== RESUMO DO PEDIDO ================== */
      titulo: ['', [Validators.required, Validators.maxLength(this.TITULO_MAX)]],
      descricao: ['', [Validators.required, Validators.maxLength(this.DESCRICAO_MAX)]],

      /* ================== DADOS PESSOAIS ================== */
      nomeCompleto: ['', Validators.required],
      dataNascimento: ['', Validators.required],
      cpf: ['', Validators.required],
      sexo: ['', Validators.required],

      /* ================== CONTATO ================== */
      endereco: ['', Validators.required],
      telefone1: ['', Validators.required],
      telefone2: [''],
      email: ['', [Validators.required, Validators.email]],

      /* ================== CONVÊNIO ================== */
      convenio: ['', Validators.required],
      numeroCarteirinha: ['', Validators.required],
      validadeCarteirinha: ['', Validators.required],
      anexoCarteirinha: [null, Validators.required],
      anexoIdentidade: [null, Validators.required],

      /* ================== DADOS MÉDICOS ================== */
      medicoSolicitante: ['', Validators.required],
      crmMedico: ['', Validators.required],
      procedimento: ['', Validators.required],
      cid: ['', Validators.required],
      prioridade: ['', Validators.required],
      dataPedido: ['', Validators.required],
    });
  }

  /* ================== AÇÕES ================== */

  salvar(): void {
    if (this.pacienteForm.invalid) {
      this.pacienteForm.markAllAsTouched();
      return;
    }

    // Retorna os dados para quem abriu o modal
    this.activeModal.close(this.pacienteForm.value);
  }

  cancelar(): void {
    this.activeModal.dismiss();
  }

  /* ================== UPLOAD ================== */

  onFileChange(event: Event, campo: string): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.pacienteForm.get(campo)?.setValue(input.files[0]);
    }
  }

  /* ================== HELPERS ================== */

  get tituloLength(): number {
    return this.pacienteForm.get('titulo')?.value?.length || 0;
  }

  get descricaoLength(): number {
    return this.pacienteForm.get('descricao')?.value?.length || 0;
  }
}
