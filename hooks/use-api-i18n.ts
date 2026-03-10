/**
 * Hook personalizado para manejar i18n en llamadas a API
 *
 * Este hook permite usar las traducciones de next-intl en el frontend
 * y enviar el idioma correcto a las API routes usando las funciones nativas.
 */

import { useCallback } from "react";
import { useLocale } from "next-intl";
import { readJsonResponse } from "@/lib/utils/read-json-response";

type ApiSuccess<T = unknown> = { success: true; data: T; successCode?: string };
type ApiFailure = { success: false; errorCode: string };
export type ApiResult<T = unknown> = ApiSuccess<T> | ApiFailure;

export function useApiI18n() {
  const locale = useLocale();

  /**
   * Función para hacer llamadas a API con i18n
   */
  const apiCall = useCallback(
    async <T = unknown>(
      url: string,
      options: RequestInit = {}
    ): Promise<ApiResult<T>> => {
      // Agregar el idioma a los headers o body según sea necesario
      const headers = {
        "Content-Type": "application/json",
        "Accept-Language": locale,
        ...options.headers,
      } as Record<string, string>;

      // Si es una petición POST/PUT/PATCH, agregar el idioma al body
      let body = options.body;
      if (
        options.method &&
        ["POST", "PUT", "PATCH"].includes(options.method.toUpperCase())
      ) {
        if (body && typeof body === "string") {
          try {
            const bodyObj = JSON.parse(body);
            bodyObj.language = locale;
            body = JSON.stringify(bodyObj);
          } catch {
            // Ignorar si no es JSON
          }
        }
      }

      const response = await fetch(url, {
        ...options,
        headers,
        body,
      });

      const data = await readJsonResponse<Record<string, unknown>>(response);

      if (!response.ok) {
        const errorCode =
          typeof data?.errorCode === "string" ? data.errorCode : "internal_error";
        return { success: false, errorCode };
      }

      const payload = (data?.data ?? data) as T;
      const successCode =
        typeof data?.successCode === "string" ? data.successCode : undefined;
      return successCode ?
          { success: true, data: payload, successCode }
        : { success: true, data: payload };
    },
    [locale]
  );

  return {
    locale,
    apiCall,
  };
}
