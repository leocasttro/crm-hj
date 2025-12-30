import { Pedido } from '../models/pedido';

export const PEDIDO_MOCK: Pedido = {
  id: 1,

  // Resumo
  titulo: 'Artroplastia total de joelho direito',
  descricao: 'Paciente com artrose avançada, indicado procedimento cirúrgico.',

  // Dados pessoais
  nomeCompleto: 'Maria da Silva',
  dataNascimento: '1980-06-15',
  cpf: '123.456.789-00',
  sexo: 'F',

  // Contato
  endereco: 'Rua das Flores, 123 - Centro - São Paulo/SP',
  telefone1: '(11) 99999-9999',
  telefone2: '(11) 98888-8888',
  email: 'maria.silva@email.com',

  // Convênio
  convenio: 'Unimed',
  numeroCarteirinha: '987654321',
  validadeCarteirinha: '2026-12-31',

  // Dados médicos
  medicoSolicitante: 'Dr. João Pereira',
  crmMedico: 'CRM-SP 123456',
  procedimento: 'Artroplastia total de joelho direito',
  cid: 'M17.1',
  prioridade: 'ELETIVA',
  dataPedido: '2024-10-25',

  // Auditoria
  criadoPor: 'usuario.logado@hospital.com',
  documentos: {
    pedidoMedico: true,
    exames: true,
    documentoIdentidade: true,
    carteirinhaConvenio: true,
  }
};
