export type ToastItem = { id: number; type: 'success' | 'error' | 'info'; text: string };

let items: ToastItem[] = [];
let listeners: ((items: ToastItem[]) => void)[] = [];
let counter = 0;

function emit() { listeners.forEach((l) => l(items)); }

/** Fire-and-forget toast, callable from anywhere without a context provider. Auto-dismisses. */
export function toast(text: string, type: ToastItem['type'] = 'success') {
  const id = ++counter;
  items = [...items, { id, type, text }];
  emit();
  setTimeout(() => {
    items = items.filter((t) => t.id !== id);
    emit();
  }, 3500);
}

export function getToastItems() { return items; }

export function subscribeToast(listener: (items: ToastItem[]) => void) {
  listeners.push(listener);
  return () => { listeners = listeners.filter((l) => l !== listener); };
}
