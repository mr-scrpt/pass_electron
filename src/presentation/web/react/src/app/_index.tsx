//  src/presentation/web/react/src/app/_index.tsx
import { getValidatedQueries, type QueryFacade } from "@/main/composition";
import type { Validation } from "@/main/shared";
import type { IError } from "@/main/shared/errors";
import type { ResourceItemListDTO } from "@/main/application/queries";
import Home from "./home";

export async function loader() {
  // ✅ Получаем QueryFacade из композиции
  const queriesResult = getValidatedQueries();
  
  // ✅ Если ошибка при получении queries - возвращаем ее
  if (queriesResult.isLeft()) {
    return { errors: queriesResult.value };
  }
  
  // ✅ Выполняем запрос
  const queries = queriesResult.value as QueryFacade;
  const result: Validation<IError[], ResourceItemListDTO[]> = await queries.list();
  
  // ✅ Преобразуем результат в формат для loader
  return result
    .map((resources: ResourceItemListDTO[]) => ({ resources }))
    .mapLeft((errors: IError[]) => ({ errors }))
    .value;
}

export default Home;
