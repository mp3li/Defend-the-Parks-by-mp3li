import { Platform } from 'react-native';

export const PAGE_SCROLL_NATIVE_ID = 'page-scroll-container';

export function getSectionNativeId(id: string) {
  return `jump-section-${id}`;
}

export function jumpToWebSection(id: string) {
  if (Platform.OS !== 'web' || typeof document === 'undefined') {
    return false;
  }

  const element = document.getElementById(getSectionNativeId(id));
  if (!element) {
    return false;
  }

  window.requestAnimationFrame(() => {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  return true;
}
