/**
 * Ícones e cores predefinidos para identificar uma despesa.
 *
 * Ficam aqui, e não no backend, porque são escolha de apresentação: mudar a
 * paleta amanhã não deve exigir migração nem reiniciar o servidor. O que a
 * despesa carrega de verdade é só o par `icon` + `color` escolhido.
 */

export interface ExpenseIcon {
  /** Chave em `AppIcon`. */
  id: string;
  label: string;
}

export interface ExpenseColor {
  id: string;
  label: string;
  /** Base sólida — usada no fundo do círculo. */
  solid: string;
  /** Versão clara para o fundo. */
  soft: string;
  /** Texto/ícone por cima do fundo claro. */
  ink: string;
}

/**
 * Cores pensadas para o app inteiro: mesmo conjunto semântico das variáveis
 * (brand, success, danger, warning, info) mais alguns neutros. Todas passam
 * em contraste contra o fundo claro e escuro.
 */
export const EXPENSE_COLORS: ExpenseColor[] = [
  { id: "brand", label: "Marca", solid: "#0e6e63", soft: "#e2f0ee", ink: "#0a564e" },
  { id: "success", label: "Verde", solid: "#12733c", soft: "#e6f4ec", ink: "#0d5a2f" },
  { id: "danger", label: "Vermelho", solid: "#b93428", soft: "#fceae8", ink: "#92271d" },
  { id: "warning", label: "Âmbar", solid: "#a15c07", soft: "#fdf2e0", ink: "#7d4605" },
  { id: "info", label: "Azul", solid: "#1a5cbb", soft: "#e8f0fd", ink: "#144a99" },
  { id: "violet", label: "Violeta", solid: "#6d28d9", soft: "#f1e9fe", ink: "#5b21b6" },
  { id: "pink", label: "Rosa", solid: "#be185d", soft: "#fce7f0", ink: "#9d174d" },
  { id: "amber", label: "Laranja", solid: "#c2410c", soft: "#fdeee4", ink: "#9a3412" },
  { id: "teal", label: "Ciano", solid: "#0e7490", soft: "#e0f4f8", ink: "#0b5c74" },
  { id: "olive", label: "Oliva", solid: "#4d7c0f", soft: "#eef6dd", ink: "#3f640c" },
  { id: "slate", label: "Cinza", solid: "#475569", soft: "#eef1f5", ink: "#3a4757" },
  { id: "sand", label: "Areia", solid: "#92610a", soft: "#f9efdd", ink: "#754d07" },
];

/** Cores de post-it para os lembretes da tela inicial. */
export const NOTE_COLORS: ExpenseColor[] = [
  { id: "yellow", label: "Amarelo", solid: "#F2C94C", soft: "#FEF3C7", ink: "#78350F" },
  { id: "peach", label: "Pêssego", solid: "#F2994A", soft: "#FDEBD8", ink: "#7C3D10" },
  { id: "pink", label: "Rosa", solid: "#F27DB0", soft: "#FCE4EF", ink: "#8A2352" },
  { id: "mint", label: "Menta", solid: "#6FCF97", soft: "#DFF5E9", ink: "#12603A" },
  { id: "sky", label: "Céu", solid: "#56CCF2", soft: "#DDF3FB", ink: "#0B4F6C" },
  { id: "lilac", label: "Lilás", solid: "#B39DDB", soft: "#EBE4FA", ink: "#46318C" },
];

/**
 * Ícones do design system mais alguns específicos de gasto. Todos precisam
 * existir em `AppIcon.ICONS`, senão o componente cai no ícone de fallback.
 */
