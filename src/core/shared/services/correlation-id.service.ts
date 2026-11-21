import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
@Injectable()
export class CorrelationIdService {
  private readonly asyncLocalStorage = new AsyncLocalStorage<
    Map<string, string>
  >();

  run(correlationId: string, callback: (...args: any[]) => void) {
    const store = new Map<string, string>();
    store.set('correlationId', correlationId);
    this.asyncLocalStorage.run(store, callback);
  }

  get correlationId(): string | undefined {
    const store = this.asyncLocalStorage.getStore();
    return store?.get('correlationId');
  }
}
