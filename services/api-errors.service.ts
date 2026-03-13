export type ApiErrorCode =
  | "validation.required"
  | "validation.invalidEmail"
  | "validation.invalidPhone"
  | "validation.invalidCoordinates"
  | "not_found"
  | "conflict.slot_unavailable"
  | "bad_request"
  | "internal_error";

export function errorBody(code: ApiErrorCode) {
  return { success: false, errorCode: code } as const;
}

// lang is unused intentionally; client will translate using next-intl based on errorCode
export function errorResponse(
  code: ApiErrorCode,
  _lang: unknown,
  status = 400
) {
  return { body: errorBody(code), status } as const;
}

export function successResponse<T>(
  data: T,
  successCode?: string,
  meta?: Record<string, unknown>
) {
  const base: {
    success: true;
    data: T;
    successCode?: string;
    meta?: Record<string, unknown>;
  } = {
    success: true,
    data,
  };
  if (successCode) base.successCode = successCode;
  if (meta) base.meta = meta;
  return base;
}
