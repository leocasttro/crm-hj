import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { NgbCollapseModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faMinus, faTimeline } from '@fortawesome/free-solid-svg-icons';
import { CardDetalheComponent } from '../card-detalhe/card-detalhe-component';
import { CardData, PedidoDto } from '../../../core/models/pedido';
import { ChecklistItem } from '@core/models';
import { formatarDataHoraPtBr, formatarDataPtBr } from '@core/utils';

@Component({
  selector: 'app-card-component',
  standalone: true,
  imports: [CommonModule, NgClass, NgbCollapseModule, FontAwesomeModule],
  templateUrl: './card-component.html',
  styleUrls: ['./card-component.scss'],
})
export class CardComponent {
  @Input() data!: CardData;
  @Output() checklistItemSelected = new EventEmitter<ChecklistItem>();
  @Output() pedidoAtualizado = new EventEmitter<PedidoDto>();
  public isCollapsed = true;

  faMinus = faMinus;
  faTimeLine = faTimeline;

  formatarData = formatarDataPtBr;
  formatarDataHora = formatarDataHoraPtBr;

  constructor(private modalService: NgbModal) {}

  onItemClick(item: ChecklistItem): void {
    if (item.status === 'Pendente') {
      this.checklistItemSelected.emit(item);
    }
  }

  /**
   * Gera as fases da timeline com base nos dados REAIS do pedido
   */
  private getTimelineFases(): any[] {
    if (!this.data?.pedido) {
      return this.getFasesPadrao();
    }

    const pedido = this.data.pedido;
    const hoje = new Date().toISOString();

    // Mapeia o status atual para determinar quais fases estão concluídas
    const statusAtual = pedido.status?.toUpperCase() || 'RASCUNHO';

    // Mapa de status para fases concluídas
    const fasesConcluidas: Record<string, boolean> = {
      CRIADO: true, // Sempre true quando o pedido existe
      EM_ANALISE: statusAtual !== 'RASCUNHO' && statusAtual !== 'PENDENTE',
      RETORNO_PEDIDO: statusAtual === 'REJEITADO' || statusAtual === 'APROVADO',
      MARCACAO_CIRURGIA: statusAtual === 'AGENDAR', // ✅ Só AGENDAR fica aqui
      CONSULTA_PRE_OPERATORIA:
        statusAtual === 'AGENDADO' || // ✅ AGENDADO vai para consulta pré
        statusAtual === 'CONFIRMADO' ||
        statusAtual === 'EM_PROGRESSO' ||
        statusAtual === 'REALIZADO',
      FATURAMENTO:
        statusAtual === 'EM_PROGRESSO' || statusAtual === 'REALIZADO',
      POS_OPERATORIO:
        statusAtual === 'EM_PROGRESSO' || statusAtual === 'REALIZADO',
      FINALIZADO: statusAtual === 'REALIZADO' || statusAtual === 'CANCELADO',
    };

    // Extrai datas das observações quando possível
    const datasDasFases = this.extrairDatasDasObservacoes(
      pedido.observacoes || [],
    );

    return [
      {
        codigo: 'CRIADO',
        nome: 'Criado',
        data: pedido.criadoEm || datasDasFases['CRIADO'] || hoje,
        concluido: fasesConcluidas['CRIADO'],
      },
      {
        codigo: 'EM_ANALISE',
        nome: 'Em Análise',
        data:
          datasDasFases['EM_ANALISE'] ||
          (fasesConcluidas['EM_ANALISE'] ? pedido.atualizadoEm : undefined),
        concluido: fasesConcluidas['EM_ANALISE'],
      },
      {
        codigo: 'RETORNO_PEDIDO',
        nome: 'Retorno do Pedido',
        data:
          datasDasFases['RETORNO_PEDIDO'] ||
          (fasesConcluidas['RETORNO_PEDIDO'] ? pedido.atualizadoEm : undefined),
        concluido: fasesConcluidas['RETORNO_PEDIDO'],
      },
      {
        codigo: 'MARCACAO_CIRURGIA',
        nome: 'Marcação da Cirurgia',
        data:
          datasDasFases['MARCACAO_CIRURGIA'] ||
          (fasesConcluidas['MARCACAO_CIRURGIA']
            ? pedido.atualizadoEm
            : undefined),
        concluido: fasesConcluidas['MARCACAO_CIRURGIA'],
      },
      {
        codigo: 'CONSULTA_PRE_OPERATORIA',
        nome: 'Consulta Pré-Operatória',
        data:
          datasDasFases['CONSULTA_PRE_OPERATORIA'] ||
          (fasesConcluidas['CONSULTA_PRE_OPERATORIA']
            ? pedido.atualizadoEm
            : undefined),
        concluido: fasesConcluidas['CONSULTA_PRE_OPERATORIA'],
      },
      {
        codigo: 'FATURAMENTO',
        nome: 'Faturamento',
        data: datasDasFases['FATURAMENTO'],
        concluido: fasesConcluidas['FATURAMENTO'],
      },
      {
        codigo: 'POS_OPERATORIO',
        nome: 'Pós-Operatório',
        data:
          datasDasFases['POS_OPERATORIO'] ||
          (fasesConcluidas['POS_OPERATORIO'] ? pedido.atualizadoEm : undefined),
        concluido: fasesConcluidas['POS_OPERATORIO'],
      },
      {
        codigo: 'FINALIZADO',
        nome: 'Finalizado',
        data:
          datasDasFases['FINALIZADO'] ||
          (fasesConcluidas['FINALIZADO'] ? pedido.atualizadoEm : undefined),
        concluido: fasesConcluidas['FINALIZADO'],
      },
    ];
  }

