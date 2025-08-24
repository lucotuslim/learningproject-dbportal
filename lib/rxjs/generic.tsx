import { ApiInterface } from '@/interfaces/generic';
import { switchMap, throwError } from 'rxjs';
import { fromFetch } from 'rxjs/fetch';

export function ApiRequestRxjs<T>(fetchUrl: string,
  options?: RequestInit) {
  return fromFetch(fetchUrl, options).pipe(
    switchMap(response => {
      if (!response.ok) {
        return throwError(() => new Error(`API error: ${response.status}`));
      }
      return response.json() as Promise<ApiInterface<T>>;
    })
  );
}