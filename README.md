# Control de Gastos (Personal + Barbería)

App PWA para registrar gastos e ingresos separados por espacio (Personal / Barbería), con backup opcional a Google Sheets.

## Stack

- **Vite** + **React 18** + **TypeScript**
- **Tailwind CSS** v3
- **Firebase** (Auth + Firestore) — plan Spark (gratis)
- **Zustand** para estado
- **Recharts** para gráficas
- **vite-plugin-pwa** para PWA
- **Vercel** para deploy

## Setup local

1. Clonar e instalar:
   ```bash
   npm install
   ```

2. Crear proyecto en [Firebase Console](https://console.firebase.google.com):
   - Habilitar **Authentication → Email/Password**
   - Crear base de datos **Firestore** (modo producción, región southamerica-east1)
   - Copiar credenciales del SDK web

3. Copiar `.env.example` a `.env.local` y llenar las variables:
   ```
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   VITE_GOOGLE_OAUTH_CLIENT_ID=...   # opcional, para backup a Drive
   ```

4. Desplegar reglas e índices de Firestore:
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase deploy --only firestore:rules,firestore:indexes
   ```

5. Correr en desarrollo:
   ```bash
   npm run dev
   ```
   Abre [http://localhost:5173](http://localhost:5173).

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run preview` | Preview del build local |
| `npm run typecheck` | Verificar tipos TS |
| `npm run lint` | Linter (si configurado) |

## Estructura

```
src/
├── components/        # UI compartido (AppLayout, Toaster)
├── features/          # código por dominio
│   ├── auth/          # login, useAuth
│   ├── spaces/        # selector de espacio, settings
│   ├── transactions/  # dashboard, history, form
│   ├── categories/    # CRUD categorías
│   ├── budgets/       # presupuestos
│   ├── reports/       # gráficas
│   └── drive/         # OAuth + sync Google Sheets (opcional)
├── lib/               # firebase, format, seed, cn
├── stores/            # zustand (auth, space, ui)
├── types/             # modelos TS
├── routes/            # AppRouter, ProtectedRoute
├── App.tsx
└── main.tsx
```

## Deploy en Vercel

1. Push a GitHub
2. Crear proyecto en [vercel.com](https://vercel.com) → Import desde GitHub
3. Vercel detecta Vite automáticamente
4. Configurar env vars en Vercel Dashboard (mismas que `.env.local`)
5. Deploy automático en cada push a `main`

## Modelo de datos

```
users/{uid}
├── profile              # datos del usuario
├── transactions/{id}    # ingresos/gastos
├── categorias/{id}      # categorías por espacio
└── presupuestos/{id}    # presupuestos mensuales
```

Las reglas de seguridad en `firestore.rules` restringen acceso: solo el dueño puede leer/escribir sus datos.

> **Nota**: la feature de recibos con foto quedó fuera de v1 (requiere Firebase Storage, plan de pago en este caso). Se puede agregar en una v2 con un servicio alternativo de almacenamiento o el plan Blaze.

## Iconos

El ícono es un monedero genérico. Para regenerar los PNGs:
```bash
powershell -ExecutionPolicy Bypass -File public/icons/generate-icons.ps1
```

## Roadmap

Ver plan en [docs/PLAN.md](docs/PLAN.md) (próximamente).
