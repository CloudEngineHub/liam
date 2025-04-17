import path from 'node:path'
import { TabsContent, TabsRoot } from '@/components'
import { createClient } from '@/libs/db/server'
import { parse, setPrismWasmUrl } from '@liam-hq/db-structure/parser'
import { getFileContent } from '@liam-hq/github'
import * as Sentry from '@sentry/nextjs'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import type { ComponentProps, FC } from 'react'
import { ERDEditor } from './components/ERDEditor'
import { SchemaHeader } from './components/SchemaHeader'
import { DEFAULT_SCHEMA_TAB, SCHEMA_TAB } from './constants'
import { safeApplySchemaOverride } from './utils/safeApplySchemaOverride'

type Params = {
  projectId: string
  branchOrCommit: string
  schemaFilePath: string
}

type Response = ComponentProps<typeof ERDEditor>

async function getERDEditorContent({
  projectId,
  branchOrCommit,
  schemaFilePath,
}: Params): Promise<Response> {
  const blankSchema = { tables: {}, relationships: {}, tableGroups: {} }
  const supabase = await createClient()

  const { data: project } = await supabase
    .from('Project')
    .select(`
        *,
        ProjectRepositoryMapping:ProjectRepositoryMapping(
          *,
          Repository:Repository(
            name, owner, installationId
          )
        )
      `)
    .eq('id', Number(projectId))
    .single()

  const { data: gitHubSchemaFilePath } = await supabase
    .from('GitHubSchemaFilePath')
    .select('path, format')
    .eq('projectId', Number(projectId))
    .eq('path', schemaFilePath)
    .single()

  const repository = project?.ProjectRepositoryMapping[0].Repository
  if (!repository?.installationId || !repository.owner || !repository.name) {
    console.error('Repository information not found')
    return notFound()
  }

  const repositoryFullName = `${repository.owner}/${repository.name}`
  const { content } = await getFileContent(
    repositoryFullName,
    schemaFilePath,
    branchOrCommit,
    Number(repository.installationId),
  )

  if (!content) {
    return {
      schema: blankSchema,
      defaultSidebarOpen: false,
      errorObjects: [
        {
          name: 'FileNotFound',
          message: 'The specified file could not be found in the repository.',
          instruction:
            'Please check the file path and branch/commit reference.',
        },
      ],
    }
  }

  setPrismWasmUrl(path.resolve(process.cwd(), 'prism.wasm'))

  if (!gitHubSchemaFilePath?.format) {
    return {
      schema: blankSchema,
      defaultSidebarOpen: false,
      errorObjects: [
        {
          name: 'FormatError',
          message: 'Record not found',
          instruction: 'Please make sure that the schema file exists.',
        },
      ],
    }
  }

  const format = gitHubSchemaFilePath.format
  const { value: schema, errors } = await parse(content, format)

  for (const error of errors) {
    Sentry.captureException(error)
  }

  const { result, error: overrideError } = await safeApplySchemaOverride(
    repositoryFullName,
    branchOrCommit,
    Number(repository.installationId),
    schema,
  )

  if (overrideError) {
    return {
      schema: blankSchema,
      defaultSidebarOpen: false,
      errorObjects: [overrideError],
    }
  }

  const { schema: overriddenSchema, tableGroups } = result || {
    schema,
    tableGroups: {},
  }
  const cookieStore = await cookies()
  const defaultSidebarOpen = cookieStore.get('sidebar:state')?.value === 'true'
  const layoutCookie = cookieStore.get('panels:layout')
  const defaultPanelSizes = (() => {
    if (!layoutCookie) return [20, 80]
    try {
      const sizes = JSON.parse(layoutCookie.value)
      if (Array.isArray(sizes) && sizes.length >= 2) return sizes
    } catch {}
    return [20, 80]
  })()

  return {
    schema: overriddenSchema,
    tableGroups,
    defaultSidebarOpen,
    defaultPanelSizes,
    errorObjects: errors.map((error) => ({
      name: error.name,
      message: error.message,
    })),
    projectId,
    branchOrCommit,
  }
}

type Props = {
  projectId: string
  branchOrCommit: string
  schemaFilePath: string
}

export const SchemaPage: FC<Props> = async ({
  projectId,
  branchOrCommit,
  schemaFilePath,
}) => {
  const contentProps = await getERDEditorContent({
    projectId,
    branchOrCommit,
    schemaFilePath,
  })

  return (
    <TabsRoot defaultValue={DEFAULT_SCHEMA_TAB}>
      <SchemaHeader />
      <TabsContent value={SCHEMA_TAB.ERD}>
        <ERDEditor {...contentProps} />
      </TabsContent>
      <TabsContent value={SCHEMA_TAB.EDITOR}>Override Editor</TabsContent>
    </TabsRoot>
  )
}
