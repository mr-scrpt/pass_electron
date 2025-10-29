//  src/presentation/web/react/src/app/page/_index.tsx
import {
  getValidatedQueries,
  type ResourceItemListDTO,
} from "@/main/composition";
import type { Validation } from "@/main/shared";
import type { IError } from "@/main/shared/errors";
import Home from "@/page/main/home";

export async function loader() {
  const queriesResult = getValidatedQueries();

  if (queriesResult.isLeft()) {
    return { errors: queriesResult.value };
  }

  const queries = queriesResult.value;
  const result: Validation<IError[], ResourceItemListDTO[]> =
    await queries.list();

  return result
    .map((resources: ResourceItemListDTO[]) => ({ resources }))
    .mapLeft((errors: IError[]) => ({ errors })).value;
}

export default Home;
