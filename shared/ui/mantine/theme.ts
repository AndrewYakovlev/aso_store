import { createTheme } from '@mantine/core';

export const theme = createTheme({
  primaryColor: 'blue',
  primaryShade: 6,
  defaultRadius: 'md',
  cursorType: 'pointer',
  
  fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji',
  fontFamilyMonospace: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
  
  headings: {
    fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji',
    fontWeight: '600',
  },
  
  colors: {
    // Можно добавить кастомные цвета
  },
  
  other: {
    // Дополнительные настройки темы
  },
});