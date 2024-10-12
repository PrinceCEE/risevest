export class BaseEntity {
  static create<T extends BaseEntity>(
    entityClass: { new (): T },
    data: Partial<T>
  ): T {
    const entity = new entityClass();

    for (const key in data) {
      entity[key] = data[key]!;
    }

    return entity;
  }
}
