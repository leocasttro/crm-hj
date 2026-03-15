import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PedidoDto } from '@models/pedido';
import { environment } from '@env/environment';

export interface AnalisarPedidoRequest {
  aprovado: boolean;
  observacao?: string;
  motivoRejeicao?: string;
}

export interface AtualizarStatusResponse {
  sucesso: boolean;
  mensagem: string;
  pedido: PedidoDto;
}

export interface AgendamentoRequest {
  dataAgendamento: string; // LocalDateTime
  observacao?: string;
}

// Interfaces para o checklist
export interface UploadArquivoResponse {
  sucesso: boolean;
  mensagem: string;
  arquivoId?: string;
  url?: string;
  nomeArquivo?: string;
}

export interface ArquivoInfoResponse {
  url: string;
  nomeArquivo: string;
  contentType: string;
  tamanho: number;
}

export interface SalvarDadosAutorizacaoRequest {
  statusAutorizacao: string | null;
  numeroGuia?: string | null;
  senhaAutorizacao?: string | null;
  validadeAutorizacao?: string | null; // Formato: YYYY-MM-DD
  tipoAcomodacao?: string | null;
}

export interface UpdateResponse {
  sucesso: boolean;
  mensagem: string;
  alteracoes?: string[];
  pedido?: PedidoDto;
  erros?: string[];
}

@Injectable({ providedIn: 'root' })
export class PedidoService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/pedidos`;

  // ==================== MÉTODOS EXISTENTES ====================

  listar(): Observable<PedidoDto[]> {
    return this.http.get<PedidoDto[]>(this.baseUrl);
  }

  buscarPorId(id: string): Observable<PedidoDto> {
    return this.http.get<PedidoDto>(`${this.baseUrl}/${id}`);
  }

  importarPdf(arquivo: File): Observable<any> {
    const formData = new FormData();
    formData.append('pdf', arquivo);
    return this.http.post(`${this.baseUrl}/importar-pdf`, formData);
  }

  atualizarPedido(id: string, dados: any): Observable<any> {
    console.log('🔧 Service - atualizarPedido chamado com ID:', id);
    return this.http.put(`${this.baseUrl}/${id}`, dados);
  }

  iniciarAnalise(id: string): Observable<PedidoDto> {
    console.log('🔧 Service - iniciarAnalise chamado com ID:', id);
    return this.http.post<PedidoDto>(
      `${this.baseUrl}/${id}/analise/iniciar`,
      {},
    );
  }

  analisarPedido(
    id: string,
    request: AnalisarPedidoRequest,
  ): Observable<AtualizarStatusResponse> {
    console.log(
      '🔧 Service - analisarPedido chamado com ID:',
      id,
      'Request:',
      request,
    );
    return this.http.post<AtualizarStatusResponse>(
      `${this.baseUrl}/${id}/analise`,
      request,
    );
  }

  atualizarStatus(
    id: string,
    status: string,
    observacao?: string,
  ): Observable<AtualizarStatusResponse> {
    return this.http.patch<AtualizarStatusResponse>(
      `${this.baseUrl}/${id}/status`,
      {
        status: status,
        observacao: observacao,
      },
    );
  }

  agendarPedido(
    pedidoId: string,
    dadosAgendamento: AgendamentoRequest,
  ): Observable<PedidoDto> {
    return this.http.post<PedidoDto>(
      `${this.baseUrl}/${pedidoId}/agendar`,
      dadosAgendamento,
    );
  }

  reprovarPedido(
    id: string,
    motivo: string,
    observacao?: string,
  ): Observable<AtualizarStatusResponse> {
    return this.analisarPedido(id, {
      aprovado: false,
      observacao: observacao || 'Pedido reprovado',
      motivoRejeicao: motivo,
    });
  }

  podeEditar(
    id: string,
  ): Observable<{ podeEditar: boolean; statusAtual: string }> {
    return this.http.get<{ podeEditar: boolean; statusAtual: string }>(
      `${this.baseUrl}/${id}/pode-editar`,
    );
  }

  // ==================== NOVOS MÉTODOS PARA CHECKLIST ====================

  /**
   * Upload de arquivo para um item do checklist
   */
  uploadArquivoChecklist(
    formData: FormData,
  ): Observable<UploadArquivoResponse> {
    const pedidoId = formData.get('pedidoId') as string;
    return this.http.post<UploadArquivoResponse>(
      `${this.baseUrl}/${pedidoId}/arquivos`,
      formData,
    );
  }

  /**
   * Download de arquivo do checklist
   */
  downloadArquivoChecklist(pedidoId: string, itemId: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${pedidoId}/arquivos/${itemId}`, {
      responseType: 'blob',
    });
  }

  verificarArquivoExistente(
    pedidoId: string,
    checklistItemId: number,
  ): Observable<boolean> {
    return this.http.get<boolean>(
      `${this.baseUrl}/${pedidoId}/arquivos/checklist/${checklistItemId}/existe`,
    );
  }

  listarArquivosChecklist(pedidoId: string): Observable<ArquivoInfoResponse[]> {
    return this.http.get<ArquivoInfoResponse[]>(
      `${this.baseUrl}/${pedidoId}/arquivos/lista`,
    );
  }

  /**
   * Obter URL para download do arquivo
   */
  getUrlArquivoChecklist(
    pedidoId: string,
    itemId: number,
  ): Observable<ArquivoInfoResponse> {
    return this.http.get<ArquivoInfoResponse>(
      `${this.baseUrl}/${pedidoId}/arquivos/${itemId}/info`,
    );
  }

  /**
   * Deletar arquivo do checklist
   */
  deletarArquivoChecklist(pedidoId: string, itemId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}/${pedidoId}/arquivos/${itemId}`,
    );
  }

  /**
   * Atualizar observação de um item do checklist
   */
  atualizarObservacaoChecklist(
    pedidoId: string,
    itemId: number,
    observacao: string,
  ): Observable<void> {
    return this.http.patch<void>(
      `${this.baseUrl}/${pedidoId}/checklist/${itemId}`,
      { observacao },
    );
  }

  /**
   * Marcar item do checklist como concluído
   */
  concluirItemChecklist(pedidoId: string, itemId: number): Observable<void> {
    return this.http.patch<void>(
      `${this.baseUrl}/${pedidoId}/checklist/${itemId}/concluir`,
      {},
    );
  }

  /**
   * Abrir URL do arquivo em nova aba (download)
   */
  abrirArquivo(url: string): void {
    window.open(url, '_blank');
  }

  /**
   * Download do arquivo como blob
   */
  async downloadArquivoComoBlob(
    pedidoId: string,
    itemId: number,
    nomeArquivo: string,
  ): Promise<void> {
    try {
      const blob = await this.downloadArquivoChecklist(
        pedidoId,
        itemId,
      ).toPromise();
      if (blob) {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = nomeArquivo;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Erro ao baixar arquivo:', error);
      throw error;
    }
  }

  salvarDadosAutorizacao(
    pedidoId: string,
    dados: SalvarDadosAutorizacaoRequest,
  ): Observable<UpdateResponse> {
    console.log(
      '🔧 Service - salvarDadosAutorizacao chamado com ID:',
      pedidoId,
      'Dados:',
      dados,
    );
    return this.http.put<UpdateResponse>(
      `${this.baseUrl}/${pedidoId}/autorizacao`,
      dados,
    );
  }
}
