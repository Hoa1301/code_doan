import { Injectable, Logger } from '@nestjs/common';
import { Server } from 'socket.io';

@Injectable()
export class SocketService {
  private readonly logger = new Logger(SocketService.name);
  private server?: Server;

  setServer(server: Server): void {
    this.server = server;
  }

  emit<TPayload>(event: string, payload: TPayload): void {
    if (!this.server) {
      this.logger.warn(`[SocketService] Server is not initialized. Event "${event}" was not emitted.`);
      return;
    }

    this.server.emit(event, payload);
  }
}
