export function getBrowserUserInfo() {
  if (typeof window === "undefined") return {};
  
  return {
    browser: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    screen_width: window.screen.width,
    screen_height: window.screen.height,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
}

export function getBrowserUserId() {
  if (typeof window === "undefined") return "anonymous";
  
  const key = "portfolio_user_id";
  try {
    let userId = localStorage.getItem(key);
    if (!userId) {
      userId = crypto.randomUUID();
      localStorage.setItem(key, userId);
    }
    return userId;
  } catch (error) {
    console.warn("localStorage access failed:", error);
    return "anonymous";
  }
}