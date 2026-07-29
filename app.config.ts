import type { ExpoConfig } from 'expo/config';

/**
 * Configuración de la app — Forno
 *
 * Es `app.config.ts` y no `app.json` por una sola razón: el `baseUrl` de la build web.
 * GitHub Pages sirve el proyecto bajo `/app-project/`, así que el export necesita ese
 * prefijo, pero ponerlo fijo rompería `npm run web` en local. Con un config en TypeScript
 * el prefijo se activa solo cuando CI define `EXPO_PUBLIC_BASE_URL`.
 */

/** Solo lo define el workflow de GitHub Pages. En local queda vacío. */
const baseUrl = process.env.EXPO_PUBLIC_BASE_URL;

const config: ExpoConfig = {
  name: 'Forno',
  slug: 'app-project',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'forno',
  // Bloqueado en claro: el sistema de diseño de la etapa 1 tiene una sola paleta.
  // El tema oscuro es trabajo de la etapa 2 — ver docs/05-alcance-y-entregables.md.
  userInterfaceStyle: 'light',
  ios: {
    supportsTablet: true,
    // Identificador de la app en la App Store. Hace falta para cualquier build nativa.
    bundleIdentifier: 'com.forno.pizzas',
  },
  android: {
    // Identificador de la app en Google Play. Hace falta para cualquier build nativa.
    package: 'com.forno.pizzas',
    adaptiveIcon: {
      backgroundColor: '#FFF1EA',
      foregroundImage: './assets/images/android-icon-foreground.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
  },
  web: {
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    [
      'expo-splash-screen',
      {
        backgroundColor: '#F26522',
        image: './assets/images/splash-icon.png',
        imageWidth: 96,
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
    ...(baseUrl ? { baseUrl } : {}),
  },
};

export default config;
