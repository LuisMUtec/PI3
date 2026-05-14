import { createHash } from "node:crypto";

/**
 * Hash determinista e irreversible del identificador del usuario (número
 * WhatsApp) usando una sal del servidor. Permite contar conversaciones únicas
 * sin almacenar el número en claro y sin posibilidad de revertir.
 */
export function anonHash(rawIdentifier: string): string {
  const salt = process.env.ANON_HASH_SALT;
  if (!salt || salt.length < 16) {
    throw new Error(
      "ANON_HASH_SALT debe estar definido y tener al menos 16 caracteres.",
    );
  }
  return createHash("sha256")
    .update(`${salt}:${rawIdentifier.trim()}`)
    .digest("hex");
}
