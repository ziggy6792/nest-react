import { ApiProperty, PickType } from '@nestjs/swagger';
import { Type } from '@nestjs/common';

export function createPartialDTO<
  T extends object,
  K extends keyof T,
  O extends boolean = false,
>(ClassRef: Type<T>, keys: readonly K[], makeOptional?: O) {
  type PickedType = Pick<T, K>;
  type ResultType = O extends true ? Partial<PickedType> : PickedType;

  // Let Nest build a proper class with all decorators.
  // We cast to `Type<any>` to keep the `extends` happy.
  const BasePicked = PickType(
    ClassRef as Type<any>,
    keys as readonly (string | number | symbol)[],
  ) as Type<any>;

  class PartialDTOClass extends BasePicked {
    constructor(entity: Partial<T>) {
      super();
      if (!entity) return;

      (keys as K[]).forEach((key) => {
        if (entity[key] !== undefined) {
          (this as any)[key] = entity[key];
        }
      });
    }

    static fromEntity(entity: T): PartialDTOClass {
      return new PartialDTOClass(entity);
    }
  }

  // Adjust Swagger metadata (only the "required" flag).
  keys.forEach((key) => {
    const propertyKey = key as string;

    const swaggerMeta = Reflect.getMetadata(
      'swagger/apiModelProperties',
      ClassRef.prototype,
      propertyKey,
    );

    if (swaggerMeta) {
      ApiProperty({
        ...swaggerMeta,
        // If makeOptional is true, mark not required; otherwise leave as-is.
        required:
          makeOptional === true ? false : (swaggerMeta.required ?? true),
      })(PartialDTOClass.prototype, propertyKey);
    }
  });

  return PartialDTOClass as unknown as {
    new (entity: Partial<T>): ResultType;
    fromEntity(entity: T): ResultType;
  };
}