  /**
   * Extrai datas das observações do pedido
   */
  private extrairDatasDasObservacoes(
    observacoes: string[],
  ): Record<string, string> {
    const datas: Record<string, string> = {};

    const palavrasChave: Record<string, string[]> = {
      CRIADO: ['criado', 'criação'],
      EM_ANALISE: ['EM_ANALISE', 'análise iniciada', 'análise'],
      RETORNO_PEDIDO: ['APROVADO', 'rejeitado', 'correção', 'aprovado'],
      MARCACAO_CIRURGIA: ['AGENDAR', 'agendamento', 'marcação'], // ✅ AGENDAR
      CONSULTA_PRE_OPERATORIA: [
        'AGENDADO', // ✅ AGENDADO
        'agendada',
        'consulta',
        'pré-operatória',
        'pré operatoria',
      ],
      FATURAMENTO: ['faturamento', 'faturado'],
      POS_OPERATORIO: ['EM_PROGRESSO', 'procedimento', 'cirurgia'],
      FINALIZADO: ['REALIZADO', 'finalizado', 'CANCELADO', 'cancelado'],
    };

    for (const obs of observacoes) {
      for (const [fase, palavras] of Object.entries(palavrasChave)) {
        if (!datas[fase]) {
          const encontrou = palavras.some((palavra) =>
            obs.toLowerCase().includes(palavra.toLowerCase()),
          );

          if (encontrou) {
            const match = obs.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})/);
            if (match) {
              datas[fase] = match[1];
            }
          }
        }
      }
    }

    return datas;
  }

  /**
   * Retorna fases padrão quando não há dados do pedido
   */
  private getFasesPadrao(): any[] {
    return [
      { codigo: 'CRIADO', nome: 'Criado', concluido: false },
      { codigo: 'EM_ANALISE', nome: 'Em Análise', concluido: false },
      { codigo: 'RETORNO_PEDIDO', nome: 'Retorno do Pedido', concluido: false },
      {
        codigo: 'MARCACAO_CIRURGIA',
        nome: 'Marcação da Cirurgia',
        concluido: false,
      },
      {
        codigo: 'CONSULTA_PRE_OPERATORIA',
        nome: 'Consulta Pré-Operatória',
        concluido: false,
      },
      { codigo: 'FATURAMENTO', nome: 'Faturamento', concluido: false },
      { codigo: 'POS_OPERATORIO', nome: 'Pós-Operatório', concluido: false },
      { codigo: 'FINALIZADO', nome: 'Finalizado', concluido: false },
    ];
  }

  abrirModalTimeline() {
    const modalRef = this.modalService.open(CardDetalheComponent, {
      centered: true,
      scrollable: true,
      size: 'xl',
    });

    // Passa as fases com datas REAIS
    modalRef.componentInstance.fases = this.getTimelineFases();
    modalRef.componentInstance.pedido = this.data.pedido;

    modalRef.result
      .then((resultado) => {
        if (resultado?.pedido) {
          console.log(
            '✅ Modal de timeline fechado com pedido atualizado:',
            resultado.pedido,
          );
          this.pedidoAtualizado.emit(resultado.pedido);
        }
      })
      .catch((erro) => {
        if (erro && erro !== 'Cross click' && erro !== 'cancel') {
          console.log('❌ Modal fechado com erro:', erro);
        }
      });
  }

  public gerarIdUnico(titulo: string): string {
    return 'cardID-' + titulo.replace(/\s+/g, '');
  }
}
