import { convertDBStructureToNodes } from '@/components/ERDRenderer/convertDBStructureToNodes'
import {
  replaceHiddenNodeIds,
  updateActiveTableName,
  useDBStructureStore,
} from '@/stores'
import type { Table } from '@liam-hq/db-structure'
import { GotoIcon, IconButton } from '@liam-hq/ui'
import { ReactFlowProvider, useReactFlow } from '@xyflow/react'
import { type FC, useCallback } from 'react'
import { ERDContent } from '../../../ERDContent'
import styles from './RelatedTables.module.css'
import { extractDBStructureForTable } from './extractDBStructureForTable'

type Props = {
  table: Table
}

export const RelatedTables: FC<Props> = ({ table }) => {
  const dbStructure = useDBStructureStore()
  const extractedDBStructure = extractDBStructureForTable(table, dbStructure)
  const { nodes, edges } = convertDBStructureToNodes({
    dbStructure: extractedDBStructure,
    showMode: 'TABLE_NAME',
  })
  const { getNodes } = useReactFlow()
  const handleClick = useCallback(() => {
    const visibleNodeIds: string[] = nodes.map((node) => node.id)
    const mainPaneNodes = getNodes()
    const hiddenNodeIds = mainPaneNodes
      .filter((node) => !visibleNodeIds.includes(node.id))
      .map((node) => node.id)

    replaceHiddenNodeIds(hiddenNodeIds)
    updateActiveTableName(undefined)
  }, [nodes, getNodes])

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h2 className={styles.heading}>Related tables</h2>
        <IconButton
          icon={<GotoIcon />}
          tooltipContent="Open in main area"
          onClick={handleClick}
        />
      </div>
      <div className={styles.contentWrapper}>
        <ReactFlowProvider>
          <ERDContent
            nodes={nodes}
            edges={edges}
            enabledFeatures={{ fitViewWhenActiveTableChange: false }}
          />
        </ReactFlowProvider>
      </div>
    </div>
  )
}
