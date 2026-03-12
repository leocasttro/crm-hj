import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CodigoFase, FasePedido } from '@core/models';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faArrowLeft,
  faArrowRight,
  faCalendarCheck,
  faCheck,
  faCheckCircle,
  faCoins,
  faExclamationTriangle,
  faFileMedical,
  faHeartPulse,
  faSearch,
  faClock,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-timeline',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './timeline.html',
  styleUrl: './timeline.scss',
})
export class Timeline {
  @Input() fases: FasePedido[] = [];
  @Input() faseAtual: CodigoFase = 'CRIADO';
  @Input() podeAvancarFase: boolean = false;
  @Output() faseChange = new EventEmitter<CodigoFase>();

  faCheck = faCheck;
  faArrowRight = faArrowRight;
  faFileMedical = faFileMedical;
  faSpinner = faSpinner;
  faSearch = faSearch;
  faArrowReturnLeft = faArrowLeft;
  faCalendarCheck = faCalendarCheck;
  faHeartPulse = faHeartPulse;
  faCashCoin = faCoins;
  faActivity = faClock;
  faCheckCircle = faCheckCircle;
  faExclamationTriangle = faExclamationTriangle;

  private iconesFase: Record<CodigoFase, any> = {
    CRIADO: faFileMedical,
    EM_ANALISE: faSearch,
    RETORNO_PEDIDO: faArrowLeft,
    MARCACAO_CIRURGIA: faCalendarCheck,
    CONSULTA_PRE_OPERATORIA: faHeartPulse,
    FATURAMENTO: faCoins,
    POS_OPERATORIO: faClock,
    FINALIZADO: faCheckCircle,
  };

  getFaseAtualIndex(): number {
    return this.fases.findIndex((f) => f.codigo === this.faseAtual);
  }

  getProximaFaseIndex(): number {
    const indexAtual = this.getFaseAtualIndex();
    return indexAtual >= 0 && indexAtual < this.fases.length - 1
      ? indexAtual + 1
      : -1;
  }

  getFaseIcon(codigo: CodigoFase): any {
    return this.iconesFase[codigo] || faFileMedical;
  }

  formatarData(data: string | Date | undefined): string {
    if (!data) return '';
    const dataObj = typeof data === 'string' ? new Date(data) : data;
    return dataObj.toLocaleDateString('pt-BR');
  }

  isFaseConcluida(fase: FasePedido): boolean {
    return fase.concluido === true;
  }

  isFaseAtual(fase: FasePedido): boolean {
    return fase.codigo === this.faseAtual;
  }

  isProximaFase(fase: FasePedido): boolean {
    const proximaIndex = this.getProximaFaseIndex();
    return (
      proximaIndex >= 0 && this.fases[proximaIndex]?.codigo === fase.codigo
    );
  }

  getFaseStatusClass(fase: FasePedido, index: number): string {
    if (this.isFaseConcluida(fase)) {
      return 'bg-success';
    }
    if (this.isFaseAtual(fase)) {
      return this.podeAvancarFase ? 'bg-primary' : 'bg-warning';
    }
    if (this.isProximaFase(fase) && this.podeAvancarFase) {
      return 'bg-secondary';
    }
    return 'bg-secondary';
  }

  getFaseIconClass(fase: FasePedido, index: number): any {
    if (this.isFaseConcluida(fase)) {
      return faCheck;
    }
    if (this.isFaseAtual(fase)) {
      return this.podeAvancarFase ? faArrowRight : faExclamationTriangle;
    }
    if (this.isProximaFase(fase) && this.podeAvancarFase) {
      return faSpinner;
    }
    return null;
  }

  getStatusText(fase: FasePedido, index: number): string {
    if (this.isFaseConcluida(fase)) {
      return 'Concluído';
    }
    if (this.isFaseAtual(fase)) {
      return this.podeAvancarFase ? 'Atual' : 'Aguardando documentos';
    }
    if (this.isProximaFase(fase) && this.podeAvancarFase) {
      return 'Próximo';
    }
    return '';
  }

  deveMostrarBadge(fase: FasePedido, index: number): boolean {
    return (
      !fase.concluido && (
        this.isFaseAtual(fase) ||
        (this.isProximaFase(fase) && this.podeAvancarFase)
      )
    );
  }

  getBadgeClass(fase: FasePedido, index: number): string {
    if (this.isFaseAtual(fase)) {
      return this.podeAvancarFase ? 'bg-primary' : 'bg-warning';
    }
    if (this.isProximaFase(fase) && this.podeAvancarFase) {
      return 'bg-secondary';
    }
    return 'bg-secondary';
  }

  trackByCodigo(index: number, fase: FasePedido): string {
    return fase.codigo;
  }
}
