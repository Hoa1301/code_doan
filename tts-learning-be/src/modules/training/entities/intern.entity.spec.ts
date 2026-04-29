import { getMetadataArgsStorage } from 'typeorm';
import { Intern } from './intern.entity';

describe('Intern entity metadata', () => {
  it('declares track as a postgres-compatible scalar column type', () => {
    const column = getMetadataArgsStorage().columns.find(
      ({ target, propertyName }) => target === Intern && propertyName === 'track',
    );

    expect(column).toEqual(
      expect.objectContaining({
        options: expect.objectContaining({
          type: 'varchar',
          nullable: true,
        }),
      }),
    );
  });
});
