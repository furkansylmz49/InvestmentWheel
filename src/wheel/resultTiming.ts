/*
 * Sonuç deneyiminin zamanlaması (çark durduktan sonra).
 *
 *   çark durur ─ REVEAL_DELAY ─ açılış animasyonu (REVEAL) ─ HOLD ─ hazır
 *                                                          └ son EXIT ms: kart kaybolur
 */
export const REVEAL_DELAY_MS = 300;
export const REVEAL_MS = 1100;
export const HOLD_MS = 3800;
export const EXIT_MS = 400;

/** Çark durduktan sonra kontrollerin tekrar açılmasına kadar geçen toplam süre. */
export const RESULT_TOTAL_MS = REVEAL_DELAY_MS + REVEAL_MS + HOLD_MS;
