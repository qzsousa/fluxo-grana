import { describe, it, expect } from "vitest";
import {
  addMonths,
  dayInMonth,
  daysUntil,
  displayStatus,
  formatReference,
  invoiceWindow,
  invoiceWindowsAround,
  lastDayOfMonth,
  normalizeDay,
  openInvoiceReference,
  parseReference,
  startOfUtcDay,
  urgencyOf,
} from "./invoice";

const utc = (iso: string) => new Date(iso);
// Só a parte `YYYY-MM-DD` do ISO.
const iso = (date: Date) => date.toISOString().slice(0, 10);

describe("normalizeDay", () => {
  it("trava no intervalo 1-31", () => {
    expect(normalizeDay(15, 25)).toBe(15);
    expect(normalizeDay(0, 25)).toBe(1);
    expect(normalizeDay(40, 25)).toBe(31);
  });

  it("cai no padrão quando não há valor", () => {
    expect(normalizeDay(null, 25)).toBe(25);
    expect(normalizeDay(undefined, 5)).toBe(5);
    expect(normalizeDay(Number.NaN as unknown as number, 25)).toBe(25);
  });
});

describe("dayInMonth", () => {
  it("não transborda em meses curtos", () => {
    // Dia 31 em fevereiro cai no último dia do mês.
    expect(iso(dayInMonth(2026, 1, 31))).toBe("2026-02-28");
    expect(iso(dayInMonth(2028, 1, 31))).toBe("2028-02-29");
    expect(iso(dayInMonth(2026, 3, 31))).toBe("2026-04-30");
  });

  it("usa o dia pedido em meses normais", () => {
    expect(iso(dayInMonth(2026, 9, 5))).toBe("2026-10-05");
  });
});

describe("lastDayOfMonth", () => {
  it("conhece o tamanho de cada mês", () => {
    expect(lastDayOfMonth(2026, 1)).toBe(28);
    expect(lastDayOfMonth(2026, 0)).toBe(31);
    expect(lastDayOfMonth(2026, 3)).toBe(30);
  });
});

describe("addMonths", () => {
  it("atravessa a virada de ano", () => {
    expect(addMonths({ year: 2026, month: 11 }, 1)).toEqual({ year: 2027, month: 0 });
    expect(addMonths({ year: 2026, month: 0 }, -1)).toEqual({ year: 2025, month: 11 });
  });
});

describe("formatReference / parseReference", () => {
  it("formata com zero à esquerda", () => {
    expect(formatReference({ year: 2026, month: 0 })).toBe("2026-01");
    expect(formatReference({ year: 2026, month: 9 })).toBe("2026-10");
  });

  it("rejeita referência mal formada", () => {
    expect(parseReference("2026-10")).toEqual({ year: 2026, month: 9 });
    expect(parseReference("2026-13")).toBeNull();
    expect(parseReference("2026-00")).toBeNull();
    expect(parseReference("26-10")).toBeNull();
    expect(parseReference("outubro")).toBeNull();
  });
});

describe("invoiceWindow", () => {
  it("cobre o período entre dois fechamentos, com o dia do fechamento incluído", () => {
    const window = invoiceWindow(25, 5, { year: 2026, month: 9 }); // fecha em outubro

    expect(window.reference).toBe("2026-10");
    // Janela: após 25/09 até 25/10.
    expect(iso(window.periodStart)).toBe("2026-09-26");
    expect(iso(window.periodEnd)).toBe("2026-10-25");
    expect(iso(window.periodEndExclusive)).toBe("2026-10-26");
    expect(iso(window.closingDate)).toBe("2026-10-25");
    // Vencimento menor que o fechamento cai no mês seguinte.
    expect(iso(window.dueDate)).toBe("2026-11-05");
  });

  it("mantém o vencimento no mesmo mês quando ele vem depois do fechamento", () => {
    const window = invoiceWindow(1, 10, { year: 2026, month: 9 });
    expect(iso(window.closingDate)).toBe("2026-10-01");
    expect(iso(window.dueDate)).toBe("2026-10-10");
  });

  it("atravessa a virada de ano", () => {
    const december = invoiceWindow(25, 5, { year: 2026, month: 11 });
    expect(iso(december.closingDate)).toBe("2026-12-25");
    expect(iso(december.dueDate)).toBe("2027-01-05");
    expect(iso(december.periodStart)).toBe("2026-11-26");
  });

  it("usa 25/5 quando o cartão não foi configurado", () => {
    const window = invoiceWindow(null, null, { year: 2026, month: 9 });
    expect(iso(window.closingDate)).toBe("2026-10-25");
    expect(iso(window.dueDate)).toBe("2026-11-05");
  });
});

