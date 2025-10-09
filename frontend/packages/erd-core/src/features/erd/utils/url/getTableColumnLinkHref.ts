import type { QueryParam } from '../../../../schemas'
import { getTableColumnElementId } from './getTableColumnElementId'

export const getTableColumnLinkHref = (
  activeTableName: string,
  columnName: string,
) => {
  const searchParams = new URLSearchParams(window.location.search)
  searchParams.set('active' satisfies QueryParam, activeTableName)
  const targetElementId = getTableColumnElementId(activeTableName, columnName)
  return `?${searchParams.toString()}#${targetElementId}`
}
