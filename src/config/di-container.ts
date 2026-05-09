// Dependency injection container setup.
// Currently using manual constructor injection throughout the application.
// TypeDI container is imported via reflect-metadata in server.ts.
//
// To register a service: Container.set(ServiceToken, new ServiceImpl())
// To resolve: Container.get(ServiceToken)
//
// All handler instantiation is done inside route files using
// direct constructor calls — see src/api/routes/*.routes.ts

export {};