describe("openInvoiceReference", () => {
  it("fica no mês atual antes do fechamento", () => {
    expect(openInvoiceReference(utc("2026-10-13T10:00:00.000Z"), 25)).toEqual({
      year: 2026,
      month: 9,
    });
  });

  it("pula para o mês seguinte depois do fechamento", () => {
    expect(openInvoiceReference(utc("2026-10-30T10:00:00.000Z"), 25)).toEqual({
      year: 2026,
      month: 10,
    });
  });

  it("trata o dia do fechamento como pertencente à fatura que fecha nele", () => {
    expect(openInvoiceReference(utc("2026-10-25T00:00:00.000Z"), 25)).toEqual({
      year: 2026,
      month: 9,
    });
  });
});

describe("invoiceWindowsAround", () => {
  it("devolve o passado, a aberta e as futuras", () => {
    const windows = invoiceWindowsAround(25, 5, {
      now: utc("2026-10-13T10:00:00.000Z"),
      monthsBack: 2,
      monthsForward: 1,
    });

    expect(windows.map((w) => w.reference)).toEqual(["2026-08", "2026-09", "2026-10", "2026-11"]);
  });

  it("a fatura em aberto é a do meio", () => {
    const windows = invoiceWindowsAround(25, 5, {
      now: utc("2026-10-13T10:00:00.000Z"),
      monthsBack: 1,
      monthsForward: 1,
    });
    expect(windows.map((w) => w.reference)).toEqual(["2026-09", "2026-10", "2026-11"]);
    expect(iso(windows[1].periodStart)).toBe("2026-09-26");
  });
});

describe("daysUntil", () => {
  const now = utc("2026-10-13T18:00:00.000Z");

  it("conta dias inteiros, ignorando a hora", () => {
    expect(daysUntil(utc("2026-10-13T01:00:00.000Z"), now)).toBe(0);
    expect(daysUntil(utc("2026-10-14T23:00:00.000Z"), now)).toBe(1);
    expect(daysUntil(utc("2026-10-12T23:00:00.000Z"), now)).toBe(-1);
  });

  it("funciona atravessando o ano", () => {
    expect(daysUntil(utc("2027-01-05T00:00:00.000Z"), now)).toBe(84);
  });
});

describe("urgencyOf", () => {
  it("escala a urgência dos lembretes", () => {
    expect(urgencyOf(-1)).toBe("overdue");
    expect(urgencyOf(0)).toBe("today");
    expect(urgencyOf(3)).toBe("soon");
    expect(urgencyOf(4)).toBe("upcoming");
  });
});

describe("displayStatus", () => {
  const now = utc("2026-10-13T18:00:00.000Z");
  const dueDate = utc("2026-11-05T00:00:00.000Z");

  it("paga quando o total foi coberto", () => {
    expect(displayStatus(250.4, 250.4, dueDate, now)).toBe("PAID");
  });

  it("parcial quando pagou menos que o total", () => {
    expect(displayStatus(250.4, 100, dueDate, now)).toBe("PARTIAL");
  });

  it("em aberto enquanto não venceu", () => {
    expect(displayStatus(250.4, 0, dueDate, now)).toBe("OPEN");
  });

  it("vencida quando o prazo passou com saldo devendo", () => {
    expect(displayStatus(250.4, 0, utc("2026-10-01T00:00:00.000Z"), now)).toBe("OVERDUE");
  });

  it("fatura vazia nunca fica vencida", () => {
    expect(displayStatus(0, 0, utc("2026-10-01T00:00:00.000Z"), now)).toBe("OPEN");
  });
});

describe("startOfUtcDay", () => {
  it("zera o horário preservando a data UTC", () => {
    expect(startOfUtcDay(utc("2026-10-13T23:59:59.999Z")).toISOString()).toBe(
      "2026-10-13T00:00:00.000Z"
    );
  });
});
