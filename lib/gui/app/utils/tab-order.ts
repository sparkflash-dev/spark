/**
 * Tab order management — ensure logical keyboard navigation flow.
 */

export interface TabStop {
  id: string;
  element: string; // CSS selector
  label: string;
  order: number;
  group?: string;
}

export const MAIN_TAB_ORDER: TabStop[] = [
  { id: 'image-select', element: '[data-step="image"]', label: 'Select Image', order: 1, group: 'main' },
  { id: 'drive-select', element: '[data-step="drive"]', label: 'Select Drive', order: 2, group: 'main' },
  { id: 'flash-button', element: '[data-step="flash"]', label: 'Flash', order: 3, group: 'main' },
  { id: 'settings-button', element: '[data-action="settings"]', label: 'Settings', order: 4, group: 'nav' },
  { id: 'help-button', element: '[data-action="help"]', label: 'Help', order: 5, group: 'nav' },
];

export function getTabStopsForGroup(group: string): TabStop[] {
  return MAIN_TAB_ORDER.filter((s) => s.group === group).sort((a, b) => a.order - b.order);
}

export function getNextTabStop(currentId: string): TabStop | null {
  const idx = MAIN_TAB_ORDER.findIndex((s) => s.id === currentId);
  if (idx === -1 || idx === MAIN_TAB_ORDER.length - 1) return null;
  return MAIN_TAB_ORDER[idx + 1];
}

export function getPreviousTabStop(currentId: string): TabStop | null {
  const idx = MAIN_TAB_ORDER.findIndex((s) => s.id === currentId);
  if (idx <= 0) return null;
  return MAIN_TAB_ORDER[idx - 1];
}
