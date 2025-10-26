//  src/presentation/web/react/src/routes/_index.tsx
import { ServiceContainer, ConsoleLogger } from '@/composition'
import { MockResourceRepository } from '../../../../../infrastructure/repositories'
import Home from "./home";

// Инициализация ServiceContainer при первом импорте
try {
  const initialized = (ServiceContainer as unknown as { initialized?: boolean }).initialized
  if (!initialized) {
    ServiceContainer.initialize({
      repository: new MockResourceRepository(),
      logger: new ConsoleLogger()
    })
  }
} catch (error) {
  console.error('Failed to initialize ServiceContainer:', error)
}

/**
 * Loader - получение данных на сервере (SSR)
 */
export async function loader() {
  // Получаем queries facade из контейнера (монадический подход)
  return ServiceContainer.getQueries()
    .asyncChain(async (queries) => {
      // Получаем список ресурсов через Query facade
      return queries.list()
    })
    .then(result => 
      result
        .map((resources) => ({ resources }))
        .mapLeft((errors) => ({ errors }))
        .value
    )
}

export default Home;
