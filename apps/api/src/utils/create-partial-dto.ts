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

  class PartialDTOClass {
    constructor(entity: Partial<T>) {
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

  // ---- PickType integration (bypass TS generics) ----
  // This avoids: readonly never[] / keyof T & string errors
  const PickedTypeClass = (PickType as any)(ClassRef, keys) as new () => any;

  // Copy instance members and decorators, but DO NOT overwrite constructor
  const descriptors = Object.getOwnPropertyDescriptors(
    PickedTypeClass.prototype,
  );
  for (const [name, desc] of Object.entries(descriptors)) {
    if (name === "constructor") continue;
    Object.defineProperty(PartialDTOClass.prototype, name, desc);
  }

  // ---- Swagger + Expose integration ----
  keys.forEach((key) => {
    const propertyKey = key as string;

    // Copy original ApiProperty metadata
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

    // Needed for class-transformer + excludeExtraneousValues
    Expose()(PartialDTOClass.prototype, propertyKey);
  });

  return PartialDTOClass as unknown as {
    new (entity: Partial<T>): ResultType;
    fromEntity(entity: T): ResultType;
  };
}
