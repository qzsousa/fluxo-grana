/**
 * Catálogo dos tipos de lançamento, escrito para quem não é contador.
 *
 * Fica fora do componente porque é usado por três lugares: o seletor do
 * formulário, o modal rápido da listagem e o detalhe. Uma única fonte evita
 * que a explicação mude de uma tela para outra.
 */

export interface TransactionTypeInfo {
  value: string;
  label: string;
  icon: string;
  iconBg: string;
  /** Frase de uma linha, dentro do cartão do seletor. */
  hint: string;
  /** Explicação completa, mostrada quando o tipo está escolhido. */
  explain: string;
}

export const TRANSACTION_TYPE_GROUPS: { title: string; types: TransactionTypeInfo[] }[] = [
  {
    title: "Dia a dia",
    types: [
      {
        value: "EXPENSE",
        label: "Despesa",
        icon: "arrowDown",
        iconBg: "bg-[var(--color-danger-light)] text-[var(--color-danger)]",
        hint: "Dinheiro que sai",
        explain:
          "Algo que você pagou: mercado, aluguel, conta de luz. O saldo da conta diminui pelo valor informado.",
      },
      {
        value: "INCOME",
        label: "Receita",
        icon: "arrowUp",
        iconBg: "bg-[var(--color-success-light)] text-[var(--color-success)]",
        hint: "Dinheiro que entra",
        explain:
          "Algo que entrou sem ser transferência: salário, freela, venda. O saldo da conta aumenta pelo valor informado.",
      },
      {
        value: "TRANSFER",
        label: "Transferência",
        icon: "arrows",
        iconBg: "bg-[var(--color-info-light)] text-[var(--color-info)]",
        hint: "Sai de uma conta e entra em outra",
        explain:
          "O dinheiro não entrou nem saiu do seu bolso, só mudou de lugar: da corrente para a poupança, ou para pagar a fatura do cartão. O saldo total continua igual. Precisa escolher as duas contas.",
      },
    ],
  },
  {
    title: "Só se você investe",
    types: [
      {
        value: "INVESTMENT_BUY",
        label: "Compra de investimento",
        icon: "trending",
        iconBg: "bg-[var(--color-bg-muted)] text-[var(--color-fg-muted)]",
        hint: "Ações, fundo, cripto",
        explain:
          "Você comprou um ativo com dinheiro seu. Sai da conta de origem e vira um investimento registrado.",
      },
      {
        value: "INVESTMENT_SELL",
        label: "Venda de investimento",
        icon: "arrowDownCircle",
        iconBg: "bg-[var(--color-bg-muted)] text-[var(--color-fg-muted)]",
        hint: "Resgate ou venda",
        explain: "O contrário da compra: o ativo sai e o dinheiro volta para a conta de destino.",
      },
      {
        value: "DIVIDEND",
        label: "Dividendo",
        icon: "gift",
        iconBg: "bg-[var(--color-bg-muted)] text-[var(--color-fg-muted)]",
        hint: "Parte do lucro da empresa",
        explain:
          "Renda passiva recebida de ações ou fundos. Entra como receita, mas fica separado para você acompanhar.",
      },
      {
        value: "INTEREST",
        label: "Juros",
        icon: "calendar",
        iconBg: "bg-[var(--color-bg-muted)] text-[var(--color-fg-muted)]",
        hint: "Rendimento da conta",
        explain:
          "Juros que o banco pagou sobre o seu dinheiro parado. É entrada, mas de origem diferente do salário.",
      },
      {
        value: "FEE",
        label: "Taxa",
        icon: "fileText",
        iconBg: "bg-[var(--color-bg-muted)] text-[var(--color-fg-muted)]",
        hint: "Tarifa do banco",
        explain: "Cobrança do banco ou da corretora: taxa de manutenção, tarifa de saque. Sai como despesa.",
      },
    ],
  },
];

export const ALL_TRANSACTION_TYPES: TransactionTypeInfo[] =
  TRANSACTION_TYPE_GROUPS.flatMap((group) => group.types);

export function transactionTypeInfo(value: string | undefined | null): TransactionTypeInfo | undefined {
  if (!value) return undefined;
  return ALL_TRANSACTION_TYPES.find((type) => type.value === value);
}

/** Rótulo curto e humano. Cai no próprio valor se o tipo for desconhecido. */
export function typeLabel(value: string | undefined | null): string {
  return transactionTypeInfo(value)?.label ?? value ?? "—";
}

/** Frase curta para linhas de lista e tabelas. */
export function typeHint(value: string | undefined | null): string {
  return transactionTypeInfo(value)?.hint ?? "";
}