import { PacienteDto } from './paciente.dto';
import { PacienteForm, SexoCodigo, DocumentoTipo } from './paciente.types';

// Mapear DTO para Formulário
export function mapPacienteDtoToForm(dto: PacienteDto): PacienteForm {
  const telefones = dto.telefones?.split(',').map(t => t.trim()) || [];

  return {
    id: dto.id,
    primeiroNome: dto.primeiroNome,
    sobrenome: dto.sobrenome,
    dataNascimento: dto.dataNascimento,
    sexoCodigo: (dto.sexoCodigo as SexoCodigo) || 'O',
    documentoTipo: (dto.documentoTipo as DocumentoTipo) || 'OUTRO',
    documentoNumero: dto.documentoNumero,
    email: dto.email,
    telefonePrincipal: telefones[0] || '',
    telefoneSecundario: telefones[1],
    possuiWhatsApp: dto.possuiWhatsApp || false,
    logradouro: dto.logradouro || '',
    numero: dto.numero || '',
    complemento: dto.complemento,
    bairro: dto.bairro || '',
    cidade: dto.cidade || '',
    estado: dto.estado || '',
    cep: dto.cep || '',
    pais: dto.pais,
    observacoes: ''
  };
}

// Mapear Formulário para DTO (para enviar ao backend)
export function mapFormToPacienteDto(form: PacienteForm): Partial<PacienteDto> {
  return {
    primeiroNome: form.primeiroNome,
    sobrenome: form.sobrenome,
    nomeCompleto: `${form.primeiroNome} ${form.sobrenome}`,
    documentoTipo: form.documentoTipo,
    documentoNumero: form.documentoNumero,
    email: form.email,
    telefones: [form.telefonePrincipal, form.telefoneSecundario]
      .filter(Boolean)
      .join(', '),
    dataNascimento: form.dataNascimento,
    sexoCodigo: form.sexoCodigo,
    logradouro: form.logradouro,
    numero: form.numero,
    complemento: form.complemento,
    bairro: form.bairro,
    cidade: form.cidade,
    estado: form.estado,
    cep: form.cep,
    pais: form.pais,
    possuiWhatsApp: form.possuiWhatsApp,
    ativo: true
  };
}

// Extrair telefone principal
export function getTelefonePrincipal(dto: PacienteDto): string {
  return dto.telefones?.split(',').map(t => t.trim())[0] || '';
}

// Formatar endereço completo
export function getEnderecoCompleto(dto: PacienteDto): string {
  const partes = [
    dto.logradouro,
    dto.numero,
    dto.complemento,
    dto.bairro,
    dto.cidade,
    dto.estado,
    dto.cep
  ].filter(Boolean);

  return partes.join(', ');
}

// Verificar se é maior de idade
export function isMaiorDeIdade(dto: PacienteDto): boolean {
  if (dto.maiorDeIdade !== undefined) return dto.maiorDeIdade;

  const idade = calcularIdade(dto.dataNascimento);
  return idade >= 18;
}

// Calcular idade
export function calcularIdade(dataNascimento: string): number {
  const hoje = new Date();
  const nascimento = new Date(dataNascimento);
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const mes = hoje.getMonth() - nascimento.getMonth();

  if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
    idade--;
  }
  return idade;
}
