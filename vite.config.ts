import { defineConfig } from 'vite';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// ✅ BLOC 4 FIX : @vitejs/plugin-react (^5.0.4) et rollup-plugin-visualizer (^6.0.5) incluent leurs types.
// Si erreurs de modules persistent, exécuter : pnpm add -D @types/rollup-plugin-visualizer
// @ts-ignore
import react from '@vitejs/plugin-react';
// ✅ FIX CSS : Plugin Tailwind CSS v4 pour Vite (génère les classes utilitaires)
import tailwindcss from '@tailwindcss/vite';
// @ts-ignore
import { visualizer } from 'rollup-plugin-visualizer';
// ✅ BLOC 4 FIX : vite-plugin-compression n'a pas de types officiels @types/.
// Le cast 'as any' évite les erreurs TS2307/TS7016 sur les modules sans déclarations de types.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// @ts-ignore
import viteCompressionPlugin from 'vite-plugin-compression';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const viteCompression = viteCompressionPlugin as typeof viteCompressionPlugin;


export default defineConfig(() => {
  return {
    plugins: [
      // ✅ FIX CSS : Tailwind CSS v4 plugin - doit être avant react()
      tailwindcss(),
      react({
        // Optimisation JSX runtime
        jsxRuntime: 'automatic',
      }),
      // Compression Gzip
      viteCompression({
        verbose: true,
        disable: false,
        threshold: 10240,
        algorithm: 'gzip',
        ext: '.gz',
      }),
      // Compression Brotli (meilleure compression)
      viteCompression({
        verbose: true,
        disable: false,
        threshold: 10240,
        algorithm: 'brotliCompress',
        ext: '.br',
      }),
      // Visualisation du bundle (optionnel, pour analyse)
      visualizer({
        filename: './dist/stats.html',
        open: false,
        gzipSize: true,
        brotliSize: true,
      }),
    ],
    
    root: './client',
    
    publicDir: 'public',
    
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './client/src'),
        '@shared': path.resolve(__dirname, './shared'),
      },
    },
    
    build: {
      outDir: '../dist/public',
      emptyOutDir: true,
      sourcemap: false, // Désactiver les sourcemaps en production pour réduire la taille
      
      // Optimisation de la minification
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true, // Supprime les console.log en production
          drop_debugger: true,
          pure_funcs: ['console.log', 'console.info', 'console.debug'],
          passes: 2, // Deux passes de compression
        },
        mangle: {
          safari10: true,
        },
        format: {
          comments: false, // Supprime tous les commentaires
        },
      },
      
      // Configuration du chunking intelligent
      rollupOptions: {
        output: {
          // Stratégie de chunking avancée
          manualChunks: (id) => {
            // Chunk vendor pour les dépendances node_modules
            if (id.includes('node_modules')) {
              // React core + tRPC + React Query dans un seul chunk (évite les dépendances circulaires)
              if ((id.includes('react') || id.includes('@trpc') || id.includes('@tanstack/react-query') || id.includes('superjson') || id.includes('wouter')) && !id.includes('@radix-ui')) {
                return 'react-vendor';
              }
              
              // Radix UI - séparé car lourd
              if (id.includes('@radix-ui')) {
                return 'radix-vendor';
              }
              
              // Recharts - lazy loadé uniquement sur les dashboards
              if (id.includes('recharts') || id.includes('d3-')) {
                return 'charts-vendor';
              }
              
              // Framer Motion - animations
              if (id.includes('framer-motion')) {
                return 'animation-vendor';
              }
              
              // Icônes Lucide
              if (id.includes('lucide-react')) {
                return 'icons-vendor';
              }
              
              // i18n
              if (id.includes('i18next') || id.includes('react-i18next')) {
                return 'i18n-vendor';
              }
              
              // Forms et validation
              if (id.includes('react-hook-form') || id.includes('zod') || id.includes('@hookform')) {
                return 'forms-vendor';
              }
              
              // Sentry monitoring
              if (id.includes('@sentry')) {
                return 'sentry-vendor';
              }
              
              // Stripe payment
              if (id.includes('@stripe')) {
                return 'stripe-vendor';
              }
              
              // DnD Kit
              if (id.includes('@dnd-kit')) {
                return 'dnd-vendor';
              }
              
              // Date utilities
              if (id.includes('date-fns')) {
                return 'date-vendor';
              }
              
              // Autres dépendances communes
              if (id.includes('node_modules')) {
                return 'vendor';
              }
              return undefined;
            }
            
            // Chunking par fonctionnalité métier
            if (id.includes('/pages/')) {
              const pageName = id.split("/pages/")?.[1]?.split(".")?.[0];
              if (pageName) {
                return `page-${pageName}`;
              }
            }
            
            // Composants UI séparés
            if (id.includes('/components/ui/')) {
              return 'ui-components';
            }
            
            // Dashboards séparés (lourds)
            if (id.includes('Dashboard') && !id.includes('DashboardLayout')) {
              return 'dashboards';
            }
            
            // ✅ BLOC 4 FIX (TS7030) : Retour explicite undefined pour les chemins de code non couverts
            return undefined;
          },
          
          // Nommage des chunks avec hash pour cache busting
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: (assetInfo) => {
            // ✅ BLOC 4 FIX (TS6133) : Utilisation directe de l'extension sans variable intermédiaire
            const ext = assetInfo.name?.split('.').pop();
            
            if (/\.(png|jpe?g|svg|gif|webp|avif)$/i.test(assetInfo.name || '')) {
              return 'assets/images/[name]-[hash][extname]';
            }
            
            if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name || '')) {
              return 'assets/fonts/[name]-[hash][extname]';
            }
            
            if (ext === 'css') {
              return 'assets/css/[name]-[hash][extname]';
            }
            
            return 'assets/[name]-[hash][extname]';
          },
        },
                // Optimisation de la taille des chunks (warning)
      onwarn(warning, warn) {
          // Ignorer les warnings de taille de chunk (on les gère avec le splitting)
          if (warning.code === 'CIRCULAR_DEPENDENCY') {
            console.warn('[Vite] Circular dependency detected (expected):', warning.importer);
            return;
          }
          warn(warning);
        },},
      
      // Optimisation de la taille des chunks (warning)
      chunkSizeWarningLimit: 1000, // 1MB
      
      // Optimisation des assets
      assetsInlineLimit: 4096, // 4KB - inline les petits assets en base64
      
      // CSS code splitting
      cssCodeSplit: true,
      
      // Report de la taille compressée
      reportCompressedSize: true,
    },
    
    // Optimisation des dépendances - désactivée pour contourner les problèmes de résolution
    // optimizeDeps: {
    //   include: ['react', 'react-dom', 'wouter'],
    //   exclude: ['recharts', 'framer-motion', '@tanstack/react-query', '@trpc/client', '@trpc/react-query'],
    // },
    
    // Configuration du serveur de dev
    server: {
      port: 5000,
      strictPort: false,
      allowedHosts: true,
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
        },
      },
    },
    
    // Preview (production locale)
    preview: {
      port: 5000,
      strictPort: false,
    },
  };
});
