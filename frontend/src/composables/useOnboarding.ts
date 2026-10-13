import { ref, computed } from "vue";

export interface OnboardingStep {
  target: string;
  content: string;
  position?: "top" | "bottom" | "left" | "right";
}

export interface OnboardingState {
  isActive: boolean;
  currentStep: number;
  completed: boolean;
}

const STORAGE_KEY = "onboarding-completed";

const steps: OnboardingStep[] = [
  { target: ".nav-dashboard", content: "Seu painel financeiro com visão geral de saldos, gráficos e resumo mensal." },
  { target: ".nav-accounts", content: "Gerencie suas contas bancárias, cartões de crédito e investimentos." },
  { target: ".nav-transactions", content: "Registre e visualize todas as suas transações: gastos, receitas e transferências." },
  { target: ".btn-new-transaction", content: "Crie novas transações rapidamente clicando neste botão." },
];

const state = ref<OnboardingState>({
  isActive: false,
  currentStep: 0,
  completed: false,
});

function getInitialCompleted(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_KEY) === "true";
}

function markCompleted() {
  state.value.completed = true;
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, "true");
  }
}

function start() {
  if (getInitialCompleted()) return;
  state.value.isActive = true;
  state.value.currentStep = 0;
  state.value.completed = false;
}

function next() {
  if (state.value.currentStep < steps.length - 1) {
    state.value.currentStep++;
  } else {
    finish();
  }
}

function skip() {
  state.value.isActive = false;
  markCompleted();
}

function finish() {
  state.value.isActive = false;
  markCompleted();
}

function goToStep(index: number) {
  if (index >= 0 && index < steps.length) {
    state.value.currentStep = index;
  }
}

export function useOnboarding() {
  const isActive = computed(() => state.value.isActive && !state.value.completed);
  const currentStep = computed(() => state.value.currentStep);
  const currentStepData = computed(() => steps[state.value.currentStep]);
  const totalSteps = computed(() => steps.length);
  const progress = computed(() => ((state.value.currentStep + 1) / steps.length) * 100);
  const isLastStep = computed(() => state.value.currentStep === steps.length - 1);

  return {
    steps,
    isActive,
    currentStep,
    currentStepData,
    totalSteps,
    progress,
    isLastStep,
    start,
    next,
    skip,
    finish,
    goToStep,
    markCompleted,
    getInitialCompleted,
  };
}