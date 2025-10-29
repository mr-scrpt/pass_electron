/**
 * РЕАЛЬНАЯ JavaScript ошибка - TypeError
 * URL: /page/errors-test/javascript
 */
export async function loader() {
  const apiResponse: any = null; // eslint-disable-line @typescript-eslint/no-explicit-any
  const data = apiResponse.data; // ← TypeError!
  return { data };
}

export default function JavaScriptError() {
  return null;
}
