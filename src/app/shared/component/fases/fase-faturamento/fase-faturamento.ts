import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChecklistItem, PedidoDto } from '@core/models';
import { ToastService } from '@services/utils';
import { FaIconComponent, FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

// ─────────────────────────────────────────────
// Interfaces
// ─────────────────────────────────────────────

export interface Auxiliar {
  id: number;
  nome: string;
  ativo: boolean;
  valorTotal: number;
}

export interface Procedimento {
  parcial: boolean;
  codigo: string;
  descricao: string;
  quantidade: number;
  valorCirurgiao: number;
  auxiliares: Record<string, number>;
  valorInstrutor: number;
  total: number;
}

export interface Totais {
  totalCirurgiao: number;
  totalAuxiliares: Record<string, number>;
  totalInstrutor: number;
  totalGeral: number;
}

/**
 * Divisão por membro da equipe.
 * tipoCirurgiao / tipoInstrutor / tipo_aux_N: 'PERCENTUAL' | 'VALOR'
 * cirurgiao / instrutor / aux_N: valor digitado
 *
 * PERCENTUAL → valor membro = totalGeral * (divisao / 100)
 * VALOR      → valor membro = divisao (fixo, rateado entre procedimentos)
 */
export interface Divisao {
  tipoCirurgiao: 'PERCENTUAL' | 'VALOR';
  cirurgiao: number;
  tipoInstrutor: 'PERCENTUAL' | 'VALOR';
  instrutor: number;
  [key: string]: any; // 'tipo_aux_N' e 'aux_N'
}

@Component({
  selector: 'app-fase-faturamento',
  standalone: true,
  imports: [CommonModule, FormsModule, FaIconComponent, FontAwesomeModule],
  templateUrl: './fase-faturamento.html',
  styleUrl: './fase-faturamento.scss',
})
export class FaseFaturamento implements OnInit {
  @Input() pedido!: PedidoDto;
  @Input() checklist: ChecklistItem[] = [];
  @Input() podeAvancar: boolean = false;
  @Input() loading: boolean = false;

  @Output() solicitarAutorizacao = new EventEmitter<void>();
  @Output() faturar = new EventEmitter<void>();
  @Output() emitirGuia = new EventEmitter<void>();
  @Output() visualizarDocumentos = new EventEmitter<void>();
  @Output() onToggleDocumento = new EventEmitter<ChecklistItem>();
  @Output() avancar = new EventEmitter<{ guia: string; valores: any }>();

  faTrash = faTrash;

  // ── Dados do faturamento ──────────────────────────────────
  dadosFaturamento = {
    numeroGuia: '',
    data: '',
    convenio: '',
    hospital: '',
    cirurgiao: '',
    observacao: '',
    // Financeiro
    paciente: '',
    banco: '',
    imposto: 0,          // % de imposto sobre o total geral
    numeroNF: '',
    dataRepasse: '',
    status: '',
    formaPagamento: '',
    numeroPagamento: '',
    tipoInstrutor: 'INSTRU',
    // Parcelas
    pagamento: '',
    parcelas: 0,
    dataPrimeiraParcela: '',
    sinal: 0,
    impostoSinal: 0,
    formaPagamentoSinal: '',
    numeroCheque: '',
  };

  // ── Equipe ────────────────────────────────────────────────
  auxiliares: Auxiliar[] = [];
  private proximoIdAux = 1;

  // ── Procedimentos ─────────────────────────────────────────
  procedimentos: Procedimento[] = [];

  // ── Divisão ───────────────────────────────────────────────
  divisao: Divisao = {
    tipoCirurgiao: 'PERCENTUAL',
    cirurgiao: 0,
    tipoInstrutor: 'PERCENTUAL',
    instrutor: 0,
  };

  // ── Totais ────────────────────────────────────────────────
  totais: Totais = {
    totalCirurgiao: 0,
    totalAuxiliares: {},
    totalInstrutor: 0,
    totalGeral: 0,
  };

  constructor(private toast: ToastService) {}

  // ─────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.inicializarAuxiliares();
    this.inicializarProcedimentos();
    this.carregarDadosPedido();
  }

  // ── Inicialização ─────────────────────────────────────────

  private inicializarAuxiliares(): void {
    this.auxiliares = [];
  }

  private inicializarProcedimentos(): void {
    if (this.pedido?.procedimentos && this.pedido.procedimentos.length > 0) {
      this.procedimentos = this.pedido.procedimentos.map((proc: any) => ({
        parcial: false,
        codigo: proc.codigoTUSS,
        descricao: proc.descricao,
        quantidade: 1,
        valorCirurgiao: 0,
        auxiliares: {},
        valorInstrutor: 0,
        total: 0,
      }));
    } else if (this.pedido?.procedimentoDescricao) {
      this.procedimentos = [
        {
          parcial: false,
          codigo: this.pedido.procedimentoCodigo || '',
          descricao: this.pedido.procedimentoDescricao,
          quantidade: 1,
          valorCirurgiao: 0,
          auxiliares: {},
          valorInstrutor: 0,
          total: 0,
        },
      ];
    } else {
      this.procedimentos = [];
    }

    // Garante que todos os auxiliares já existentes têm entrada em cada procedimento
    this.procedimentos.forEach((proc) => {
      this.auxiliares.forEach((aux) => {
        if (proc.auxiliares[`aux_${aux.id}`] === undefined) {
          proc.auxiliares[`aux_${aux.id}`] = 0;
        }
      });
    });
  }

  private carregarDadosPedido(): void {
    if (!this.pedido) return;
    this.dadosFaturamento.numeroGuia = this.pedido.numeroGuia || '';
    this.dadosFaturamento.data = this.pedido.dataPedido
      ? new Date(this.pedido.dataPedido).toISOString().split('T')[0]
      : '';
    this.dadosFaturamento.convenio  = this.pedido.convenioNome || '';
    this.dadosFaturamento.hospital  = this.pedido.agendamentoHospital || '';
    this.dadosFaturamento.cirurgiao = this.pedido.medicoSolicitanteNome || '';
    this.dadosFaturamento.paciente  = this.pedido.paciente?.nomeCompleto || '';
  }

  // ── Equipe ────────────────────────────────────────────────

  adicionarAuxiliar(): void {
    if (this.auxiliares.length >= 4) {
      this.toast.warning('Máximo de 4 auxiliares permitidos');
      return;
    }

    const id = this.proximoIdAux++;
    this.auxiliares.push({ id, nome: '', ativo: true, valorTotal: 0 });

    // Inicializa chaves de divisão do novo auxiliar
    this.divisao[`tipo_aux_${id}`] = 'PERCENTUAL';
    this.divisao[`aux_${id}`]      = 0;

    // Inicializa valor do auxiliar em cada procedimento
    this.procedimentos.forEach((proc) => {
      proc.auxiliares[`aux_${id}`] = 0;
    });

    this.atualizarTotais();
  }

  removerAuxiliar(id: number): void {
    const index = this.auxiliares.findIndex((a) => a.id === id);
    if (index === -1) return;

    this.auxiliares.splice(index, 1);

    // Remove chaves de divisão e valores nos procedimentos
    delete this.divisao[`tipo_aux_${id}`];
    delete this.divisao[`aux_${id}`];
    this.procedimentos.forEach((proc) => delete proc.auxiliares[`aux_${id}`]);

    this.atualizarTotais();
  }

  toggleAuxiliar(aux: Auxiliar): void {
    aux.ativo = !aux.ativo;
    this.atualizarTotais();
  }

  // ── Divisão ───────────────────────────────────────────────

  /**
   * Chamado quando o select de tipo (% / R$) muda.
   * Reseta o valor do membro para evitar cálculo com tipo inconsistente.
   */
  onTipoDivisaoChange(membro: string): void {
    if (membro === 'cirurgiao') {
      this.divisao.cirurgiao = 0;
    } else if (membro === 'instrutor') {
      this.divisao.instrutor = 0;
    } else {
      // membro = 'aux_N'
      this.divisao[membro] = 0;
    }
    this.recalcularPorDivisao();
  }

  /** Chamado ao alterar qualquer valor de divisão nos inputs acima da tabela. */
  onDivisaoChange(): void {
    this.recalcularPorDivisao();
  }

  /**
   * Distribui os valores de divisão entre os procedimentos.
   *
   * Regras:
   * - PERCENTUAL → valor membro = totalBase × (divisao / 100)
   * - VALOR      → valor membro = divisao (fixo), rateado igualmente por procedimento
   *
   * O totalBase é a soma bruta atual de todos os valores nos procedimentos.
   * Quando nenhum valor foi inserido ainda, o cálculo resulta em 0 (sem base).
   *
   * Exemplo: cirurgia de R$ 50.000, cirurgião 60%, aux1 30%, aux2 10%
   *   → cirurgião R$ 30.000 | aux1 R$ 15.000 | aux2 R$ 5.000
   *   → cada valor é dividido igualmente entre os N procedimentos
   */
  private recalcularPorDivisao(): void {
    const totalBase = this._calcularTotalBase();
    if (totalBase <= 0 || this.procedimentos.length === 0) return;

    const qtd = this.procedimentos.length;

    // Calcula o valor total de cada membro com base na divisão configurada
    const vCirurgiao = this._valorMembro(
      this.divisao.tipoCirurgiao,
      this.divisao.cirurgiao,
      totalBase,
    );
    const vInstrutor = this._valorMembro(
      this.divisao.tipoInstrutor,
      this.divisao.instrutor,
      totalBase,
    );

    const vAux: Record<string, number> = {};
    this.auxiliares.forEach((aux) => {
      const chave = `aux_${aux.id}`;
      const tipo  = this.divisao[`tipo_${chave}`] || 'PERCENTUAL';
      const val   = this.divisao[chave] || 0;
      vAux[chave] = this._valorMembro(tipo, val, totalBase);
    });

    // Distribui uniformemente entre os procedimentos
    this.procedimentos.forEach((proc) => {
      proc.valorCirurgiao = this._round(vCirurgiao / qtd);
      proc.valorInstrutor = this._round(vInstrutor / qtd);
      this.auxiliares.forEach((aux) => {
        proc.auxiliares[`aux_${aux.id}`] = this._round(
          (vAux[`aux_${aux.id}`] || 0) / qtd,
        );
      });
      this._recalcularTotalItem(proc);
    });

    this.atualizarTotais();
  }

  // ── Procedimentos ─────────────────────────────────────────

  /** Chamado ao editar manualmente um valor na tabela — sem redistribuir divisão. */
  onValorChange(item: Procedimento): void {
    this._recalcularTotalItem(item);
    this.atualizarTotais();
  }

  private _recalcularTotalItem(item: Procedimento): void {
    const auxTotal = this.auxiliares
      .filter((a) => a.ativo)
      .reduce((sum, aux) => sum + (item.auxiliares[`aux_${aux.id}`] || 0), 0);

    item.total = this._round(
      (item.valorCirurgiao || 0) + auxTotal + (item.valorInstrutor || 0),
    );
  }

  /** Soma dos valores brutos atuais — base para cálculo percentual. */
  private _calcularTotalBase(): number {
    return this.procedimentos.reduce((sum, proc) => {
      const auxSum = Object.values(proc.auxiliares).reduce(
        (a, v) => a + (v || 0),
        0,
      );
      return sum + (proc.valorCirurgiao || 0) + auxSum + (proc.valorInstrutor || 0);
    }, 0);
  }

  // ── Totais ────────────────────────────────────────────────

  atualizarTotais(): void {
    let totalCirurgiao = 0;
    let totalInstrutor = 0;
    let totalGeral     = 0;
    const totalAuxiliares: Record<string, number> = {};

    this.auxiliares.forEach((aux) => {
      totalAuxiliares[`aux_${aux.id}`] = 0;
    });

    this.procedimentos.forEach((proc) => {
      totalCirurgiao += proc.valorCirurgiao || 0;
      totalInstrutor += proc.valorInstrutor || 0;
      totalGeral     += proc.total          || 0;

      this.auxiliares
        .filter((a) => a.ativo)
        .forEach((aux) => {
          const chave = `aux_${aux.id}`;
          totalAuxiliares[chave] =
            (totalAuxiliares[chave] || 0) + (proc.auxiliares[chave] || 0);
        });
    });

    // Atualiza valorTotal em cada auxiliar (útil para exibição opcional)
    this.auxiliares.forEach((aux) => {
      aux.valorTotal = totalAuxiliares[`aux_${aux.id}`] || 0;
    });

    this.totais = {
      totalCirurgiao: this._round(totalCirurgiao),
      totalAuxiliares,
      totalInstrutor: this._round(totalInstrutor),
      totalGeral:     this._round(totalGeral),
    };
  }

  calcularTotal(item: Procedimento): number {
    const auxTotal = this.auxiliares
      .filter((a) => a.ativo)
      .reduce((sum, aux) => sum + (item.auxiliares[`aux_${aux.id}`] || 0), 0);
    return this._round(
      (item.valorCirurgiao || 0) + auxTotal + (item.valorInstrutor || 0),
    );
  }

  // ── Parcelas / Financeiro ─────────────────────────────────

  calcularValorParcela(): number {
    const base    = this.totais.totalGeral - (this.dadosFaturamento.sinal || 0);
    const parcelas = this.dadosFaturamento.parcelas || 1;
    return parcelas > 0 ? this._round(base / parcelas) : 0;
  }

  calcularTotalComImposto(): number {
    const imposto = this.dadosFaturamento.imposto || 0;
    return this._round(this.totais.totalGeral * (imposto / 100));
  }

  calcularValorLiquido(): number {
    return this._round(this.totais.totalGeral - this.calcularTotalComImposto());
  }

  // ── Ações ─────────────────────────────────────────────────

  onCalcularGravar(): void {
    this.atualizarTotais();
    this.toast.success('Valores calculados com sucesso!');
  }

  onCalcular(): void {
    this.atualizarTotais();
    this.toast.info('Valores recalculados');
  }

  onEmitirGuia(): void {
    this.emitirGuia.emit();
  }

  onAvancar(): void {
    if (!this.dadosFaturamento.numeroGuia) {
      this.toast.warning('Informe o número da guia');
      return;
    }

    const dados = {
      guia: this.dadosFaturamento.numeroGuia,
      valores: {
        procedimentos: this.procedimentos,
        totais:        this.totais,
        faturamento:   this.dadosFaturamento,
        auxiliares:    this.auxiliares.filter((a) => a.ativo && a.nome),
        divisao:       this.divisao,
      },
    };

    this.avancar.emit(dados);
  }

  // ── Utilitários ───────────────────────────────────────────

  formatarMoeda(valor: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor || 0);
  }

  private _valorMembro(
    tipo: 'PERCENTUAL' | 'VALOR',
    valor: number,
    totalBase: number,
  ): number {
    if (!valor || valor <= 0) return 0;
    return tipo === 'PERCENTUAL' ? (totalBase * valor) / 100 : valor;
  }

  private _round(valor: number): number {
    return Math.round((valor + Number.EPSILON) * 100) / 100;
  }
}
