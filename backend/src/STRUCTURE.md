# Backend Structure (Clean Architecture)

Padrão: **Camada → Feature → arquivos**.

## Camadas
- `Domain/`: entidades, enums, interfaces (ex.: `IProductRepository`).
- `Application/`: use cases e DTOs.
- `Infrastructure/`: Mongoose schemas, repositórios concretos, JWT/Hasher, tenancy context.
- `Presentation/`: Controllers/Guards/Decorators e módulos do Nest (composition root).
- `Shared/`: tokens de IoC e itens transversais.

## Tokens (IoC)
Os tokens são padronizados em `Shared/IoC/tokens.ts` usando `Symbol()` com o mesmo nome da interface, ex.: `TOKENS.IProductRepository`.

