import { PedidoDto } from './pedido.dto';
import { ChecklistItem } from '../component/card-detalhe/card-detalhe-component';

export interface CardData {
  titulo: string;
  descricao: string;
  prioridade: string;
  prioridadeClasse: string;

  badgeTexto: string;
  badgeClasseCor: string;
  urlImagem: string;
  dataCriacao: string;

  // ✅ agora tudo vem do backend
  pedido: PedidoDto;

  // ✅ enquanto não tem backend pra isso, deixa opcional
  checklist?: ChecklistItem[];
  timelineFases?: any[];
}
