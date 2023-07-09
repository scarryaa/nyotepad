import { Service } from "./service";
export declare class ServiceContainer {
    _services: Map<string, Service>;
    constructor();
    register(name: string, service: Service): void;
    get(name: string): Service;
}
