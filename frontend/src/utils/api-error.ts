/**
 * Erros de rede chegarão como `error.response === undefined` (axios não recebeu
 * nada do servidor). A mensagem padrão do axios — "Network Error" — não ajuda
 * ninguém a resolver o problema, então traduzimos para algo acionável.
 */
export function friendlyApiError(error: unknown, fallback: string): string {
  const err = error as {
    response?: { data?: { error?: string; message?: string } };
    code?: string;
    message?: string;
  } | null;

  // O servidor respondeu: mostra o que ele disse.
  if (err?.response) {
    return err.response.data?.error || err.response.data?.message || fallback;
  }

  // Nenhuma resposta: servidor fora do ar, porta errada ou CORS bloqueado.
  if (err?.code === "ERR_NETWORK" || /network error/i.test(err?.message || "")) {
    return "Não foi possível conectar ao servidor. Confira se o backend está rodando na porta 3001.";
  }

  return err?.message || fallback;
}