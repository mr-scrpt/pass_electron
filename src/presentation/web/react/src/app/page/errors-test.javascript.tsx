/**
 * РЕАЛЬНАЯ JavaScript ошибка - TypeError
 * URL: /page/errors-test/javascript
 */
export async function loader() {
  const apiResponse = null;
  const data = apiResponse.data; // ← TypeError!
  return { data };
}

export default function JavaScriptError() {
  return null;
}
