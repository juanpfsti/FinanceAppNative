import React from 'react';
import { Stack } from 'expo-router';
import { Provider as PaperProvider, MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { useColorScheme, SafeAreaView, Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Ouvinte do evento de instalação do PWA (para navegadores baseados no Chromium)
if (Platform.OS === 'web' && typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    (window as any).deferredPrompt = e;
  });

  // Desregistrar Service Workers antigos que podem estar em loop de cache
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(function(registrations) {
      for (let registration of registrations) {
        registration.unregister();
        console.log('ServiceWorker desregistrado com sucesso.');
      }
    });
  }
}

// Cores personalizadas para o tema (mantendo MD3 mas customizando)
const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#6366f1',      // Indigo moderno
    primaryContainer: '#e0e7ff',
    secondary: '#8b5cf6',    // Roxo
    tertiary: '#06b6d4',     // Ciano
    outline: '#94a3b8',      // Cinza para bordas/ícones inativos
    surface: '#ffffff',
    surfaceVariant: '#f8fafc',
    background: '#f8fafc',
  },
  roundness: 12,
};

const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#818cf8',      // Indigo mais claro
    primaryContainer: '#1e1b4b',
    secondary: '#a78bfa',
    tertiary: '#22d3ee',
    outline: '#64748b',
    surface: '#1e293b',
    surfaceVariant: '#0f172a',
    background: '#0f172a',
  },
  roundness: 12,
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider theme={theme}>
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
          {Platform.OS === 'web' && (
            <style dangerouslySetInnerHTML={{ __html: `
              /* Estilo de barra de rolagem customizada e moderna apenas para desktop/mouse */
              @media (pointer: fine) {
                ::-webkit-scrollbar {
                  width: 8px;
                  height: 8px;
                }
                ::-webkit-scrollbar-track {
                  background: rgba(0,0,0,0.02);
                  border-radius: 4px;
                }
                ::-webkit-scrollbar-thumb {
                  background: ${theme.colors.primary}50;
                  border-radius: 4px;
                }
                ::-webkit-scrollbar-thumb:hover {
                  background: ${theme.colors.primary};
                }
              }
              body {
                background-color: ${theme.colors.background};
              }
            `}} />
          )}
          <Stack
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack>
        </SafeAreaView>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}