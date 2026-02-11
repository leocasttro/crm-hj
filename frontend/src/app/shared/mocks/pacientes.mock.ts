import { Paciente } from '../models/paciente';

export const PACIENTES_MOCK: Paciente[] = [
  {
    id: 1,
    nomeCompleto: 'Maria da Silva',
    cpf: '123.456.789-00',
    telefone1: '(11) 99999-9999',
    telefone2: '(11) 98888-8888',
    email: 'maria.silva@email.com',
    dataNascimento: '1980-06-15',
    sexo: 'F',
    endereco: 'Rua das Flores, 123 - Centro - São Paulo/SP',
  },
  {
    id: 2,
    nomeCompleto: 'João Pereira',
    cpf: '987.654.321-00',
    telefone1: '(21) 97777-7777',
    email: 'joao.pereira@email.com',
    dataNascimento: '1975-03-22',
    sexo: 'M',
    endereco: 'Av. Atlântica, 500 - Rio de Janeiro/RJ',
  },
  {
    id: 3,
    nomeCompleto: 'Ana Costa',
    cpf: '456.789.123-00',
    telefone1: '(31) 96666-6666',
    email: 'ana.costa@email.com',
    dataNascimento: '1990-11-02',
    sexo: 'F',
    endereco: 'Rua da Serra, 89 - Belo Horizonte/MG',
  },
];
