import type { CookieOptions, Request } from "express";

  // const _LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

// @ts-ignore - kept for future use
function _isIpAddress(host: string) {
  // Basic IPv4 check and IPv6 presence detection.
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return true;
  return host.includes(":");
}

function isSecureRequest(req: Request) {
  if (req.protocol === "https") return true;

  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;

  const protoList = Array.isArray(forwardedProto)
    ? forwardedProto
    : forwardedProto.split(",");

  return protoList.some(proto => proto.trim().toLowerCase() === "https");
}

export function getSessionCookieOptions(
  req: Request
): Pick<CookieOptions, "domain" | "httpOnly" | "path" | "sameSite" | "secure"> {
  const isSecure = isSecureRequest(req);

  // SameSite strategy:
  // - HTTPS (direct ou via proxy) → SameSite=none + Secure=true
  //   Requis quand le front et l'API sont sur des domaines différents (proxy ngrok/Manus)
  //   Sans ça, le cookie session n'est pas envoyé sur les requêtes cross-site → "session vide"
  // - HTTP local (dev sans proxy) → SameSite=lax + Secure=false
  //   SameSite=none requiert Secure=true — impossible en HTTP pur
  const sameSite: "none" | "lax" = isSecure ? "none" : "lax";

  return {
    domain: undefined,
    httpOnly: true,
    path: "/",
    sameSite,
    secure: isSecure,
  };
}
