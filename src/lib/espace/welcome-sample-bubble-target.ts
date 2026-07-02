const BUBBLE_SIZE_PX = 56;
const CHAT_FAB_SIZE_PX = 56;
const STACK_GAP_PX = 8;

export type WelcomeSampleBubbleTarget = {
  x: number;
  y: number;
  size: number;
};

function getRightInset(): number {
  return window.matchMedia("(min-width: 640px)").matches ? 24 : 16;
}

function getBottomInset(): number {
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue("env(safe-area-inset-bottom)")
    .trim();
  const safeArea = Number.parseFloat(raw) || 0;
  return Math.max(16, safeArea);
}

export function getWelcomeSampleBubbleTargetCenter(): WelcomeSampleBubbleTarget {
  if (typeof window === "undefined") {
    return { x: 0, y: 0, size: BUBBLE_SIZE_PX };
  }

  const bubble = document.querySelector<HTMLElement>(".welcome-sample-offer-bubble");
  if (bubble) {
    const rect = bubble.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
      size: BUBBLE_SIZE_PX,
    };
  }

  const stack = document.querySelector<HTMLElement>(".support-chat-stack");
  const chatFab = stack?.querySelector<HTMLElement>("button[aria-expanded]");
  if (stack && chatFab) {
    const stackRect = stack.getBoundingClientRect();
    const fabRect = chatFab.getBoundingClientRect();
    return {
      x: stackRect.right - BUBBLE_SIZE_PX / 2,
      y: fabRect.top - STACK_GAP_PX - BUBBLE_SIZE_PX / 2,
      size: BUBBLE_SIZE_PX,
    };
  }

  const rightInset = getRightInset();
  const bottomInset = getBottomInset();

  return {
    x: window.innerWidth - rightInset - BUBBLE_SIZE_PX / 2,
    y:
      window.innerHeight -
      bottomInset -
      CHAT_FAB_SIZE_PX -
      STACK_GAP_PX -
      BUBBLE_SIZE_PX / 2,
    size: BUBBLE_SIZE_PX,
  };
}
