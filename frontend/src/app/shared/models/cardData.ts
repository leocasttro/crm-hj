import { ChecklistItem } from "../component/card-detalhe/card-detalhe-component";
import { FasePedido } from "../types/fase-pedido";
import { Pedido } from "./pedido";

export interface CardData {
  // 🔹 Dados visuais do card
  titulo: string;
  descricao: string;
  badgeTexto: string;
  badgeClasseCor: string;
  urlImagem: string;
  dataCriacao: string;

  // 🔹 Checklist de documentos / tarefas
  checklist: ChecklistItem[];

  // 🔥 Pedido COMPLETO (formulário preenchido)
  pedido: Pedido;

  // 🔥 Timeline tipada (sem any)
  timelineFases: FasePedido[];
}
