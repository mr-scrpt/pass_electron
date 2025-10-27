//  src/presentation/web/react/src/routes/_index.tsx
import { ServiceContainer } from '@/composition'
import Home from "./home";

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
