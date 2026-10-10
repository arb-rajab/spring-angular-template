# Frontend

Angular 20 application (standalone components, signals, strict templates).

```bash
npm ci
npm start                 # http://localhost:4200, proxies /api, /oauth2, /login to :8080
npm run lint
CHROME_BIN=/path/to/chrome npx ng test --no-watch --browsers=ChromeHeadlessCI --karma-config=karma.conf.js
npx ng build --configuration production
```

## Layout

- `src/app/core`: auth service, guards, interceptor, API models and helpers.
- `src/app/shared/ui`: reusable components (button, form field, alert, spinner,
  empty state, modal, pagination, data table), each with a spec.
- `src/app/shared/nav`: top navigation.
- `src/app/features`: routed pages (`auth`, `dashboard`, `users`, `not-found`).
