// core/models/pedido/card-data.types.ts

import { PedidoDto } from './pedido.dto';
import { ChecklistItem } from '../checklist/checklist.types';
import { FasePedido } from './pedido.types';

export interface CardData {
  titulo: string;
  descricao: string;
  prioridade: string;
  prioridadeClasse: string;
  badgeTexto: string;
  badgeClasseCor: string;
  urlImagem: string;
  dataCriacao: string;

  pedido: PedidoDto;
  checklist?: ChecklistItem[];
  timelineFases?: FasePedido[];

}
