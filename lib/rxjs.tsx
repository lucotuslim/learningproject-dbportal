import { of, map } from 'rxjs';
import { ApiInterface } from '@/interfaces/generic';
import { fromFetch } from 'rxjs/fetch';
import { switchMap, throwError } from 'rxjs';

export function serverwithapi(servername: string) { 
  return of(servername).pipe(
    map(name => ({
      Servername: name,
      ServerUrl: `http://${name}:3000/api/server`
    })),
  );
}

function ApiRequestRxjs<T>(fetchUrl: string,
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

export async function ApiRequest<T>(
  fetchUrl: string,
  options?: RequestInit
): Promise<ApiInterface<T>> {
  const response = await fetch(fetchUrl, options);
  if (!response.ok) throw new Error(`API error: ${response.status}`);
  return await response.json();
}
