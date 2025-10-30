/**
 * Constantes e enums para padronização de parâmetros da API
 */

export enum SearchParams {
  QUERY = 'q',
  TERM = 'term',
  FIELDS = 'fields',
  SIZE = 'size',
}

export enum SearchFields {
  FIRST_NAME = 'first_name',
  LAST_NAME = 'last_name',
  EMAIL = 'email',
}

export const DEFAULT_SEARCH_FIELDS: string[] = [
  SearchFields.FIRST_NAME,
  SearchFields.LAST_NAME,
  SearchFields.EMAIL,
];

export enum ApiEndpoints {
  EXTERNAL_API = '/api',
  SAVE = '/save',
  LIST = '/',
  SEARCH = '/search',
  USER_BY_ID = '/:id',
}

export enum HttpMethods {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
}

export enum ResponseStatus {
  SUCCESS = 'success',
  ERROR = 'error',
}

