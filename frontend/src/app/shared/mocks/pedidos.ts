import { PEDIDO_MOCK } from '../../shared/mocks/pedido.mock';
import { FASES_PEDIDO_MOCK } from '../../shared/mocks/fases-pedido.mock';
import { CardData } from '../models/cardData';

export const PEDIDO_CARD_MOCK: CardData = {
  titulo: PEDIDO_MOCK.titulo,
  descricao: PEDIDO_MOCK.descricao,
  badgeTexto: 'Criado',
  badgeClasseCor: 'bg-secondary',
  urlImagem: 'https://placehold.co/24x24/0d6efd/FFFFFF?text=C',
  dataCriacao: PEDIDO_MOCK.dataPedido,

  checklist: [
    { id: 1, titulo: 'Pedido médico anexado', status: 'Concluído' },
    { id: 2, titulo: 'Exames anexados', status: 'Concluído' },
    { id: 3, titulo: 'Documento de identidade', status: 'Pendente' },
    { id: 4, titulo: 'Carteirinha do convênio', status: 'Pendente' },
  ],

  // 🔥 ESSENCIAL PARA O DETALHE
  pedido: PEDIDO_MOCK,

  // 🔥 ESSENCIAL PARA A TIMELINE
  timelineFases: structuredClone(FASES_PEDIDO_MOCK),
};
