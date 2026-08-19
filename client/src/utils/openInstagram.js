/**
 * Intenta abrir el perfil de Instagram directamente en la app nativa
 * (esquema instagram://) y, si no se puede (app no instalada, o el
 * usuario está en una computadora), cae automáticamente a la versión
 * web tras un breve instante.
 *
 * @param {string} username - handle de Instagram, sin "@"
 * @param {MouseEvent} [event] - evento de click, para evitar la
 *   navegación por defecto del <a>
 */
export function openInstagramProfile(username, event) {
  if (event) event.preventDefault();

  const webUrl = `https://www.instagram.com/${username}/`;
  const appUrl = `instagram://user?username=${username}`;

  let fallbackTriggered = false;

  function goToWeb() {
    if (fallbackTriggered) return;
    fallbackTriggered = true;
    window.location.href = webUrl;
  }

  // Si la pestaña pierde el foco (o se oculta) es señal de que la app
  // sí se abrió, así que cancelamos el fallback web.
  function handleVisibilityChange() {
    if (document.hidden) {
      fallbackTriggered = true;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    }
  }

  document.addEventListener('visibilitychange', handleVisibilityChange);

  const timer = setTimeout(() => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    goToWeb();
  }, 1200);

  window.addEventListener(
    'blur',
    () => {
      clearTimeout(timer);
      fallbackTriggered = true;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    },
    { once: true }
  );

  window.location.href = appUrl;
}
