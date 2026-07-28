/**
 * Formato de precios y fechas — Forno
 *
 * Formateo manual y no `Intl`, porque `Intl` depende de la build de Hermes y del locale
 * del dispositivo: en un prototipo que Carlos va a abrir en su teléfono, un total que se
 * ve distinto según el equipo es un problema evitable.
 */

/** `12400` → `"$12.400"`. Punto como separador de miles, formato rioplatense. */
export function formatPrice(value: number): string {
  const rounded = Math.round(Math.abs(value));
  const withDots = rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${value < 0 ? '-' : ''}$${withDots}`;
}

/** `800` → `"+$800"`. Para recargos mostrados junto a la opción que los provoca. */
export function formatSurcharge(value: number): string {
  if (value === 0) return 'Incluido';
  return `+${formatPrice(value)}`;
}

/** `1753900000000` → `"20:35"`. */
export function formatClock(epochMs: number): string {
  const date = new Date(epochMs);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

/** Ventana de llegada: `"entre 20:35 y 20:45"`. Rango, nunca una promesa exacta. */
export function formatEtaWindow(placedAt: number, minMinutes: number, maxMinutes: number): string {
  const from = formatClock(placedAt + minMinutes * 60_000);
  const to = formatClock(placedAt + maxMinutes * 60_000);
  return `entre ${from} y ${to}`;
}

/** `"Hoy"`, `"Ayer"`, `"Hace 12 días"`. Más legible que una fecha en el bloque de recompra. */
export function formatRelativeDay(epochMs: number, now: number = Date.now()): string {
  const days = Math.floor((now - epochMs) / 86_400_000);
  if (days <= 0) return 'Hoy';
  if (days === 1) return 'Ayer';
  return `Hace ${days} días`;
}

/** `3` → `"3 productos"`, `1` → `"1 producto"`. */
export function pluralizeItems(count: number): string {
  return count === 1 ? '1 producto' : `${count} productos`;
}
