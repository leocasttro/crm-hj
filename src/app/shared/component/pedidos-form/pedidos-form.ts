import {
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewEncapsulation,
  inject,
  Input,
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
import { PedidoDto } from '../../models/pedido.dto';

// ==================== INTERFACES PARA O BACKEND (VALUE OBJECTS) ====================
interface NomeCompletoValue {
  primeiroNome: string;
  sobrenome: string;
}

interface DataNascimentoValue {
  valor: string;
}

interface DocumentoValue {
  numero: string;
  tipoDocumento: 'CPF' | 'RG' | 'OUTRO';
}

interface EmailValue {
  endereco: string;
}

interface TelefoneValue {
  numero: string;
  tipo: 'CELULAR' | 'RESIDENCIAL' | 'COMERCIAL';
}

interface SexoValue {
  tipo: 'MASCULINO' | 'FEMININO' | 'NAO_INFORMADO';
}

interface EnderecoValue {
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  pais?: string;
}

interface UpdatePedidoRequest {
  nomePaciente?: NomeCompletoValue;
  dataNascimento?: DataNascimentoValue;
  cpfPaciente?: DocumentoValue;
  emailPaciente?: EmailValue;
  telefonesPaciente?: TelefoneValue[];
  sexoPaciente?: SexoValue;
  enderecoPaciente?: EnderecoValue;
  medicoSolicitanteNome?: string;
  medicoSolicitanteCrm?: string;
  medicoSolicitanteEspecialidade?: string;
  procedimentoCodigoTUSS?: string;
  procedimentoDescricao?: string;
  procedimentoCategoria?: string;
  convenioNome?: string;
  convenioNumeroCarteira?: string;
  convenioValidadeCarteira?: string;
  convenioTipoPlano?: string;
  cidCodigo?: string;
  cidDescricao?: string;
  prioridade?: string;
  dataPedido?: string;
  observacoes?: string[];
}

@Component({
  selector: 'app-pedidos-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './pedidos-form.html',
  styleUrl: './pedidos-form.scss',
  encapsulation: ViewEncapsulation.None,
})
export class PedidosForm implements OnInit {
  // Receber pedido para edição
  @Input() pedidoExistente?: PedidoDto;
  @Input() modoEdicao: boolean = false;

  pacienteForm!: FormGroup;
  activeTab: 'upload' | 'formulario' = 'upload';
  arquivoSelecionado: File | null = null;
  processandoArquivo = false;
  dadosCarregados = false;
  dadosExtraidos: any = null;
  pedidoId?: string;

  readonly TITULO_MAX = 100;
  readonly DESCRICAO_MAX = 300;

  private fb = inject(FormBuilder);
  public activeModal = inject(NgbActiveModal);
  private pedidoService = inject(PedidoService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.inicializarFormulario();

    // Se for modo edição, carrega os dados do pedido existente
    if (this.modoEdicao && this.pedidoExistente) {
      console.log('📦 Pedido existente recebido:', this.pedidoExistente);
      console.log('🆔 ID do pedido:', this.pedidoExistente.id);

      this.pedidoId = this.pedidoExistente.id;

      if (!this.pedidoId) {
        console.error('❌ ERRO: pedidoExistente não tem ID!');
      } else {
        console.log('✅ pedidoId setado para:', this.pedidoId);
      }

      this.carregarDadosParaEdicao(this.pedidoExistente);
      this.activeTab = 'formulario';
      this.dadosCarregados = true;
    }
  }

  inicializarFormulario(): void {
    this.pacienteForm = this.fb.group({
      /* ================== RESUMO DO PEDIDO ================== */
      titulo: [
        '',
        [Validators.required, Validators.maxLength(this.TITULO_MAX)],
      ],
      descricao: [''], // ✅ Sem validators, apenas para exibição

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
  // Carregar dados do pedido existente para edição
  carregarDadosParaEdicao(pedido: PedidoDto): void {
    const dataNascimentoFormatada = this.formatarDataParaInput(
      pedido.dataNascimento?.toString() || '',
    );
    const dataPedidoFormatada = this.formatarDataParaInput(
      pedido.dataPedido?.toString() || '',
    );
    const validadeCarteiraFormatada = this.formatarDataParaInput(
      pedido.convenioValidadeCarteira?.toString() || '',
    );

    this.pacienteForm.patchValue({
      titulo: pedido.procedimento || '',
      descricao: pedido.indicacaoClinica || pedido.relatorioPreOperatorio || '',
      nomeCompleto: pedido.nomePaciente || pedido.paciente?.nomeCompleto || '',
      dataNascimento: dataNascimentoFormatada,
      cpf: pedido.cpfPaciente || pedido.paciente?.documentoNumero || '',
      sexo: pedido.sexoPaciente || pedido.paciente?.sexo || '',
      endereco: pedido.enderecoPaciente || '',
      telefone1:
        pedido.telefonePaciente ||
        (pedido.paciente?.telefones ? pedido.paciente.telefones[0] : ''),
      email: pedido.emailPaciente || pedido.paciente?.email || '',
      convenio: pedido.convenioNome || pedido.convenio || '',
      numeroCarteirinha:
        pedido.convenioNumeroCarteira || pedido.numeroCarteira || '',
      validadeCarteirinha: validadeCarteiraFormatada,
      medicoSolicitante:
        pedido.medicoSolicitanteNome || pedido.medicoSolicitante || '',
      crmMedico: pedido.medicoSolicitanteCrm || pedido.crmCompleto || '',
      procedimento: pedido.procedimentoDescricao || pedido.procedimento || '',
      cid: pedido.cidCodigo || pedido.cid || '',
      prioridade: pedido.prioridade || 'ELETIVA',
      dataPedido: dataPedidoFormatada,
    });
  }

  /* ================== AÇÕES DAS ABAS ================== */

  mudarAba(aba: 'upload' | 'formulario'): void {
    if (aba === 'formulario' && !this.dadosCarregados && !this.modoEdicao) {
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
      this.pedidoId = resposta?.pedidoId; // Armazena o ID do pedido para futuras atualizações
      if (resposta && resposta.sucesso) {
        this.dadosExtraidos = resposta;
        this.preencherFormulario(this.dadosExtraidos);
        this.dadosCarregados = true;
        this.activeTab = 'formulario';
        this.cdr.detectChanges();
      } else {
        console.log('resposta sem sucesso:', resposta?.mensagem);
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

    // TÍTULO: Usar procedimentos
    let titulo = '';
    if (dados.procedimentos && dados.procedimentos.length > 0) {
      titulo = dados.procedimentos.map((p: any) => p.descricao).join(' | ');
    }

    // DESCRIÇÃO: Usar indicação clínica ou relatório pré-operatório
    let descricao =
      dados.indicacaoClinica || dados.relatorioPreOperatorio || '';

    // FORMATAR DATAS para o input (yyyy-MM-dd)
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
    // 🔥 Removemos a lógica de campos opcionais e validação desnecessária
    // Apenas verifica se o formulário é válido para os campos obrigatórios

    if (this.pacienteForm.invalid) {
      this.pacienteForm.markAllAsTouched();

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

    // 🔥 Sempre chama a atualização (já que só existe modo edição)
    this.atualizarPedido();
  }

  private atualizarPedido(): void {
    // 🔥 VERIFICAÇÃO CRÍTICA COM LOG DETALHADO
    console.log('🔍 Verificando pedidoId antes do envio:', this.pedidoId);

    if (!this.pedidoId) {
      console.error('❌ ERRO CRÍTICO: pedidoId está undefined!');
      console.log('📋 Estado do componente:', {
        modoEdicao: this.modoEdicao,
        pedidoExistente: this.pedidoExistente,
        pedidoId: this.pedidoId,
      });
      alert('Erro: ID do pedido não encontrado. Por favor, tente novamente.');
      return;
    }

    const dadosAtualizados = this.montarDadosAtualizacao();
    console.log(
      '📤 Enviando requisição PUT para:',
      `/api/pedidos/${this.pedidoId}`,
    );
    console.log('📦 Dados:', JSON.stringify(dadosAtualizados, null, 2));

    this.pedidoService
      .atualizarPedido(this.pedidoId, dadosAtualizados)
      .subscribe({
        next: (response) => {
          console.log('✅ Pedido atualizado com sucesso!', response);
          this.activeModal.close(response);
        },
        error: (err) => {
          console.error('❌ Erro ao atualizar pedido', err);
          console.error('🔍 URL da requisição:', err.url);
          alert('Erro ao atualizar: ' + (err.error?.message || err.message));
        },
      });
  }

  // 🔥 MONTAR DADOS NO FORMATO CORRETO COM VALUE OBJECTS
  private montarDadosAtualizacao(): UpdatePedidoRequest {
    const request: UpdatePedidoRequest = {};

    // ==================== DADOS DO PACIENTE ====================
    if (this.pacienteForm.get('nomeCompleto')?.value) {
      const nomeCompleto = this.pacienteForm.get('nomeCompleto')?.value;
      const partes = nomeCompleto.trim().split(' ');
      const primeiroNome = partes[0];
      const sobrenome = partes.slice(1).join(' '); // Junta o resto como sobrenome

      request.nomePaciente = {
        primeiroNome: primeiroNome,
        sobrenome: sobrenome || '', // Se não tiver sobrenome, envia string vazia
      };
    }

    if (this.pacienteForm.get('dataNascimento')?.value) {
      request.dataNascimento = {
        valor: this.pacienteForm.get('dataNascimento')?.value,
      };
    }

    if (this.pacienteForm.get('cpf')?.value) {
      request.cpfPaciente = {
        numero: this.pacienteForm.get('cpf')?.value.replace(/\D/g, ''),
        tipoDocumento: 'CPF',
      };
    }

    if (this.pacienteForm.get('email')?.value) {
      request.emailPaciente = {
        endereco: this.pacienteForm.get('email')?.value,
      };
    }

    const telefone = this.pacienteForm.get('telefone1')?.value;
    if (telefone) {
      request.telefonesPaciente = [
        {
          numero: telefone.replace(/\D/g, ''),
          tipo: 'CELULAR'
        },
      ];
    }

    const sexo = this.pacienteForm.get('sexo')?.value;
    if (sexo) {
      let tipoSexo: 'MASCULINO' | 'FEMININO' | 'NAO_INFORMADO' =
        'NAO_INFORMADO';
      if (sexo.toUpperCase() === 'M') tipoSexo = 'MASCULINO';
      if (sexo.toUpperCase() === 'F') tipoSexo = 'FEMININO';
      request.sexoPaciente = { tipo: tipoSexo };
    }

    const endereco = this.pacienteForm.get('endereco')?.value;
    if (endereco) {
      request.enderecoPaciente = endereco;
    }

    // ==================== MÉDICO ====================
    if (this.pacienteForm.get('medicoSolicitante')?.value) {
      request.medicoSolicitanteNome =
        this.pacienteForm.get('medicoSolicitante')?.value;
    }

    if (this.pacienteForm.get('crmMedico')?.value) {
      request.medicoSolicitanteCrm = this.pacienteForm.get('crmMedico')?.value;
    }

    // ==================== PROCEDIMENTO ====================
    if (this.pacienteForm.get('procedimento')?.value) {
      request.procedimentoDescricao =
        this.pacienteForm.get('procedimento')?.value;
    }

    // ==================== CONVÊNIO ====================
    if (this.pacienteForm.get('convenio')?.value) {
      request.convenioNome = this.pacienteForm.get('convenio')?.value;
    }

    if (this.pacienteForm.get('numeroCarteirinha')?.value) {
      request.convenioNumeroCarteira =
        this.pacienteForm.get('numeroCarteirinha')?.value;
    }

    if (this.pacienteForm.get('validadeCarteirinha')?.value) {
      request.convenioValidadeCarteira = this.pacienteForm.get(
        'validadeCarteirinha',
      )?.value;
    }

    // ==================== CID ====================
    if (this.pacienteForm.get('cid')?.value) {
      request.cidCodigo = this.pacienteForm.get('cid')?.value;
    }

    // ==================== PRIORIDADE ====================
    if (this.pacienteForm.get('prioridade')?.value) {
      request.prioridade = this.pacienteForm.get('prioridade')?.value;
    }

    // ==================== DATA DO PEDIDO ====================
    if (this.pacienteForm.get('dataPedido')?.value) {
      request.dataPedido = this.pacienteForm.get('dataPedido')?.value;
    }

    return request;
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
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dataStr)) {
      return dataStr;
    }
    try {
      const data = new Date(dataStr);
      if (!isNaN(data.getTime())) {
        return data.toLocaleDateString('pt-BR');
      }
    } catch (e) {}
    return dataStr;
  }

  private formatarDataParaInput(dataStr: string): string {
    if (!dataStr) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(dataStr)) {
      return dataStr;
    }
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dataStr)) {
      const partes = dataStr.split('/');
      return `${partes[2]}-${partes[1]}-${partes[0]}`;
    }
    return dataStr;
  }
}