export const EXPENSE_ICONS: ExpenseIcon[] = [
  { id: "inbox", label: "Compras" },
  { id: "cart", label: "Supermercado" },
  { id: "utensils", label: "Restaurante" },
  { id: "coffee", label: "Café" },
  { id: "home", label: "Casa" },
  { id: "trending", label: "Investimento" },
  { id: "wallet", label: "Carteira" },
  { id: "creditCard", label: "Cartão" },
  { id: "tag", label: "Preço" },
  { id: "target", label: "Meta" },
  { id: "grid", label: "Contas" },
  { id: "repeat", label: "Recorrente" },
  { id: "calendar", label: "Agenda" },
  { id: "users", label: "Pessoas" },
  { id: "zap", label: "Serviços" },
  { id: "box", label: "Pedido" },
  { id: "fileText", label: "Documento" },
  { id: "rocket", label: "Projeto" },
  { id: "arrowUp", label: "Entrada" },
  { id: "arrowDown", label: "Saída" },
  { id: "check", label: "Quitada" },
  { id: "clock", label: "Pendente" },
  { id: "alert", label: "Atenção" },
  { id: "star", label: "Favorito" },
  { id: "heart", label: "Preferido" },
  { id: "gift", label: "Presente" },
  { id: "plane", label: "Viagem" },
  { id: "book", label: "Estudo" },
  { id: "heartPulse", label: "Saúde" },
  { id: "car", label: "Carro" },
  { id: "phone", label: "Celular" },
  { id: "wifi", label: "Internet" },
  { id: "music", label: "Lazer" },
  { id: "palette", label: "Estilo" },
  { id: "shirt", label: "Roupas" },
];

export function colorById(id: string | null | undefined): ExpenseColor | undefined {
  if (!id) return undefined;
  return EXPENSE_COLORS.find((color) => color.id === id);
}

export function noteColorById(id: string | null | undefined): ExpenseColor | undefined {
  if (!id) return undefined;
  return NOTE_COLORS.find((color) => color.id === id);
}

/**
 * O que vai para o banco é o hex da amostra, não o id. O backend valida o
 * formato e a paleta pode ganhar cores sem precisar de migration.
 */
export function colorToHex(id: string | null | undefined): string | undefined {
  return colorById(id)?.solid;
}

export function noteColorToHex(id: string | null | undefined): string | undefined {
  return noteColorById(id)?.solid;
}

/** Busca pelo hex gravado — tolerante a maiúsculas. */
function byHex<T extends { solid: string }>(list: T[], hex: string | null | undefined): T | undefined {
  if (!hex) return undefined;
  const target = hex.toLowerCase();
  return list.find((color) => color.solid.toLowerCase() === target);
}

export function expenseColorByHex(hex: string | null | undefined): ExpenseColor | undefined {
  return byHex(EXPENSE_COLORS, hex);
}

export function noteColorByHex(hex: string | null | undefined): ExpenseColor | undefined {
  return byHex(NOTE_COLORS, hex);
}

/** Primeiro ícone livre na paleta — usado como sugestão ao abrir o seletor. */
export function suggestedIcon(description: string): string {
  const text = description.toLowerCase();

  const rules: [RegExp, string][] = [
    [/(supermerc|mercado|feira|açoug|hortifruti)/, "cart"],
    [/(restaur|lanchonete|pizza|ifood|delivery|cafe|starbucks|padaria)/, "utensils"],
    [/(uber|taxi|onibus|metro|combustiv|gasolina|posto|estacionamento|ipva)/, "car"],
    [/(aluguel|condominio|energia|luz|agua|gas|internet|wi-?fi|telefone|celular|streaming|netflix|spotify)/, "home"],
    [/(plano de saude|medicina|farmacia|dentista|exame|terapia|psicolog)/, "heartPulse"],
    [/(curso|book|livro|assinatura|universidade|escola|faculdade)/, "book"],
    [/(viagem|passagem|aereo|hotel|pousada|hospedagem)/, "plane"],
    [/(roupa|calcado|tenis|camisa|presente)/, "gift"],
    [/(academia|academia|assinatura|cinema|show|jogo|bar|balada)/, "music"],
    [/(pet|vet|cachorro|gato)/, "heart"],
    [/(recarga|celular|internet)/, "phone"],
  ];

  for (const [pattern, icon] of rules) {
    if (pattern.test(text)) return icon;
  }

  return "inbox";
}