import {
  type Table,
  aColumn,
  aDBStructure,
  aTable,
  anIndex,
} from '../../schema/index.js'

const userTable = (override?: Partial<Table>) =>
  aDBStructure({
    tables: {
      users: aTable({
        name: 'users',
        columns: {
          id: aColumn({
            name: 'id',
            type: 'bigserial',
            notNull: true,
            primary: true,
            unique: true,
          }),
          ...override?.columns,
        },
        indices: {
          ...override?.indices,
        },
        comment: override?.comment ?? null,
      }),
    },
  })

export const parserTestCases = {
  'table comment': userTable({
    comment: 'store our users.',
  }),
  'column comment': userTable({
    columns: {
      description: aColumn({
        name: 'description',
        type: 'text',
        comment: 'this is description',
      }),
    },
  }),
  'not null': userTable({
    columns: {
      name: aColumn({
        name: 'name',
        type: 'varchar',
        notNull: true,
      }),
    },
  }),
  nullable: userTable({
    columns: {
      description: aColumn({
        name: 'description',
        type: 'text',
        notNull: false,
      }),
    },
  }),
  'default value as string': userTable({
    columns: {
      description: aColumn({
        name: 'description',
        type: 'text',
        default: "user's description",
      }),
    },
  }),
  'default value as integer': userTable({
    columns: {
      age: aColumn({
        name: 'age',
        type: 'int4',
        default: 30,
      }),
    },
  }),
  'default value as boolean': userTable({
    columns: {
      active: aColumn({
        name: 'active',
        type: 'bool',
        default: true,
      }),
    },
  }),
  unique: userTable({
    columns: {
      mention: aColumn({
        name: 'mention',
        type: 'text',
        unique: true,
      }),
    },
  }),
  'index (unique: false)': userTable({
    columns: {
      email: aColumn({
        name: 'email',
      }),
    },
    indices: {
      index_users_on_id_and_email: anIndex({
        name: 'index_users_on_id_and_email',
        unique: false,
        columns: ['id', 'email'],
      }),
    },
  }),
}
