import { Server } from 'lucide-react';
import { of, map, catchError } from 'rxjs';

export function serverwithapi(servername: string) { 
  return of(servername).pipe(
    map(name => ({
      Servername: name,
      ServerUrl: `http://${name}:3000/api/server`
    })),
  );
}
