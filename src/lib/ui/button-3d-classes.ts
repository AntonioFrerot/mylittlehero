/** Variantes 3D — combiner avec la mise en page (flex, padding, rounded-full, etc.). */

const GLOW_SOFT = "btn-3d--glow-soft";
const GLOW_FULL = "btn-3d--glow-full";
const GLOW_SUBTLE = "btn-3d--glow-subtle";

export const BTN_3D_PRIMARY =
  `btn-3d btn-3d--primary ${GLOW_SOFT} font-semibold hover:brightness-110 hover:scale-[1.02] active:scale-[0.98]`;

/** Lueur forte — hero accueil uniquement. */
export const BTN_3D_PRIMARY_FULL_GLOW =
  `btn-3d btn-3d--primary ${GLOW_FULL} font-semibold hover:brightness-110 hover:scale-[1.02] active:scale-[0.98]`;

/** Alias — lueur légère (standard site). */
export const BTN_3D_PRIMARY_SOFT_GLOW = BTN_3D_PRIMARY;

/** Primaire 3D sans halo externe (badges, onglets, boutons compacts). */
export const BTN_3D_PRIMARY_FLAT =
  "btn-3d btn-3d--primary font-semibold hover:brightness-110 active:scale-[0.98]";

export const BTN_3D_SECONDARY =
  "btn-3d btn-3d--secondary hover:border-gold/70 hover:bg-white/10 active:scale-[0.98]";

export const BTN_3D_GHOST =
  "text-cream/80 hover:text-gold-light active:scale-[0.98]";

export const BTN_3D_PRIMARY_ACTION =
  `btn-3d btn-3d--primary ${GLOW_SOFT} inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition-all hover:brightness-110 disabled:opacity-60 active:scale-[0.98]`;

export const BTN_3D_PRIMARY_ACTION_LG =
  `btn-3d btn-3d--primary ${GLOW_SOFT} inline-flex min-h-[48px] w-full items-center justify-center rounded-full px-8 py-3.5 text-sm font-semibold transition-all hover:brightness-110 disabled:opacity-60 active:scale-[0.98] sm:w-auto`;

/** Valider — menu thèmes mobile (doré compact, pleine largeur via CSS). */
export const BTN_FILM_THEME_VALIDATE =
  `btn-3d btn-3d--primary ${GLOW_SOFT} film-theme-dropdown__validate font-display font-bold transition-all hover:brightness-110 disabled:opacity-45 disabled:saturate-70 active:scale-[0.98]`;

/** Bouton principal création de film — doré, compact, pastille ticket intégrée. */
export const BTN_FILM_CREATE_SUBMIT =
  `btn-3d btn-3d--primary ${GLOW_FULL} film-create-submit font-display font-bold transition-all hover:brightness-110 disabled:opacity-55 disabled:saturate-75 active:scale-[0.98]`;

export const BTN_3D_PRIMARY_COMPACT =
  "btn-3d btn-3d--primary inline-flex w-fit items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold transition-all hover:brightness-110 disabled:opacity-50 active:scale-[0.98]";

export const BTN_3D_SECONDARY_ACTION =
  "btn-3d btn-3d--secondary inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm transition-all duration-300 active:scale-[0.98]";

export const BTN_3D_SECONDARY_ACTION_LG =
  "btn-3d btn-3d--secondary inline-flex items-center justify-center rounded-full px-6 py-3 text-sm transition-all hover:border-gold/70 hover:bg-white/10 active:scale-[0.98]";

export const BTN_3D_SOFT =
  "btn-3d btn-3d--soft inline-flex w-fit items-center justify-center rounded-full px-4 py-2 text-sm font-medium transition-all hover:brightness-110 disabled:opacity-50 active:scale-[0.98]";

export const BTN_3D_SOFT_COMPACT =
  "btn-3d btn-3d--soft inline-flex w-fit items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold transition-all hover:brightness-110 disabled:opacity-50 active:scale-[0.98]";

export const BTN_3D_TAB_ACTIVE =
  "btn-3d btn-3d--primary flex-1 rounded-full py-2.5 text-sm font-medium text-cinema-black";

export const BTN_3D_NAV_ACTIVE =
  `btn-3d btn-3d--primary ${GLOW_SOFT} shrink-0 snap-start rounded-xl px-4 py-3 text-sm font-medium text-cinema-black lg:shrink lg:text-base`;

export const BTN_3D_NAV_INACTIVE =
  "btn-3d btn-3d--secondary shrink-0 snap-start rounded-xl px-4 py-3 text-sm font-medium text-cream/70 hover:text-cream lg:shrink lg:text-base";

export const BTN_3D_BADGE =
  "btn-3d btn-3d--primary absolute -top-3 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-full px-3 py-1 text-[10px] font-semibold text-cinema-black xl:text-xs";

export const BTN_3D_BADGE_INLINE =
  "btn-3d btn-3d--primary flex h-full w-full items-center justify-center rounded-md text-[10px] font-bold uppercase tracking-[0.14em] text-cinema-black";

export const BTN_3D_COMPACT_SECONDARY =
  "btn-3d btn-3d--secondary rounded-lg px-3 py-1.5 text-xs text-cream/80 active:scale-[0.98]";

export const BTN_3D_ICON =
  "btn-3d btn-3d--secondary flex shrink-0 items-center justify-center rounded-lg active:scale-[0.98]";

export const BTN_3D_LOGO =
  `btn-3d btn-3d--primary ${GLOW_SOFT} flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-lg !text-white`;

export const BTN_3D_PLAY =
  "btn-3d btn-3d--play flex size-16 shrink-0 items-center justify-center rounded-full transition-transform duration-200 ease-out group-hover:scale-[1.04] sm:size-20";

