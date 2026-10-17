<template>
  <div class="space-y-6">
    <header class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 class="page-title">Documentação</h1>
        <p class="page-subtitle">
          Guia completo do FluxoGrana — conceitos, fluxos e referência para quem está começando ou quer ir mais fundo.
        </p>
      </div>
      <a
        href="https://github.com/anomalyco/opencode/issues"
        target="_blank"
        rel="noreferrer"
        class="link text-sm"
      >
        Sugestões de melhoria →
      </a>
    </header>

    <!-- Índice -->
    <Card padding="md">
      <nav class="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3" aria-label="Índice da documentação">
        <a v-for="s in sections" :key="s.id" :href="`#${s.id}`" class="nav-doc">
          <AppIcon :name="s.icon" :size="18" />
          <span>{{ s.title }}</span>
        </a>
      </nav>
    </Card>

    <!-- Seções -->
    <section v-for="s in sections" :id="s.id" :key="s.id" class="scroll-mt-24">
      <Card padding="lg">
        <div class="mb-4 flex items-start gap-3">
          <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-brand-light)] text-[var(--color-brand)]">
            <AppIcon :name="s.icon" :size="20" :stroke-width="2" />
          </span>
          <div class="min-w-0">
            <h2 class="text-lg font-semibold tracking-tight text-[var(--color-fg)]">{{ s.title }}</h2>
            <p v-if="s.subtitle" class="mt-0.5 text-sm text-[var(--color-fg-muted)]">{{ s.subtitle }}</p>
          </div>
        </div>

        <div class="prose space-y-4">
          <template v-for="(block, i) in s.blocks" :key="i">
            <p v-if="block.type === 'p'">{{ block.text }}</p>

            <ul v-else-if="block.type === 'ul'" class="list-disc space-y-1.5 pl-5">
              <li v-for="(item, j) in block.items" :key="j">{{ item }}</li>
            </ul>

            <ol v-else-if="block.type === 'ol'" class="list-decimal space-y-1.5 pl-5">
              <li v-for="(item, j) in block.items" :key="j">{{ item }}</li>
            </ol>

            <div
              v-else-if="block.type === 'callout'"
              class="rounded-xl border px-4 py-3 text-sm"
              :class="calloutClasses(block.tone || 'info')"
            >
              <p class="font-semibold">{{ block.title }}</p>
              <p v-if="block.text" class="mt-0.5">{{ block.text }}</p>
            </div>

            <pre
              v-else-if="block.type === 'code'"
              class="overflow-x-auto rounded-xl bg-[var(--color-bg-muted)] p-4 text-xs font-mono leading-relaxed"
            >{{ block.code }}</pre>

            <div
              v-else-if="block.type === 'table'"
              class="overflow-x-auto rounded-xl border border-[var(--color-border)]"
            >
              <table class="w-full border-collapse text-sm">
                <thead class="bg-[var(--color-bg-muted)]">
                  <tr>
                    <th
                      v-for="(h, hi) in block.headers"
                      :key="hi"
                      class="border-b border-[var(--color-border)] px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-fg-muted)]"
                    >
                      {{ h }}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, ri) in block.rows" :key="ri">
                    <td
                      v-for="(cell, ci) in row"
                      :key="ci"
                      class="border-b border-[var(--color-border)] px-3 py-2"
                    >
                      {{ cell }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 v-else-if="block.type === 'h3'" class="mt-4 text-base font-semibold text-[var(--color-fg)]">
              {{ block.text }}
            </h3>
          </template>
        </div>
      </Card>
    </section>

    <!-- Roadmap interativo -->
    <Card padding="lg">
      <div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 class="text-lg font-semibold tracking-tight text-[var(--color-fg)]">Pedidos em andamento</h2>
          <p class="mt-0.5 text-sm text-[var(--color-fg-muted)]">
            Ideias pedidas e o que já está no ar.
          </p>
        </div>
        <router-link to="/settings" class="link text-sm">Preferências →</router-link>
      </div>

      <ul class="mt-5 divide-y divide-[var(--color-border)]">
        <li v-for="r in requests" :key="r.title" class="flex items-start gap-3 py-3">
          <span
            class="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
            :class="r.done ? 'bg-[var(--color-success-light)] text-[var(--color-success)]' : 'bg-[var(--color-bg-muted)] text-[var(--color-fg-subtle)]'"
          >
            <AppIcon v-if="r.done" name="check" :size="14" :stroke-width="2.4" />
            <AppIcon v-else name="clock" :size="14" :stroke-width="2.4" />
          </span>
          <div class="min-w-0">
            <p class="text-sm font-medium text-[var(--color-fg)]">{{ r.title }}</p>
            <p class="mt-0.5 text-xs leading-relaxed text-[var(--color-fg-muted)]">{{ r.note }}</p>
          </div>
          <span class="badge shrink-0" :class="r.done ? 'badge-success' : 'badge-neutral'">
            {{ r.done ? "Entregue" : "Planejado" }}
          </span>
        </li>
      </ul>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { AppIcon, Card } from "../../components/ui";

interface Block {
  type: "p" | "ul" | "ol" | "h3" | "callout" | "code" | "table";
  text?: string;
  title?: string;
  tone?: "info" | "success" | "warning" | "danger" | "neutral";
  items?: string[];
  code?: string;
  headers?: string[];
  rows?: (string | number)[][];
}

interface Section {
  id: string;
  icon: string;
  title: string;
  subtitle?: string;
  blocks: Block[];
}

const sections: Section[] = [
  {
    id: "comecar",
    icon: "rocket",
    title: "Começando",
    subtitle: "Em 3 passos você já tem seu painel funcionando.",
    blocks: [
      { type: "ol", items: [
        "Crie sua conta em Criar conta (e-mail + senha, mínimo 8 caracteres).",
        "Cadastre ao menos uma conta (carteira, corrente, cartão ou investimento) em Contas → Nova conta.",
        "Registre sua primeira transação em Nova transação (botão principal na barra inferior).",
        "Se quiser acompanhar faturas, cadastre o cartão com dia de fechamento, vencimento e limite.",
      ] },
      { type: "callout", tone: "info", title: "Dica", text: "O saldo total do Dashboard é a soma dos saldos de todas as suas contas ativas." },
    ],
  },
  {
    id: "contas",
    icon: "wallet",
    title: "Contas",
    subtitle: "Cada conta é um 'pote' separado. A organização começa aqui.",
    blocks: [
      { type: "p", text: "Tipos suportados: conta corrente, poupança, cartão de crédito, dinheiro em espécie e investimento." },
      { type: "h3", text: "Saldo vs. saldo calculado" },
      { type: "p", text: "O saldo digitado (manual) vale como ponto de partida. Cada transação aprovada ajusta o saldo automaticamente. Se quiser, você pode recalcular a partir das transações em Detalhes da conta." },
      { type: "ul", items: [
        "Arquivo: cada conta pode ser arquivada sem apagar o histórico.",
        "Moeda: configure a moeda principal por conta; o Dashboard agrega em sua moeda preferida.",
        "Saldo inicial: informe na criação — é ele que abre o saldo da conta. Depois, qualquer lançamento ajusta o valor.",
        "Cartão de crédito: peça também dia de fechamento, dia de vencimento e limite para o app montar as faturas.",
      ] },
    ],
  },
  {
    id: "transacoes",
    icon: "arrows",
    title: "Transações",
    subtitle: "Toda entrada ou saída passa por aqui.",
    blocks: [
      { type: "p", text: "Tipos: RECEITA (aumenta o saldo), DESPESA (diminui) e TRANSFERÊNCIA (move entre contas sem alterar o total)." },
      { type: "h3", text: "Campos importantes" },
      { type: "table", headers: ["Campo", "O que é", "Obrigatório?"], rows: [
        ["Descrição", "Texto livre que ajuda você a achar depois", "Não"],
        ["Valor", "Sempre positivo; o sinal vem do tipo", "Sim"],
        ["Data", "Aceita lançamento retroativo", "Sim"],
        ["Conta", "De onde sai / para onde entra", "Sim"],
        ["Categoria", "Para os relatórios por categoria", "Não"],
        ["Tipo", "Receita / Despesa / Transferência", "Sim"],
      ] },
      { type: "callout", tone: "success", title: "Recategorização em lote", text: "Na lista de transações você pode selecionar várias e mudar de conta ou categoria de uma vez." },
    ],
  },
  {
    id: "cartoes",
    icon: "creditCard",
    title: "Cartões e faturas",
    subtitle: "Compras agrupadas por período de fechamento, com vencimento e pagamento.",
    blocks: [
      { type: "p", text: "Um cartão de crédito é uma conta do tipo Cartão de crédito. As compras são transações de despesa comuns; o app agrupa automaticamente as que caem na mesma janela de fechamento em uma fatura." },
      { type: "h3", text: "Passo 1 — configure o cartão" },
      { type: "p", text: "Em Contas → Nova conta, escolha o tipo Cartão de crédito. Aparecem três campos extras:" },
      { type: "table", headers: ["Campo", "O que é", "Exemplo"], rows: [
        ["Fecha no dia", "Dia do mês em que a fatura fecha", "25"],
        ["Vence no dia", "Dia do mês em que a fatura vence", "5"],
        ["Limite", "Total disponível no cartão (opcional)", "3000"],
      ] },
      { type: "callout", tone: "info", title: "Quando vencimento é maior que fechamento", text: "Se o dia de vencimento vier depois do de fechamento, ele cai no mesmo mês (fecha dia 1, vence dia 10 do mesmo mês). Caso contrário cai no mês seguinte (fecha dia 25, vence dia 5 do mês seguinte)." },
      { type: "h3", text: "Passo 2 — registre as compras" },
      { type: "p", text: "Lance cada compra como uma transação do tipo Despesa na conta do cartão, com a data real da compra. Nada mais precisa ser feito: o total da fatura é recalculado a cada leitura." },
      { type: "h3", text: "Como a janela é montada" },
      { type: "p", text: "A fatura de um mês reúne as compras feitas depois do fechamento anterior até o fechamento deste mês, incluindo o próprio dia do fechamento." },
      { type: "code", code: "Cartão: fecha dia 25, vence dia 5\n\nFatura de outubro/2026:\n  compras   26/09 a 25/10   (o dia 25 entra)\n  vence em  05/11/2026\n\nFatura de novembro/2026:\n  compras   26/10 a 25/11\n  vence em  05/12/2026" },
      { type: "callout", tone: "success", title: "Nada é consolidado", text: "O total não é gravado no banco. Ele é sempre somado a partir das transações na janela, então uma compra lançada depois do fechamento aparece na fatura correta sem nenhum ajuste manual." },
      { type: "h3", text: "Passo 3 — pague a fatura" },
      { type: "ol", items: [
        "Abra Faturas no menu (ou o bloco Próximos vencimentos na tela inicial).",
        "Confira o total, a data de fechamento e o vencimento.",
        "Clique em Pagar fatura e escolha a conta de origem e a data do pagamento.",
      ] },
      { type: "p", text: "O pagamento cria uma transferência da conta de origem para o cartão. É isso que devolve a dívida do cartão a zero no saldo. A transferência é marcada com as etiquetas fatura e o mês da fatura, e não conta como compra nova." },
      { type: "ul", items: [
        "Pagamento parcial: você pode pagar menos que o total; a fatura fica como Paga parcialmente com o saldo restante visível.",
        "Desfazer: na tela de detalhe, o botão Desfazer apaga a transferência, devolve o dinheiro à conta de origem e reabre a fatura.",
        "Limite: a barra mostra quanto do limite está comprometido pela fatura em aberto e quanto sobra.",
      ] },
      { type: "h3", text: "Situação de cada fatura" },
      { type: "table", headers: ["Situação", "Quando aparece"], rows: [
        ["Em aberto", "Ainda não venceu e não foi paga"],
        ["Vencida", "Passou do vencimento com saldo devendo"],
        ["Paga parcialmente", "Foi pago menos que o total"],
        ["Paga", "O pagamento cobre o total"],
      ] },
      { type: "callout", tone: "warning", title: "Cartão sem fechamento definido", text: "Se você não preencher os dias, o app usa dia 25 e dia 5 como palpite e mostra um aviso em Faturas com um link para corrigir. O cartão continua funcionando, mas os vencimentos não vão bater." },
    ],
  },
  {
    id: "orcamentos-metas",
    icon: "target",
    title: "Orçamentos e metas",
    subtitle: "Controle de limites e de objetivos de longo prazo.",
    blocks: [
      { type: "p", text: "Orçamentos limitam gasto por categoria em um período (ex.: R$ 800 em alimentação este mês). Metas acompanham um valor alvo (ex.: juntar R$ 10.000 até dezembro)." },
      { type: "ul", items: [
        "Cada movimento classificado na categoria impacta o orçamento daquele período.",
        "Alertas visuais aparecem quando 80% ou mais do limite foi consumido.",
        "Metas podem ser vinculadas a uma conta específica (ex.: poupança).",
      ] },
    ],
  },
  {
    id: "relatorios",
    icon: "box",
    title: "Relatórios",
    subtitle: "Cashflow, patrimônio e impostos em um lugar.",
    blocks: [
      { type: "ul", items: [
        "Cashflow: entradas e saídas por mês ou por período customizado.",
        "Patrimônio líquido: soma de ativos (contas positivas) menos passivos (cartões e dívidas).",
        "Por categoria: onde o dinheiro foi gasto, com gráficos de pizza e barra.",
        "Exportação em CSV para exportar para planilhas.",
      ] },
    ],
  },
  {
    id: "personalizacao",
    icon: "palette",
    title: "Personalização",
    subtitle: "Deixe o app com a sua cara. Tudo em Configurações → Aparência.",
    blocks: [
      { type: "h3", text: "Cor de destaque" },
      { type: "p", text: "Oito acentos disponíveis. A troca afeta botões, links, seleções, a barra do sino e os gráficos, e vale para os dois temas:" },
      { type: "table", headers: ["Acento", "Claro", "Escuro"], rows: [
        ["Petróleo (padrão)", "verde-azulado", "verde-água claro"],
        ["Índigo", "azul-arroxeado", "índigo claro"],
        ["Violeta", "roxo", "violeta claro"],
        ["Azul", "azul forte", "azul claro"],
        ["Esmeralda", "verde escuro", "verde claro"],
        ["Âmbar", "âmbar queimado", "âmbar claro"],
        ["Rosa", "rosa profundo", "rosa claro"],
        ["Grafite", "cinza escuro", "cinza claro"],
      ] },
      { type: "callout", tone: "info", title: "Um token só", text: "Cada acento redefine apenas os tokens de marca no CSS. Nenhum componente sabe que a troca aconteceu, então telas novas já nascem com a cor certa." },
      { type: "h3", text: "Densidade" },
      { type: "p", text: "Confortável deixa as linhas com mais respiro; compacto encolhe o espaçamento vertical das listas e tabelas para caber mais itens na tela. Alvos de toque e largura não mudam." },
      { type: "h3", text: "Tamanho do texto" },
      { type: "p", text: "Pequeno, normal ou grande. A escala age na raiz da página e move títulos, espaçamentos e tabelas juntos." },
      { type: "h3", text: "Tema" },
      { type: "p", text: "Claro, escuro ou sistema, pelo botão no topo da tela. A opção sistema acompanha o seu sistema operacional em tempo real." },
      { type: "callout", tone: "neutral", title: "Preferências ficam neste navegador", text: "Cor, densidade, tamanho do texto e formato de números são guardados no localStorage do aparelho. A única exceção são idioma e moeda padrão, que vêm da sua conta." },
    ],
  },
  {
    id: "notificacoes",
    icon: "bell",
    title: "Lembretes",
    subtitle: "Avisos de fatura vencendo, dentro do app e fora dele.",
    blocks: [
      { type: "p", text: "Os lembretes vêm das faturas dos seus cartões que ainda não foram pagas. Você escolhe quantos dias antes do vencimento começar a ser avisado." },
      { type: "h3", text: "Onde aparecem" },
      { type: "table", headers: ["Canal", "Onde liga", "O que faz"], rows: [
        ["Sino no topo", "Sempre ligado", "Contador no ícone e lista ao abrir"],
        ["Aviso dentro do app", "Preferências → Lembretes", "Toast ao entrar no app"],
        ["Notificação do navegador", "Preferências → Lembretes", "Popup do próprio sistema"],
      ] },
      { type: "h3", text: "Configuração" },
      { type: "ol", items: [
        "Vá em Configurações → Preferências.",
        "Escolha a antecedência: 1, 3, 5, 7, 10 ou 14 dias.",
        "Ligue ou desligue o aviso dentro do app.",
        "Se quiser o popup do sistema, ligue a notificação do navegador e autorize a permissão quando o navegador perguntar.",
      ] },
      { type: "callout", tone: "warning", title: "Permissão só pode ser pedida por clique", text: "Navegadores bloqueiam pedidos de notificação que não vêm de um gesto do usuário. Por isso o botão Autorizar aparece dentro do sino e dentro da tela de preferências — e não automaticamente ao carregar a página." },
      { type: "p", text: "Cada fatura gera no máximo um aviso por dia, mesmo que o app recarregue os dados várias vezes. Depois de abrir o sino, o contador zera." },
      { type: "h3", text: "Urgência" },
      { type: "table", headers: ["Falta", "Como aparece"], rows: [
        ["Vencida", "Vermelho, com ícone de alerta"],
        ["Vence hoje", "Vermelho"],
        ["Até 3 dias", "Amarelo"],
        ["4 dias ou mais", "Neutro"],
        ["Paga", "Some dos lembretes"],
      ] },
    ],
  },
  {
    id: "acessibilidade",
    icon: "monitor",
    title: "Acessibilidade e atalhos",
    subtitle: "Feito para ser usável em qualquer dispositivo.",
    blocks: [
      { type: "ul", items: [
        "Todos os botões têm área de toque mínima de 44×44 px (padrão Apple/Google).",
        "Alvos são focáveis pelo teclado (Tab/Enter/Espaço) com outline visível.",
        "Respeitamos 'prefers-reduced-motion' — animações desativam para quem pediu.",
        "Zonas de toque pensadas para múltiplos dedos no mobile (sem toque duplo necessário).",
        "Textos nunca ficam abaixo de 16px, para evitar zoom ao focar inputs no iPhone.",
      ] },
    ],
  },
  {
    id: "tipos",
    icon: "arrowDownCircle",
    title: "Tipos de lançamento",
    subtitle: "O que é cada um e quando usar.",
    blocks: [
      { type: "p", text: "Todo lançamento precisa de um tipo. É ele que decide se o dinheiro entra, sai ou muda de lugar. Na hora de lançar, você toca em cartões que explicam o que cada um faz — não em uma lista de siglas." },
      { type: "h3", text: "Dia a dia" },
      { type: "table", headers: ["Tipo", "Quando usar", "O que acontece no saldo"], rows: [
        ["Despesa", "Mercado, aluguel, conta de luz", "A conta escolhida diminui"],
        ["Receita", "Salário, freela, venda", "A conta escolhida aumenta"],
        ["Transferência", "Corrente para poupança, ou pagar a fatura", "Sai de uma conta e entra em outra; o total não muda"],
      ] },
      { type: "h3", text: "Só se você investe" },
      { type: "table", headers: ["Tipo", "Quando usar", "O que acontece no saldo"], rows: [
        ["Compra de investimento", "Comprar ação, fundo ou cripto", "Sai da conta e vira investimento"],
        ["Venda de investimento", "Resgatar ou vender", "O ativo sai e o dinheiro volta"],
        ["Dividendo", "Lucuo que a empresa repartiu", "Entra como receita, separado"],
        ["Juros", "Rendimento do dinheiro parado no banco", "Entra como receita, separado"],
        ["Taxa", "Tarifa bancária, taxa de saque", "Sai como despesa"],
      ] },
      { type: "callout", tone: "info", title: "Por que separadas em dois grupos", text: "Oito opções com o mesmo peso só geram dúvida. As três do dia a dia vêm primeiro; as de investimento ficam num grupo separado porque fewas gente usa. Se está no dia a dia, nunca precisa pensar nelas." },
      { type: "h3", text: "Receitas e despesas não são a mesma coisa" },
      { type: "ul", items: [
        "Despesa é o que você paga. Receita é o que entra sem ser transferência — ou seja, os dois lados da sua conta.",
        "Transferência não é nem entrada nem saída: é o mesmo dinheiro indo para outro lugar. Por isso o total do Início não muda quando você faz uma.",
        "Pagar a fatura do cartão é transferência, não despesa. A compra já foi despesa quando foi feita; o pagamento só muda de conta.",
      ] },
      { type: "p", text: "A tela de detalhe de cada lançamento repete essa explicação, então dá para conferir depois o que exatamente foi registrado." },
    ],
  },
  {
    id: "tutorial",
    icon: "lightbulb",
    title: "Tutorial",
    subtitle: "A passeada guiada que aparece no primeiro acesso.",
    blocks: [
      { type: "p", text: "Na primeira vez que você entra, o app abre um passeio de sete passos. Cada passo escurece a tela, destaca o botão do assunto e explica em duas frases o que ele faz." },
      { type: "h3", text: "Como navegar" },
      { type: "table", headers: ["Ação", "Como fazer"], rows: [
        ["Avançar", "Botão Próximo, ou seta para a direita"],
        ["Voltar", "Botão Voltar, ou seta para a esquerda"],
        ["Sair", "Botão Pular, o X no canto ou Esc"],
      ] },
      { type: "p", text: "Se o botão destacado não existir na tela em que você estiver, o balão aparece no centro e o passeio segue normal." },
      { type: "h3", text: "Rever quando quiser" },
      { type: "p", text: "O passeio só aparece uma vez. Para rever depois, vá em Configurações e clique em Rever tutorial, no fim da lista de seções." },
    ],
  },
  {
    id: "marcas",
    icon: "palette",
    title: "Marcando as despesas",
    subtitle: "Ícone e cor para achar cada gasto de relance.",
    blocks: [
      { type: "p", text: "Ao registrar uma despesa (ou receita) você escolhe um ícone e uma cor. A marca aparece no círculo da linha em Início, em Transações e no detalhe — o lançamento fica reconhecível mesmo sem categoria." },
      { type: "h3", text: "Sugestão automática" },
      { type: "p", text: "Enquanto você não escolher, o app sugere o ícone pela palavra da descrição: padaria vira copo, uber vira carro, farmácia vira coração. Assim só falta clicar na cor." },
      { type: "callout", tone: "info", title: "Sugestão nunca sobrescreve", text: "Se você já escolheu um ícone, a sugestão para de aparecer. O app nunca troca uma escolha sua por conta própria." },
      { type: "h3", text: "O que está disponível" },
      { type: "ul", items: [
        "12 cores: marca, verde, vermelho, âmbar, azul, violeta, rosa, laranja, ciano, oliva, cinza e areia.",
        "36 ícones, de carrinho e copo até carro, casa, coração e presentinho.",
        "Nada é obrigatório: sem marca, o lançamento usa a cor do tipo (verde para receita, vermelho para despesa).",
      ] },
      { type: "p", text: "Transferências não recebem marca: elas não são despesa e não aparecem na lista como tal." },
    ],
  },
  {
    id: "lembretes",
    icon: "sticky",
    title: "Lembretes",
    subtitle: "Anotações rápidas na tela inicial. O estilo é você que escolhe.",
    blocks: [
      { type: "p", text: "Abaixo dos vencimentos, na tela inicial, tem um bloco de lembretes: anotações que só servem para você. Elas não entram em saldo, orçamento nem fatura." },
      { type: "h3", text: "Dois estilos, você decide" },
      { type: "table", headers: ["Estilo", "Como fica"], rows: [
        ["Post-it", "Papelzinho inclinado, com fita no topo, canto descolado e balanço leve ao passar o mouse"],
        ["Campo comum", "Lista limpa e discreta, sem o visual de papel"],
      ] },
      { type: "p", text: "A escolha fica na aba e também em Configurações → Aparência. Dá para trocar a qualquer momento; as anotações são as mesmas." },
      { type: "h3", text: "Usando" },
      { type: "ul", items: [
        "Escreva no campo e clique em Lembrar (ou aperte Enter).",
        "Seis cores de papel, de amarelo a lilás. O papel é escolhido na hora de criar.",
        "Fixar no topo traz o lembrete para o começo da lista.",
        "Passar o mouse sobre a nota revela o botão de fixar e o de apagar.",
        "Até 50 lembretes por conta.",
      ] },
      { type: "callout", tone: "neutral", title: "A inclinação é sempre a mesma", text: "Cada posição da lista tem um ângulo fixo, rodado entre seis valores. Nada de sorteio a cada carregamento: o papel não fica pulando enquanto você lê." },
    ],
  },
  {
    id: "pagamento-rapido",
    icon: "checkCircle",
    title: "Pagar uma despesa",
    subtitle: "Sem precisar abrir a fatura inteira.",
    blocks: [
      { type: "p", text: "Toda linha de despesa feita no cartão tem um botão de pagar na própria linha — na tela inicial e na lista de transações. Ele aparece ao passar o mouse e fica sempre visível se a compra já estiver paga." },
      { type: "h3", text: "O que acontece ao pagar" },
      { type: "ol", items: [
        "Você escolhe a conta de origem e a data do pagamento.",
        "Uma transferência sai da conta escolhida e entra no cartão, zerando aquela dívida.",
        "A compra fica marcada como paga: some o destaque e ganha um traço.",
        "O valor é somado na fatura que contém a compra, calculada a partir da data dela.",
      ] },
      { type: "callout", tone: "info", title: "Fatura continua coerente", text: "Pagar compras soltas vai quitando a fatura aos poucos. Quando o total pago cobre a fatura, ela passa a Paga sozinha — sem nenhum passo extra." },
      { type: "h3", text: "Desfazer" },
      { type: "p", text: "Clicar de novo no botão desfaz o pagamento: apaga a transferência, devolve o dinheiro à conta de origem, tira a compra da conta de pagas e reabre a fatura." },
      { type: "callout", tone: "warning", title: "Só despesa de cartão", text: "O botão aparece apenas em compras de cartão de crédito. Para uma despesa de conta corrente, o caminho continua sendo excluir ou editar o lançamento." },
    ],
  },
  {
    id: "api",
    icon: "box",
    title: "API e integrações",
    subtitle: "Para desenvolvedores.",
    blocks: [
      { type: "p", text: "A API REST vive em /api/v1. Documentação interativa (Swagger) em /docs do backend, em http://localhost:3001/docs." },
      { type: "code", code: "Base: http://localhost:3001/api/v1\nAuth:  POST /auth/login    { email, password }\n       POST /auth/register { email, password, name }\n       GET  /auth/me        (Bearer token)\n\nContas:        GET /accounts\nTransações:    GET /transactions?limit=20" },
      { type: "h3", text: "Faturas" },
      { type: "table", headers: ["Rota", "O que faz"], rows: [
        ["GET /invoices", "Lista faturas. Filtros: accountId, reference, monthsBack, monthsForward"],
        ["GET /invoices/upcoming", "Só as não pagas que vencem em até N dias (feed dos lembretes)"],
        ["GET /invoices/:id", "Uma fatura com as compras da janela"],
        ["POST /invoices/:id/pay", "Paga: gera a transferência, marca as compras e a fatura"],
        ["DELETE /invoices/:id/payment", "Desfaz o pagamento e reabre a fatura"],
      ] },
      { type: "h3", text: "Transações e lembretes" },
      { type: "table", headers: ["Rota", "O que faz"], rows: [
        ["POST /transactions/:id/pay", "Paga UMA compra de cartão e soma na fatura dela"],
        ["DELETE /transactions/:id/pay", "Desfaz o pagamento da compra"],
        ["GET /notes", "Lista os lembretes da tela inicial"],
        ["POST /notes", "Cria um lembrete"],
        ["PUT /notes/:id", "Edita, fixa ou recolore"],
        ["DELETE /notes/:id", "Apaga"],
      ] },
      { type: "code", code: "// Pagar o saldo restante, saindo da conta de origem\nPOST /api/v1/invoices/:id/pay\n{\n  \"fromAccountId\": \"clx...\",\n  \"paidAt\": \"2026-11-05T00:00:00.000Z\"\n}\n\n// Pagar uma compra solta, direto da lista\nPOST /api/v1/transactions/:id/pay\n{ \"fromAccountId\": \"clx...\" }" },
      { type: "callout", tone: "neutral", title: "Chaves de API", text: "Você pode gerar chaves em Configurações → Chaves de API para integrar com outros sistemas sem expor sua senha." },
    ],
  },
  {
    id: "problemas",
    icon: "alert",
    title: "Solução de problemas",
    subtitle: "Respostas rápidas para erros comuns.",
    blocks: [
      { type: "ul", items: [
        "'Não foi possível conectar ao servidor': o backend não está rodando. Suba com npm run dev dentro de backend.",
        "Fatura não aparece: confira se a conta é do tipo Cartão de crédito e se a compra é do tipo Despesa. Transferências nunca entram em fatura.",
        "Fatura vence em dia estranho: ajuste os dias de fechamento e vencimento em Contas → editar o cartão. O palpite 25/5 só é usado enquanto os campos estiverem vazios.",
        "A fatura continua em aberto depois de pagar: confira se a conta de origem tinha saldo. O app avisa antes de deixar a conta negativa.",
        "Sem notificação do navegador: confira a permissão do site nas permissões do navegador. Se estiver bloqueada, o aviso do sino continua funcionando.",
        "Notificações repetidas: só há um aviso por fatura por dia. Se quiser reavaliar hoje, use o botão de recarregar nas preferências.",
        "Dados não aparecem: cada usuário só vê os seus — verifique se fez login com o usuário certo.",
        "Saldo errado: edite a transação que causou a divergência; os saldos recalculam em cascata.",
      ] },
    ],
  },
];

const requests = [
  { title: "Layout mobile-first (barra inferior + FAB)", done: true, note: "Barra inferior com 4 abas + botão central de nova transação. Testado em celulares estreitos." },
  { title: "Design system sem textura/cor dourada", done: true, note: "Uma família sans (DM Sans), acento em verde-petróleo, sem grain e sem serif. Visual limpo de app financeiro moderno." },
  { title: "Correção do Network Error", done: true, note: "Mensagem agora aponta para o backend na porta 3001 em vez de 'Network Error' genérico." },
  { title: "Compras com cartão + data de fechamento mensal", done: true, note: "Contas do tipo CREDIT ganharam dia de fechamento, dia de vencimento e limite. As compras são agrupadas em faturas pelo período de fechamento." },
  { title: "Botão de pagar a fatura", done: true, note: "Pagar gera uma transferência da conta de origem para o cartão, zera a dívida no saldo e permite pagamento parcial. Dá para desfazer." },
  { title: "Lembretes de faturas a vencer", done: true, note: "Sino no topo com contador, aviso dentro do app e popup do navegador. A antecedência é configurável de 1 a 14 dias." },
  { title: "Mais opções de personalização", done: true, note: "Oito acentos de cor, densidade confortável ou compacta e três tamanhos de texto, em Configurações → Aparência." },
  { title: "Avisos que nunca apareciam", done: true, note: "O container de toasts mantinha a própria lista e nenhum toast era exibido. Agora todos os avisos das telas aparecem de verdade." },
  { title: "Datas em português", done: true, note: "Os formatadores tinham en-US como padrão e imprimiam 'Oct 19' no meio da interface. Agora tudo sai em pt-BR, com 'Hoje' e 'Ontem'." },
  { title: "Botão de pagar ao lado da despesa", done: true, note: "Despesas de cartão têm um botão de pagar na própria linha, no Início e na lista. Quitar compras soltas vai fechando a fatura." },
  { title: "Ícone e cor predefinida para despesas", done: true, note: "Seletor com 12 cores e 36 ícones no formulário, com sugestão automática pela palavra da descrição." },
  { title: "Lembretes na tela inicial", done: true, note: "Bloco de anotações rápidas com dois estilos à escolha: post-it animado ou campo comum. Fixa por lembrete e até 50 por conta." },
  { title: "Nome FluxoGrana", done: true, note: "'Grana' usa o token de marca, então o nome acompanha sozinho a cor escolhida em Aparência." },
  { title: "Tipos de lançamento em português claro", done: true, note: "Oito siglas em um select viraram cartões explicados, separados entre dia a dia e investimento. O detalhe de cada lançamento repete a explicação." },
  { title: "Tutorial interativo no primeiro acesso", done: true, note: "Sete passos que escurecem a tela e destacam o botão do assunto. Navega por setas do teclado e pode ser revisto em Configurações." },
  { title: "Ícones e busca nas Configurações", done: true, note: "Os ícones sumiam porque usavam template string e o build do Vue é runtime-only. Agora usam AppIcon, e a busca filtra as seções por nome e palavra-chave." },
  { title: "Editar transação não mexe mais na data", done: true, note: "Sem a data no corpo, o backend gravava a data de hoje e jogava a compra para fora da fatura." },
  { title: "Documentação em /docs", done: true, note: "Esta página, acessível pelo menu e pelo rodapé da barra lateral." },
];

function calloutClasses(tone: string): string {
  const map: Record<string, string> = {
    info: "border-[var(--color-info-muted)] bg-[var(--color-info-light)] text-[var(--color-info)]",
    success: "border-[var(--color-success-muted)] bg-[var(--color-success-light)] text-[var(--color-success)]",
    warning: "border-[var(--color-warning-muted)] bg-[var(--color-warning-light)] text-[var(--color-warning)]",
    danger: "border-[var(--color-danger-muted)] bg-[var(--color-danger-light)] text-[var(--color-danger)]",
    neutral: "border-[var(--color-border)] bg-[var(--color-bg-muted)] text-[var(--color-fg-muted)]",
  };
  return map[tone] || map.info;
}
</script>

<style scoped>
.nav-doc {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  min-height: 2.25rem;
  padding: 0.5rem 0.75rem;
  border-radius: var(--radius-lg);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-fg-muted);
  transition: background-color var(--duration-fast) var(--ease-out),
    color var(--duration-fast) var(--ease-out);
}
.nav-doc:hover {
  background-color: var(--color-bg-muted);
  color: var(--color-fg);
}
.prose p {
  line-height: 1.65;
  color: var(--color-fg);
}
.prose strong {
  font-weight: 600;
  color: var(--color-fg);
}
</style>