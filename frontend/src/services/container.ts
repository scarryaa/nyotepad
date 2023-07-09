import { Service } from "./service";

export class ServiceContainer {
  _services: Map<string, Service>;

  constructor() {
    this._services = new Map();
  }

  register(name: string, service: Service) {
    this._services.set(name, service);
  }

  get(name: string): Service {
    return this._services.get(name)!;
  }
}
