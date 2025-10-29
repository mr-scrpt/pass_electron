/**
 * РЕАЛЬНАЯ Network ошибка
 * URL: /page/errors-test/network
 */
export async function loader() {
  const response = await fetch("http://localhost:9999/api/resources");
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  return await response.json();
}

export default function NetworkError() {
  return null;
}
