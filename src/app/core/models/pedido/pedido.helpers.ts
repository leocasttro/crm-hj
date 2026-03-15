import { Observable } from 'rxjs';
import { ChecklistItem } from '../checklist';
import { CardData } from './card-data.types';
import { PedidoDto } from './pedido.dto';
import { FasePedido } from './pedido.types';

export function getProcedimentoPrincipal(pedido: PedidoDto): string {
  return (
    pedido.procedimentoDescricao ||
    pedido.procedimento ||
    'Procedimento não informado'
  );
}

export function getNomePaciente(pedido: PedidoDto): string {
  return (
    pedido.paciente?.nomeCompleto ||
    pedido.nomePaciente ||
    'Paciente não informado'
  );
}

export function getCrmMedico(pedido: PedidoDto): string {
  return (
    pedido.medicoSolicitante ||
    pedido.medicoSolicitanteCrm ||
    pedido.crmCompleto ||
    'CRM não informado'
  );
}

export function formatarDataPedido(pedido: PedidoDto): string {
  if (!pedido.dataPedido) return 'Data não informada';

  const data = new Date(pedido.dataPedido);
  return data.toLocaleDateString('pt-BR');
}

export function formatarPrioridade(prioridade: string): string {
  const mapa: Record<string, string> = {
    ELETIVA: 'Eletiva',
    URGENCIA: 'Urgência',
    PRIORIDADE: 'Prioridade',
  };
  return mapa[prioridade] || prioridade;
}

export function calcularIdadePaciente(pedido: PedidoDto): number | null {
  if (!pedido.paciente?.dataNascimento) return null;

  const hoje = new Date();
  const nascimento = new Date(pedido.paciente.dataNascimento);
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const mes = hoje.getMonth() - nascimento.getMonth();

  if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
    idade--;
  }
  return idade;
}

export function isPedidoUrgente(pedido: PedidoDto): boolean {
  return pedido.prioridade === 'URGENCIA';
}

export function podeEditar(pedido: PedidoDto): boolean {
  const statusEditaveis = ['RASCUNHO', 'PENDENTE', 'REJEITADO'];
  return statusEditaveis.includes(pedido.status);
}

export function getStatusClass(status: string): string {
  const classes: Record<string, string> = {
    RASCUNHO: 'bg-secondary',
    PENDENTE: 'bg-warning',
    EM_ANALISE: 'bg-info',
    REJEITADO: 'bg-danger',
    APROVADO: 'bg-success',
    AGENDAR: 'bg-primary',
    CONFIRMADO: 'bg-success',
    REALIZADO: 'bg-success',
    CANCELADO: 'bg-danger',
  };
  return classes[status] || 'bg-secondary';
}

export function getLabelStatus(status: string): string {
  const labels: Record<string, string> = {
    RASCUNHO: 'Rascunho',
    PENDENTE: 'Pendente',
    EM_ANALISE: 'Em Análise',
    REJEITADO: 'Rejeitado',
    APROVADO: 'Aprovado',
    AGENDAR: 'Agendar',
    AGENDADO: 'Agendado',
    AGUARDANDO_APROVACAO_AGENDAMENTO: 'Aguardando Aprovar',
    AGENDAMENTO_REPROVADO: 'Agendamento Reprovado',
    CONFIRMADO: 'Confirmado',
    EM_PROGRESSO: 'Em Progresso',
    REALIZADO: 'Realizado',
    CANCELADO: 'Cancelado',
  };
  return labels[status] ?? status;
}

export function getPrioridadeClasse(prioridade: string): string {
  const classes: Record<string, string> = {
    ELETIVA: 'bg-success',
    URGENCIA: 'bg-danger',
    PRIORIDADE: 'bg-warning',
  };
  return classes[prioridade] || 'bg-secondary';
}

export function getIconeStatus(status: string): string {
  const icones: Record<string, string> = {
    PENDENTE: 'bi-hourglass',
    EM_ANALISE: 'bi-search',
    APROVADO: 'bi-check-circle',
    REJEITADO: 'bi-x-circle',
    AGENDAR: 'bi-calendar-check',
    REALIZADO: 'bi-check-all',
  };
  return icones[status] || 'bi-question-circle';
}

// 🔵 Helper para criar CardData a partir de PedidoDto (CORRIGIDO)
export function mapPedidoToCardData(
  pedido: PedidoDto,
  checklist?: ChecklistItem[],
  timelineFases?: FasePedido[],
): CardData {
  return {
    titulo: getProcedimentoPrincipal(pedido), // ✅ Corrigido: passa pedido direto
    descricao: pedido.indicacaoClinica || '',
    prioridade: pedido.prioridade,
    prioridadeClasse: getPrioridadeClasse(pedido.prioridade),
    badgeTexto: getLabelStatus(pedido.status),
    badgeClasseCor: getStatusClass(pedido.status),
    urlImagem: '/assets/default-pedido.png',
    dataCriacao: pedido.criadoEm,
    pedido,
    checklist,
    timelineFases,
  };
}

// ==================== AÇÕES DO PEDIDO ====================

export interface AcaoPedidoResult {
  sucesso: boolean;
  pedido?: PedidoDto;
  mensagem?: string;
}

