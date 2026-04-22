// lib/utils.ts

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO, isValid, isPast, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";

// ─── Tailwind class merger ────────────────────────────────────────────────────

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Formatação de datas em português ────────────────────────────────────────

export function formatarData(
  dataStr: string | null | undefined,
  formato = "dd/MM/yyyy"
): string {
  if (!dataStr) return "—";
  try {
    const data = parseISO(dataStr);
    if (!isValid(data)) return "Data inválida";
    return format(data, formato, { locale: ptBR });
  } catch {
    return dataStr;
  }
}

export function formatarDataLonga(dataStr: string | null | undefined): string {
  return formatarData(dataStr, "dd 'de' MMMM 'de' yyyy");
}

// Retorna label de urgência ("Hoje", "Vence em 3 dias", "Vencido há 2 dias", etc.)
export function urgenciaPrazo(dataStr: string): {
  label: string;
  classe: string;
} {
  try {
    const data = parseISO(dataStr);
    const hoje = new Date();
    const diff = differenceInDays(data, hoje);

    if (diff < 0) {
      return {
        label: `Vencido há ${Math.abs(diff)} dia${Math.abs(diff) !== 1 ? "s" : ""}`,
        classe: "text-danger",
      };
    }
    if (diff === 0) return { label: "Vence hoje!", classe: "text-danger font-bold" };
    if (diff <= 3)  return { label: `Vence em ${diff} dia${diff !== 1 ? "s" : ""}`, classe: "text-warning" };
    if (diff <= 7)  return { label: `${diff} dias restantes`, classe: "text-gold-400" };
    return { label: `${diff} dias restantes`, classe: "text-ink-300" };
  } catch {
    return { label: formatarData(dataStr), classe: "text-ink-300" };
  }
}

export function prazoVencido(dataStr: string): boolean {
  try {
    return isPast(parseISO(dataStr));
  } catch {
    return false;
  }
}

// ─── Formatação de arquivos ───────────────────────────────────────────────────

export function formatarTamanho(bytes: number): string {
  if (bytes < 1024)        return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── Converter arquivo para base64 (browser) ─────────────────────────────────

export function arquivoParaBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => {
      const result = reader.result as string;
      // Remove o prefixo "data:application/pdf;base64,"
      resolve(result.split(",")[1]);
    };
    reader.onerror = () => reject(new Error("Falha ao ler o arquivo"));
    reader.readAsDataURL(file);
  });
}

// ─── Labels de tipo de parte ─────────────────────────────────────────────────

export const TIPO_PARTE_LABEL: Record<string, string> = {
  autor:     "Autor",
  réu:       "Réu",
  terceiro:  "Terceiro",
  advogado:  "Advogado",
  juiz:      "Juiz",
  promotor:  "Promotor",
  outro:     "Outro",
};