export const BTN_3D_HERO_BADGE =
  "btn-3d btn-3d--hero-badge inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium uppercase tracking-widest md:text-sm";

export const BTN_3D_TRUST_BADGE =
  "btn-3d btn-3d--soft inline-flex rounded-full px-4 py-1.5 text-sm";

export const BTN_3D_CHAT_SEND =
  "btn-3d btn-3d--primary shrink-0 self-end rounded-xl px-3 py-2.5 text-xs font-semibold transition-all hover:brightness-110 disabled:opacity-50 active:scale-[0.98]";

export const BTN_3D_FAB =
  `btn-3d btn-3d--primary ${GLOW_SOFT} border-gold/40 transition-all hover:scale-105 active:scale-[0.98]`;

/** Surfaces 3D — pastilles, panneaux, cartes (sans lueur externe). */
export const SURFACE_3D_PANEL =
  "btn-3d btn-3d--secondary rounded-xl";

export const SURFACE_3D_PANEL_LG =
  "btn-3d btn-3d--secondary rounded-2xl transition-colors hover:border-white/15";

export const SURFACE_3D_CHIP =
  "btn-3d btn-3d--soft inline-flex rounded-lg px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-gold-light";

export const SURFACE_3D_CHIP_MUTED =
  "btn-3d btn-3d--secondary inline-flex rounded-lg px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-cream/60";

export const SURFACE_3D_CHIP_CALLOUT =
  "btn-3d btn-3d--soft rounded-lg px-3 py-2 text-xs font-semibold leading-snug text-gold-light xl:text-sm";

export const SURFACE_3D_ICON_SM =
  "btn-3d btn-3d--soft mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] text-gold-light xl:h-5 xl:w-5 xl:text-xs";

export const SURFACE_3D_ICON_MD =
  "btn-3d btn-3d--soft mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gold-light";

export const SURFACE_3D_ICON_LG =
  "btn-3d btn-3d--soft flex h-12 w-12 items-center justify-center rounded-xl text-gold-light transition-colors group-hover:brightness-110";

export const SURFACE_3D_CARD =
  "btn-3d btn-3d--secondary flex cursor-pointer items-center gap-3 rounded-xl border-white/10 bg-cinema-night/60 px-3 py-3 transition-all hover:border-white/20";

export const SURFACE_3D_CARD_SELECTABLE =
  "btn-3d btn-3d--secondary group relative flex cursor-pointer flex-col overflow-hidden rounded-xl border border-white/10 bg-cinema-night/60 transition-all duration-200 ease-out hover:border-white/20 has-checked:border-gold/50 has-checked:bg-gold/10";

export const SURFACE_3D_CHECK_BADGE =
  "btn-3d btn-3d--primary absolute right-0 top-0 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-cinema-black opacity-0 transition-opacity peer-checked:opacity-100";

export const SURFACE_3D_DURATION_COMPACT =
  "btn-3d btn-3d--hero-badge absolute left-3 top-3 z-[1] rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-gold-light";

export const SURFACE_3D_STATUS =
  "btn-3d surface-3d--status inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide";

export const SURFACE_3D_TAB_SHELL =
  "btn-3d btn-3d--secondary mb-6 flex rounded-full p-1";

export const SURFACE_3D_CALLOUT =
  "btn-3d btn-3d--secondary relative rounded-lg border-gold/45 px-2.5 py-2 sm:rounded-xl sm:px-3.5 sm:py-2.5";

export const SURFACE_3D_STEP_CARD =
  "btn-3d btn-3d--secondary step-card group relative block rounded-2xl border border-white/5 p-5 transition-all duration-300 hover:border-gold/20 sm:p-6 md:p-8";

export const SURFACE_3D_BROWSE_STEP =
  "btn-3d btn-3d--secondary rounded-2xl";

export const SURFACE_3D_BROWSE_STEP_INDEX =
  "btn-3d btn-3d--soft inline-flex h-[1.85rem] w-[1.85rem] shrink-0 items-center justify-center rounded-full text-[0.78rem] font-bold text-gold-light/90";

export const SURFACE_3D_TOGGLE =
  "btn-3d btn-3d--secondary flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors hover:border-gold/30";

export const SURFACE_3D_SUBSCRIPTION =
  "btn-3d btn-3d--soft min-w-0 flex-1 rounded-xl px-4 py-3 text-sm text-cream/80";

export const SURFACE_3D_DURATION_VALUE =
  "btn-3d btn-3d--soft inline-flex rounded-lg px-2.5 py-0.5 font-display text-lg font-semibold tabular-nums text-gold-light";

/** Cartes offres — page tarifs (/achat) */
export const SURFACE_3D_PURCHASE_INNER =
  "btn-3d btn-3d--secondary purchase-offer__inner purchase-offer__inner--3d rounded-[1.75rem] transition-colors hover:border-white/15";

export const SURFACE_3D_PURCHASE_INNER_FEATURED =
  "btn-3d btn-3d--secondary btn-3d--glow-subtle purchase-offer__inner purchase-offer__inner--3d rounded-[1.75rem] transition-colors";

export const SURFACE_3D_PURCHASE_MOBILE_SHELL =
  "btn-3d btn-3d--secondary purchase-mobile-offer__shell purchase-mobile-offer__shell--3d rounded-[1.35rem] transition-colors hover:border-white/15";

export const SURFACE_3D_PURCHASE_MOBILE_SHELL_FEATURED =
  "btn-3d btn-3d--secondary btn-3d--glow-subtle purchase-mobile-offer__shell purchase-mobile-offer__shell--3d rounded-[1.35rem] transition-colors";

export const SURFACE_3D_PURCHASE_BANNER =
  "btn-3d btn-3d--primary purchase-offer__banner";
