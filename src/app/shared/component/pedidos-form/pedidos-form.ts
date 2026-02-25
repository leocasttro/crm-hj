import {
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewEncapsulation,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { firstValueFrom } from 'rxjs';
import { PedidoService } from '../../services/pedido.service';

@Component({
  selector: 'app-pedidos-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './pedidos-form.html',
  styleUrl: './pedidos-form.scss',
  encapsulation: ViewEncapsulation.None,
})
export class PedidosForm implements OnInit {
  pacienteForm!: FormGroup;
  activeTab: 'upload' | 'formulario' = 'upload';
  arquivoSelecionado: File | null = null;
  processandoArquivo = false;
  dadosCarregados = false;
  dadosExtraidos: any = null;

  readonly TITULO_MAX = 100;
  readonly DESCRICAO_MAX = 300;

  private fb = inject(FormBuilder);
  public activeModal = inject(NgbActiveModal);
  private pedidoService = inject(PedidoService);

  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.inicializarFormulario();
  }

  inicializarFormulario(): void {
    this.pacienteForm = this.fb.group({
      /* ================== RESUMO DO PEDIDO ================== */
      titulo: [
        '',
        [Validators.required, Validators.maxLength(this.TITULO_MAX)],
      ],
      descricao: [
        '',
        [Validators.required, Validators.maxLength(this.DESCRICAO_MAX)],
      ],

      /* ================== DADOS PESSOAIS ================== */
      nomeCompleto: ['', Validators.required],
      dataNascimento: ['', Validators.required],
      cpf: [''],
      sexo: [''],

      /* ================== CONTATO ================== */
      endereco: [''],
      telefone1: [''],
      telefone2: [''],
      email: ['', Validators.email],

      /* ================== CONVÊNIO ================== */
      convenio: [''],
      numeroCarteirinha: [''],
      validadeCarteirinha: [''],
      anexoCarteirinha: [null],
      anexoIdentidade: [null],

      /* ================== DADOS MÉDICOS ================== */
      medicoSolicitante: [''],
      crmMedico: [''],
      procedimento: ['', Validators.required],
      cid: [''],
      prioridade: ['ELETIVA'],
      dataPedido: [new Date().toISOString().split('T')[0], Validators.required],
    });
  }

  /* ================== AÇÕES DAS ABAS ================== */

  mudarAba(aba: 'upload' | 'formulario'): void {
    if (aba === 'formulario' && !this.dadosCarregados) {
      alert('Primeiro faça o upload do pedido médico');
      return;
    }
    this.activeTab = aba;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.arquivoSelecionado = input.files[0];
    }
  }

  async uploadPedido(): Promise<void> {
    if (!this.arquivoSelecionado) {
      alert('Selecione um arquivo primeiro');
      return;
    }

    this.processandoArquivo = true;

    try {
      const resposta: any = await firstValueFrom(
        this.pedidoService.importarPdf(this.arquivoSelecionado),
      );
      console.log(resposta);
      if (resposta && resposta.sucesso) {
        this.dadosExtraidos = resposta;

        this.preencherFormulario(this.dadosExtraidos);

        this.dadosCarregados = true;

        this.activeTab = 'formulario';
        this.cdr.detectChanges();
      } else {
        console.log('14. resposta sem sucesso:', resposta?.mensagem);
      }
    } catch (error: any) {
      alert(
        'Erro ao processar o arquivo: ' +
          (error.error?.message || error.message),
      );
    } finally {
      this.processandoArquivo = false;
    }
  }

  /* ================== PREENCHIMENTO DO FORMULÁRIO ================== */

  preencherFormulario(dados: any): void {
    const formatarNome = (nome: string): string => {
      if (!nome) return '';
      return nome.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
    };

    const formatarConvenio = (conv: string): string => {
      if (!conv) return '';
      return conv
        .toLowerCase()
        .split(' ')
        .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
        .join(' ');
    };

    // 🔥 TÍTULO: Usar procedimentos
    let titulo = '';
    if (dados.procedimentos && dados.procedimentos.length > 0) {
      titulo = dados.procedimentos.map((p: any) => p.descricao).join(' | ');
    }

    // 🔥 DESCRIÇÃO: Usar indicação clínica ou relatório pré-operatório
    let descricao =
      dados.indicacaoClinica || dados.relatorioPreOperatorio || '';

    // 🔥 FORMATAR DATAS para o input (yyyy-MM-dd)
    const dataNascimentoFormatada = this.formatarDataParaInput(
      dados.dataNascimento,
    );
    const dataPedidoFormatada = this.formatarDataParaInput(dados.dataPedido);
    const validadeCarteiraFormatada = this.formatarDataParaInput(
      dados.validadeCarteira,
    );

    this.pacienteForm.patchValue({
      titulo: titulo,
      descricao: descricao,

      nomeCompleto: formatarNome(dados.nomePaciente || ''),
      dataNascimento: dataNascimentoFormatada,
      cpf: dados.cpf || '',
      sexo: this.mapearSexo(dados.sexo),

      telefone1: dados.telefone || '',
      email: dados.email || '',

      convenio: formatarConvenio(dados.convenio || ''),
      numeroCarteirinha: dados.numeroCarteira || '',
      validadeCarteirinha: validadeCarteiraFormatada,

      medicoSolicitante: dados.medicoNome || '',
      crmMedico: dados.crmCompleto || '',
      procedimento: titulo,
      cid: dados.cid || '',
      prioridade: this.mapearPrioridade(
        dados.prioridade || dados.tipo || dados.caraterAtendimento,
      ),
      dataPedido: dataPedidoFormatada,
    });
  }

  private mapearSexo(sexo: string): string {
    if (!sexo) return '';
    const sexoUpper = sexo.toUpperCase();
    if (sexoUpper.includes('M')) return 'M';
    if (sexoUpper.includes('F')) return 'F';
    return 'O';
  }

  private mapearPrioridade(prioridade: string): string {
    if (!prioridade) return 'ELETIVA';
    const prioridadeUpper = prioridade.toUpperCase();
    if (prioridadeUpper.includes('URG')) return 'URGENCIA';
    if (prioridadeUpper.includes('PRIOR')) return 'PRIORIDADE';
    return 'ELETIVA';
  }

  /* ================== AÇÕES DO FORMULÁRIO ================== */

  salvar(): void {
    const camposOpcionais = [
      'cpf',
      'sexo',
      'endereco',
      'telefone1',
      'telefone2',
      'email',
      'convenio',
      'numeroCarteirinha',
      'validadeCarteirinha',
      'anexoCarteirinha',
      'anexoIdentidade',
      'medicoSolicitante',
      'crmMedico',
      'cid',
    ];

    camposOpcionais.forEach((campo) => {
      this.pacienteForm.get(campo)?.clearValidators();
      this.pacienteForm.get(campo)?.updateValueAndValidity();
    });

    if (this.pacienteForm.invalid) {
      this.pacienteForm.markAllAsTouched();

      // Mostrar quais campos estão inválidos
      const camposInvalidos = [];
      for (const campo in this.pacienteForm.controls) {
        if (this.pacienteForm.get(campo)?.invalid) {
          camposInvalidos.push(campo);
        }
      }

      alert(
        'Campos obrigatórios não preenchidos: ' + camposInvalidos.join(', '),
      );
      return;
    }

    // Retorna os dados para quem abriu o modal
    this.activeModal.close(this.pacienteForm.value);
  }

  cancelar(): void {
    this.activeModal.dismiss();
  }

  /* ================== UPLOAD DE ANEXOS ================== */

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

  get nomeCompletoInvalido(): boolean {
    const control = this.pacienteForm.get('nomeCompleto');
    return (control?.invalid && (control?.dirty || control?.touched)) || false;
  }

  // Funções de formatação de data
  private formatarDataParaExibicao(dataStr: string): string {
    if (!dataStr) return '';

    // Se já estiver no formato dd/MM/yyyy, retorna como está
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dataStr)) {
      return dataStr;
    }

    // Tenta converter de ISO (yyyy-MM-dd) para dd/MM/yyyy
    try {
      const data = new Date(dataStr);
      if (!isNaN(data.getTime())) {
        return data.toLocaleDateString('pt-BR');
      }
    } catch (e) {
      // Ignora erro
    }

    return dataStr;
  }

  private formatarDataParaInput(dataStr: string): string {
    if (!dataStr) return '';

    // Se já estiver no formato yyyy-MM-dd, retorna como está
    if (/^\d{4}-\d{2}-\d{2}$/.test(dataStr)) {
      return dataStr;
    }

    // Converte de dd/MM/yyyy para yyyy-MM-dd (formato do input date)
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dataStr)) {
      const partes = dataStr.split('/');
      return `${partes[2]}-${partes[1]}-${partes[0]}`;
    }

    return dataStr;
  }
}
