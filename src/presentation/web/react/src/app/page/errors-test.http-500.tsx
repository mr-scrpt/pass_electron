/**
 * РЕАЛЬНАЯ HTTP 500 ошибка
 * URL: /page/errors-test/http-500
 */
export async function loader() {
  throw new Response("Internal Server Error: Database connection failed", {
    status: 500,
    statusText: "Internal Server Error",
  });
}

export default function Http500() {
  return null;
}
