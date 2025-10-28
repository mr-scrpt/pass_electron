// src/presentation/web/react/src/app/entry.client.tsx
import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { HydratedRouter } from "react-router/dom";

// ✅ Глобальная инициализация (DI + error handling)
import { handleGlobalError } from "./setup";

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <HydratedRouter unstable_onError={handleGlobalError} />
    </StrictMode>,
  );
});
