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
  NAME_FIRST = 'name.first',
  NAME_LAST = 'name.last',
  EMAIL = 'email',
}

export const DEFAULT_SEARCH_FIELDS: string[] = [
  SearchFields.NAME_FIRST,
  SearchFields.NAME_LAST,
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

