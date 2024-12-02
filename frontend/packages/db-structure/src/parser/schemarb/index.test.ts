import type { Table } from 'src/schema'
import { aColumn, aDBStructure, aTable } from 'src/schema/factories'
import { describe, expect, it } from 'vitest'
import { processor } from '.'

describe(processor, () => {
  describe('should parse create_table correctry', () => {
    const userTable = (override?: Partial<Table>) =>
      aDBStructure({
        tables: {
          users: aTable({
            name: 'users',
            columns: {
              id: aColumn({ primary: true }),
              ...override?.columns,
            },
          }),
        },
      })

    it('not null', () => {
      const result = processor(/* Ruby */ `
        create_table "users" do |t|
          t.string "name", null: false
        end
      `)

      const expected = userTable({
        columns: {
          id: aColumn({ primary: true }),
          name: aColumn({
            name: 'name',
            type: 'string',
            notNull: true,
          }),
        },
      })

      expect(result).toEqual(expected)
    })

    it('nullable', () => {
      const result = processor(/* Ruby */ `
        create_table "users" do |t|
          t.string "name", null: true
        end
      `)

      const expected = userTable({
        columns: {
          id: aColumn({ primary: true }),
          name: aColumn({
            name: 'name',
            type: 'string',
            notNull: false,
          }),
        },
      })

      expect(result).toEqual(expected)
    })

    it('defalt value', () => {
      const result = processor(/* Ruby */ `
        create_table "users" do |t|
          t.string "name", default: "new user", null: true
          t.bigint "age", default: 0, null: true
          t.boolean "is_admin", default: false, null: true
        end
      `)

      const expected = userTable({
        columns: {
          id: aColumn({ primary: true }),
          name: aColumn({
            name: 'name',
            type: 'string',
            default: 'new user',
          }),
          age: aColumn({
            name: 'age',
            type: 'bigint',
            default: 0,
          }),
          is_admin: aColumn({
            name: 'is_admin',
            type: 'boolean',
            default: false,
          }),
        },
      })

      expect(result).toEqual(expected)
    })
  })
})
