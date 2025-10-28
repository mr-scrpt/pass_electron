import { ServiceContainer as ServiceContainerClass } from "./ServiceContainer";

export { ServiceContainer } from "./ServiceContainer";
export { ConsoleLogger } from "./ConsoleLogger";
export { BaseModule } from "./modules/BaseModule";
export { ResourceModule } from "./modules/ResourceModule";
export { SystemModule } from "./modules/SystemModule";
export { QueryFacade } from "./queries";
export { CommandFacade } from "./commands";

export function getQueries() {
  const result = ServiceContainerClass.getQueries();

  if (result.isLeft()) {
    throw new Error("ServiceContainer not initialized");
  }

  return result.value;
}

export function getCommands() {
  const result = ServiceContainerClass.getCommands();

  if (result.isLeft()) {
    throw new Error("ServiceContainer not initialized");
  }

  return result.value;
}

export const queries = {
  list: () => getQueries().list(),
};

export const commands = {
  createResource: (params: {
    namespace: string;
    name: string;
    secret: string;
  }) => getCommands().createResource(params),
};