export async function executarAcaoPedido(
  acao: () => Observable<any>,
  loadingSetter: (loading: boolean) => void,
  toast: any,
  mensagemSucesso: string,
  mensagemErro: string,
): Promise<AcaoPedidoResult> {
  loadingSetter(true);

  return new Promise((resolve) => {
    acao().subscribe({
      next: (response) => {
        loadingSetter(false);
        toast.success(mensagemSucesso);
        resolve({
          sucesso: true,
          pedido: response.pedido || response,
        });
      },
      error: (err) => {
        loadingSetter(false);
        toast.error(mensagemErro);
        console.error(err);
        resolve({ sucesso: false, mensagem: mensagemErro });
      },
    });
  });
}

// ==================== VALIDAÇÕES DO PEDIDO ====================

export function validarAntesAcao(
  checklist: ChecklistItem[],
  faseAtual: string,
  acao: string,
): { valido: boolean; mensagem?: string } {
  const obrigatoriosPendentes = checklist.some(
    (item) => item.obrigatorio && item.status === 'Pendente',
  );

  if (obrigatoriosPendentes) {
    return {
      valido: false,
      mensagem: `Complete todos os documentos obrigatórios antes de ${acao}.`,
    };
  }

  return { valido: true };
}

// ==================== CONSTANTES ====================
export const LABELS_COLUNA: Record<string, string> = {
  PENDENTES: 'Pendentes',
  EM_ANDAMENTO: 'Em andamento',
  CONCLUIDAS: 'Concluídas',
};

// ==================== VISUAIS ====================
export function visualFromPrioridade(prioridade?: string) {
  const pr = (prioridade ?? '').toUpperCase();

  switch (pr) {
    case 'ELETIVA':
      return {
        texto: 'Eletiva',
        badge: 'bg-primary text-white',
        text: 'text-primary',
      };
    case 'URGENTE':
    case 'URGENCIA':
      return {
        texto: 'Urgente',
        badge: 'bg-danger text-white',
        text: 'text-danger',
      };
    case 'EMERGENCIA':
      return {
        texto: 'Emergência',
        badge: 'bg-danger text-white',
        text: 'text-danger',
      };
    default:
      return {
        texto: pr || 'Sem prioridade',
        badge: 'bg-warning text-dark',
        text: 'text-warning',
      };
  }
}

export function visualFromStatus(status: string, prioridade?: string) {
  if (isConcluido(status)) {
    return { badgeTexto: 'Finalizado', badgeClasseCor: 'bg-success' };
  }

  if (isEmAndamento(status)) {
    return { badgeTexto: 'Em Progresso', badgeClasseCor: 'bg-primary' };
  }

  const pr = (prioridade ?? '').toUpperCase();
  if (pr === 'URGENTE' || pr === 'URGENCIA' || pr === 'EMERGENCIA') {
    return { badgeTexto: 'Urgente', badgeClasseCor: 'bg-danger' };
  }

  return { badgeTexto: 'Criado', badgeClasseCor: 'bg-secondary' };
}

export function applyColumnVisual(card: CardData, colunaId: string): CardData {
  const novoCard = { ...card };

  if (colunaId === 'PENDENTES') {
    novoCard.badgeTexto = 'Criado';
    novoCard.badgeClasseCor = 'bg-secondary';
  } else if (colunaId === 'EM_ANDAMENTO') {
    novoCard.badgeTexto = 'Em Progresso';
    novoCard.badgeClasseCor = 'bg-primary';
  } else if (colunaId === 'CONCLUIDAS') {
    novoCard.badgeTexto = 'Finalizado';
    novoCard.badgeClasseCor = 'bg-success';
  }

  return novoCard;
}

// ==================== FORMATAÇÃO ====================
export function formatarNomeProprio(nome: string): string {
  if (!nome) return '';
  const siglas = ['CRM', 'RG', 'CPF', 'SUS', 'SIS'];

  return nome
    .toLowerCase()
    .split(' ')
    .map((palavra) => {
      if (siglas.includes(palavra.toUpperCase())) {
        return palavra.toUpperCase();
      }
      return palavra.charAt(0).toUpperCase() + palavra.slice(1);
    })
    .join(' ');
}

export function formatarConvenio(convenio: string): string {
  if (!convenio) return '';

  return convenio
    .toLowerCase()
    .split(' ')
    .map((palavra) => palavra.charAt(0).toUpperCase() + palavra.slice(1))
    .join(' ');
}

export function avatarFromName(nome: string): string {
  const letra = (nome?.trim()?.[0] ?? 'P').toUpperCase();
  return `https://placehold.co/24x24/0d6efd/FFFFFF?text=${encodeURIComponent(letra)}`;
}

// ==================== VALIDAÇÕES DE STATUS ====================
export function isEmAndamento(status: string): boolean {
  return [
    'EM_ANALISE',
    'APROVADO',
    'REJEITADO',
    'AGENDAR',
    'EM_ANDAMENTO',
    'AGUARDANDO_APROVACAO_AGENDAMENTO',
  ].includes(status);
}

export function isConcluido(status: string): boolean {
  return [
    'REALIZADO',
    'CANCELADO',
    'REJEITADO',
    'CONCLUIDO',
    'FINALIZADO',
  ].includes(status);
}
