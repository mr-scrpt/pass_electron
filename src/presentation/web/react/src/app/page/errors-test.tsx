import { Outlet } from "react-router";

/**
 * Layout для тестовых страниц ошибок
 * Все дочерние роуты рендерятся в <Outlet />
 */
export default function ErrorsTestLayout() {
  return <Outlet />;
}
