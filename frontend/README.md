# React + Vite

## Market data

The Markets section reads crypto quotes from CoinGecko and stock, forex, and index-tracking ETF quotes from Twelve Data through a small server-side proxy. Provider keys stay on the server.

1. Copy `.env.example` to `.env` and add your `COINGECKO_API_KEY` and `TWELVE_DATA_API_KEY`.
2. Run `npm run dev`. This starts the Vite frontend and market API together.

The market list loads quotes when the page opens; it does not poll automatically. The API caches provider responses for 60 seconds. The Indexes tab uses index-tracking ETFs (SPY, QQQ, and DIA), because Twelve Data currently lists direct index data as unavailable. Restart the development server after changing `.env`. To run only the API process, use `npm run api`.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
