import { ref, computed } from "vue";

export interface OnboardingStep {
  /** Seletor CSS do elemento a destacar. `null` = passo central (modal). */
  target: string | null;
  title: string;
  content: string;
  /** Posição do balão em relação ao elemento. */
  placement: "top" | "right" | "bottom" | "left";
  /** Ícone grande do passo — o tour precisa ser visual, não um texto solto. */
  icon?: string;
}

const STORAGE_KEY = "onboarding-completed";

/**
 * Textos escritos como quem explica para alguém que nunca usou o app: o que é,
 * para que serve e o que acontece ao clicar. Nada de nome interno de banco.
 */
const steps: OnboardingStep[] = [
  {
    target: null,
    placement: "bottom",
    icon: "lightbulb",
    title: "Bem-vindo ao FluxoGrana",
    content:
      "Em uns 2 minutos você entende o básico. Vamos passar pelos botões mais importantes um por um. Pode pular quando quiser e rever depois em Configurações → Rever tutorial.",
  },
  {
    target: '[data-tour="new-transaction"]',
    placement: "top",
    icon: "plus",
    title: "Comece por aqui: anotar um gasto",
    content:
      "Este botão central abre o formulário de lançamento. É o que você mais vai usar: mercado, salário, conta de luz. O saldo se atualiza na hora.",
  },
  {
    target: '[data-tour="accounts"]',
    placement: "right",
    icon: "wallet",
    title: "Contas: onde o dinheiro fica",
    content:
      "Cadastre cada conta, carteira ou cartão aqui. O saldo que aparece no topo do Início é a soma de todas elas — quanto mais separadas, mais preciso fica o resultado. Para cartão, informe dia de fechamento e vencimento para o app montar as faturas.",
  },
  {
    target: '[data-tour="invoices"]',
    placement: "right",
    icon: "receipt",
    title: "Faturas do cartão",
    content:
      "As compras feitas no cartão se agrupam sozinhas em faturas pelo período de fechamento. Aqui você vê quanto vence, quando vence e paga com um clique. O sino no topo avisa antes do vencimento.",
  },
  {
    target: '[data-tour="transactions"]',
    placement: "right",
    icon: "arrows",
    title: "Transações: seu histórico",
    content:
      "Tudo que você lançou aparece aqui, do mais recente para o mais antigo. A linha tem um botão de pagar quando é compra de cartão — dá para quitar sem abrir a fatura.",
  },
  {
    target: '[data-tour="notes"]',
    placement: "top",
    icon: "sticky",
    title: "Lembretes",
    content:
      "Um espaço só seu, lá no fim da tela. Escreva o que não quer esquecer. Não entra no saldo nem nos relatórios. Se preferir algo sem o visual de papel, dá para mudar em Configurações → Aparência.",
  },
  {
    target: '[data-tour="theme"]',
    placement: "bottom",
    icon: "palette",
    title: "Do seu jeito",
    content:
      "O sino ao lado traz os avisos de fatura. Este botão alterna tema claro, escuro ou automático. A cor de destaque, a densidade e o tamanho do texto ficam em Configurações → Aparência — o nome FluxoGrana acompanha a cor que você escolher.",
  },
];

const isActive = ref(false);
const currentIndex = ref(0);

const isCompleted = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
};

const currentStep = computed<OnboardingStep | null>(() =>
  isActive.value ? steps[currentIndex.value] ?? null : null
);

const progress = computed(() => currentIndex.value + 1);
const totalSteps = steps.length;
const isFirst = computed(() => currentIndex.value === 0);
const isLast = computed(() => currentIndex.value === steps.length - 1);

/** Inicia o tour. `force` ignora o "já visto" salvo no localStorage. */
function start(force = false) {
  if (!force && isCompleted()) return;
  currentIndex.value = 0;
  isActive.value = true;
}

function next() {
  if (isLast.value) {
    finish();
    return;
  }
  currentIndex.value += 1;
}

function previous() {
  if (!isFirst.value) currentIndex.value -= 1;
}

function finish() {
  isActive.value = false;
  try {
    localStorage.setItem(STORAGE_KEY, "true");
  } catch {
    // Modo privado: o tour só repete nesta sessão.
  }
}

function skip() {
  isActive.value = false;
  try {
    localStorage.setItem(STORAGE_KEY, "true");
  } catch {
    // Idem.
  }
}

/** Reinicia o tour — usado em Configurações → "Rever tutorial". */
function restart() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Idem.
  }
  start(true);
}

export function useOnboarding() {
  return {
    steps,
    isActive,
    currentStep,
    currentIndex,
    totalSteps,
    progress,
    isFirst,
    isLast,
    isCompleted,
    start,
    next,
    previous,
    finish,
    skip,
    restart,
  };
}