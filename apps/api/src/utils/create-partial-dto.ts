import "reflect-metadata";
import { ApiProperty, PickType } from "@nestjs/swagger";
import { Expose } from "class-transformer";

export function createPartialDTO<
  T,
  K extends keyof T,
  O extends boolean = false,
>(ClassRef: new () => T, keys: readonly K[], makeOptional?: O) {
  type PickedType = Pick<T, K>;
  type ResultType = O extends true ? Partial<PickedType> : PickedType;

  // Use Nest's PickType to get a proper subclass with all metadata (validators, swagger, etc.)
  const BaseClass = (PickType as any)(ClassRef, keys) as new () => any;

  class PartialDTOClass extends BaseClass {
    constructor(entity?: Partial<T>) {
      super();
      if (entity) {
        (keys as K[]).forEach((key) => {
          if (entity[key] !== undefined) {
            (this as any)[key] = entity[key];
          }
        });
      }
    }

    static fromEntity(entity: T): PartialDTOClass {
      return new PartialDTOClass(entity);
    }
  }

  // Optionally override Swagger `required` and ensure @Expose is present on the final class
  keys.forEach((key) => {
    const propertyKey = key as string;

    const metadata = Reflect.getMetadata(
      "swagger/apiModelProperties",
      ClassRef.prototype,
      propertyKey,
    );
    if (metadata) {
      ApiProperty({
        ...metadata,
        required: !makeOptional,
      })(PartialDTOClass.prototype, propertyKey);
    }

    // Ensure Expose is present on the final class (even if it already exists on the base)
    Expose()(PartialDTOClass.prototype, propertyKey);
  });

  return PartialDTOClass as unknown as {
    new (entity?: Partial<T>): ResultType;
    fromEntity(entity: T): ResultType;
  };
}
