import { HttpResponse, http } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import {
  fetchSchemaFromGitHubFolder,
  isGitHubFolderUrl,
  parseGitHubFolderUrl,
} from './githubUrlHandler'

// Setup MSW server
const server = setupServer()

describe('githubUrlHandler', () => {
  beforeAll(() => server.listen())
  afterEach(() => server.resetHandlers())
  afterAll(() => server.close())

  describe('isGitHubFolderUrl', () => {
    it('should return true for GitHub folder URLs', () => {
      const validUrls = [
        'https://github.com/user/repo/tree/main/schemas',
        'https://github.com/user/repo/tree/develop/db',
        'https://github.com/user/repo/tree/feature/migrations',
      ]

      for (const url of validUrls) {
        expect(isGitHubFolderUrl(url)).toBe(true)
      }
    })

    it('should return false for non-GitHub folder URLs', () => {
      const invalidUrls = [
        'https://github.com/user/repo/blob/main/schema.sql',
        'https://example.com/folder',
        'not-a-url',
        'https://github.com/user/repo',
      ]

      for (const url of invalidUrls) {
        expect(isGitHubFolderUrl(url)).toBe(false)
      }
    })
  })

  describe('parseGitHubFolderUrl', () => {
    it('should parse valid GitHub folder URLs', () => {
      const url = 'https://github.com/user/repo/tree/main/schemas/db'
      const result = parseGitHubFolderUrl(url)

      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
        expect(result.value).toEqual({
          owner: 'user',
          repo: 'repo',
          branch: 'main',
          path: 'schemas/db',
        })
      }
    })

    it('should handle URLs with query parameters', () => {
      const url = 'https://github.com/org/repo/tree/main?tab=readme-ov-file'
      const result = parseGitHubFolderUrl(url)

      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
        expect(result.value).toEqual({
          owner: 'org',
          repo: 'repo',
          branch: 'main',
          path: '',
        })
      }
    })

    it('should handle URLs with query parameters and paths', () => {
      const url =
        'https://github.com/org/repo/tree/main/schemas?tab=readme-ov-file'
      const result = parseGitHubFolderUrl(url)

      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
        expect(result.value).toEqual({
          owner: 'org',
          repo: 'repo',
          branch: 'main',
          path: 'schemas',
        })
      }
    })

    it('should return error for invalid URLs', () => {
      const invalidUrls = [
        'https://github.com/user/repo/blob/main/file.sql',
        'https://github.com/user/repo/tree/', // Missing branch
        'invalid-url',
      ]

      for (const url of invalidUrls) {
        const result = parseGitHubFolderUrl(url)
        expect(result.isErr()).toBe(true)
      }
    })
  })

  describe('fetchSchemaFromGitHubFolder', () => {
    it('should fetch and combine schema files from GitHub folder', async () => {
      const url = 'https://github.com/user/repo/tree/main/schemas'

      // Mock GitHub API response
      const mockApiResponse = [
        {
          type: 'file',
          name: 'users.sql',
          path: 'schemas/users.sql',
          download_url:
            'https://raw.githubusercontent.com/user/repo/main/schemas/users.sql',
        },
        {
          type: 'file',
          name: 'posts.sql',
          path: 'schemas/posts.sql',
          download_url:
            'https://raw.githubusercontent.com/user/repo/main/schemas/posts.sql',
        },
        {
          type: 'file',
          name: 'README.md',
          path: 'schemas/README.md',
          download_url:
            'https://raw.githubusercontent.com/user/repo/main/schemas/README.md',
        },
      ]

      const mockUsersSql = 'CREATE TABLE users (id INT PRIMARY KEY);'
      const mockPostsSql = 'CREATE TABLE posts (id INT PRIMARY KEY);'

      // Setup MSW handlers for this test
      server.use(
        http.get(
          'https://api.github.com/repos/user/repo/contents/schemas',
          () => {
            return HttpResponse.json(mockApiResponse)
          },
        ),
        http.get(
          'https://raw.githubusercontent.com/user/repo/main/schemas/users.sql',
          () => {
            return HttpResponse.text(mockUsersSql)
          },
        ),
        http.get(
          'https://raw.githubusercontent.com/user/repo/main/schemas/posts.sql',
          () => {
            return HttpResponse.text(mockPostsSql)
          },
        ),
      )

      const result = await fetchSchemaFromGitHubFolder(url)

      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
        expect(result.value.content).toBe(
          `\n// --- File 1 ---\n${mockUsersSql}\n\n\n// --- File 2 ---\n${mockPostsSql}`,
        )
        expect(result.value.detectedFormat).toBe('postgres')
      }
    })

    it('should return error for invalid URL', async () => {
      const result = await fetchSchemaFromGitHubFolder('invalid-url')

      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error?.message).toBe('Invalid URL')
      }
    })

    it('should handle GitHub API errors', async () => {
      const url = 'https://github.com/user/repo/tree/main/nonexistent'

      server.use(
        http.get(
          'https://api.github.com/repos/user/repo/contents/nonexistent',
          () => {
            return HttpResponse.text('Not Found', { status: 404 })
          },
        ),
      )

      const result = await fetchSchemaFromGitHubFolder(url)

      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.message).toContain('No schema files found')
      }
    })

    it('should return error when no schema files found', async () => {
      const url = 'https://github.com/user/repo/tree/main/docs'

      const mockApiResponse = [
        {
          type: 'file',
          name: 'README.md',
          path: 'docs/README.md',
          download_url:
            'https://raw.githubusercontent.com/user/repo/main/docs/README.md',
        },
      ]

      server.use(
        http.get('https://api.github.com/repos/user/repo/contents/docs', () => {
          return HttpResponse.json(mockApiResponse)
        }),
      )

      const result = await fetchSchemaFromGitHubFolder(url)

      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.message).toBe(
          'No schema files found in the specified folder',
        )
      }
    })

    it('should skip excluded files like index.ts', async () => {
      const url = 'https://github.com/user/repo/tree/main/schemas'

      const mockApiResponse = [
        {
          type: 'file',
          name: 'index.ts',
          path: 'schemas/index.ts',
          download_url:
            'https://raw.githubusercontent.com/user/repo/main/schemas/index.ts',
        },
        {
          type: 'file',
          name: 'schema.sql',
          path: 'schemas/schema.sql',
          download_url:
            'https://raw.githubusercontent.com/user/repo/main/schemas/schema.sql',
        },
      ]

      const mockSchemaSql = 'CREATE TABLE test (id INT);'

      server.use(
        http.get(
          'https://api.github.com/repos/user/repo/contents/schemas',
          () => {
            return HttpResponse.json(mockApiResponse)
          },
        ),
        http.get(
          'https://raw.githubusercontent.com/user/repo/main/schemas/schema.sql',
          () => {
            return HttpResponse.text(mockSchemaSql)
          },
        ),
      )

      const result = await fetchSchemaFromGitHubFolder(url)

      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
        expect(result.value.content).not.toContain('export')
        expect(result.value.content).toContain('CREATE TABLE test')
      }
    })

    it('should detect format from multiple file types', async () => {
      const url = 'https://github.com/user/repo/tree/main/schemas'

      const mockApiResponse = [
        {
          type: 'file',
          name: 'user.prisma',
          path: 'schemas/user.prisma',
          download_url:
            'https://raw.githubusercontent.com/user/repo/main/schemas/user.prisma',
        },
        {
          type: 'file',
          name: 'post.sql',
          path: 'schemas/post.sql',
          download_url:
            'https://raw.githubusercontent.com/user/repo/main/schemas/post.sql',
        },
      ]

      server.use(
        http.get(
          'https://api.github.com/repos/user/repo/contents/schemas',
          () => {
            return HttpResponse.json(mockApiResponse)
          },
        ),
        http.get(
          'https://raw.githubusercontent.com/user/repo/main/schemas/user.prisma',
          () => {
            return HttpResponse.text('model User {}')
          },
        ),
        http.get(
          'https://raw.githubusercontent.com/user/repo/main/schemas/post.sql',
          () => {
            return HttpResponse.text('CREATE TABLE posts')
          },
        ),
      )

      const result = await fetchSchemaFromGitHubFolder(url)

      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
        expect(result.value.detectedFormat).toBe('prisma') // Prisma has higher priority
      }
    })

    it('should recursively process subdirectories', async () => {
      const url = 'https://github.com/user/repo/tree/main/db'

      // Mock parent folder response
      const mockParentResponse = [
        {
          type: 'file',
          name: 'schema.sql',
          path: 'db/schema.sql',
          download_url:
            'https://raw.githubusercontent.com/user/repo/main/db/schema.sql',
        },
        { type: 'dir', name: 'migrations', path: 'db/migrations' },
      ]

      // Mock subdirectory response
      const mockSubdirResponse = [
        {
          type: 'file',
          name: '001_init.sql',
          path: 'db/migrations/001_init.sql',
          download_url:
            'https://raw.githubusercontent.com/user/repo/main/db/migrations/001_init.sql',
        },
      ]

      server.use(
        // First handler for parent directory
        http.get(
          'https://api.github.com/repos/user/repo/contents/db',
          ({ request }) => {
            const url = new URL(request.url)
            // Check if this is the parent directory request (no subdirectory in path)
            if (!url.pathname.includes('migrations')) {
              return HttpResponse.json(mockParentResponse)
            }
            return HttpResponse.json([])
          },
        ),
        // Second handler for subdirectory with URL-encoded path
        http.get(
          'https://api.github.com/repos/user/repo/contents/db%2Fmigrations',
          () => {
            return HttpResponse.json(mockSubdirResponse)
          },
        ),
        http.get(
          'https://raw.githubusercontent.com/user/repo/main/db/schema.sql',
          () => {
            return HttpResponse.text('CREATE TABLE users')
          },
        ),
        http.get(
          'https://raw.githubusercontent.com/user/repo/main/db/migrations/001_init.sql',
          () => {
            return HttpResponse.text('CREATE TABLE migrations')
          },
        ),
      )

      const result = await fetchSchemaFromGitHubFolder(url)

      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
        expect(result.value.content).toContain('CREATE TABLE users')
        expect(result.value.content).toContain('CREATE TABLE migrations')
      }
    })

    describe('Security limits', () => {
      it('should handle folders with too many files', async () => {
        const url = 'https://github.com/user/repo/tree/main/large-folder'

        // Create 51 files (exceeds MAX_FILES_PER_FOLDER: 50)
        const mockLargeResponse = Array.from({ length: 51 }, (_, i) => ({
          type: 'file' as const,
          name: `schema${i}.sql`,
          path: `large-folder/schema${i}.sql`,
          download_url: `https://raw.githubusercontent.com/user/repo/main/large-folder/schema${i}.sql`,
        }))

        server.use(
          http.get(
            'https://api.github.com/repos/user/repo/contents/large-folder',
            () => {
              return HttpResponse.json(mockLargeResponse)
            },
          ),
        )

        const result = await fetchSchemaFromGitHubFolder(url)

        expect(result.isErr()).toBe(true)
        if (result.isErr()) {
          expect(result.error.message).toContain(
            'Too many files in folder (51). Maximum allowed: 50',
          )
        }
      })

      it('should handle maximum recursion depth', async () => {
        const url = 'https://github.com/user/repo/tree/main/deep'

        // Create deeply nested folder structure
        const createDeepResponse = (depth: number) => [
          {
            type: 'dir' as const,
            name: `level${depth + 1}`,
            path: `deep/${'level'.repeat(depth + 1)}`,
          },
        ]

        // Setup handlers for each level (0-6, where 6 should exceed limit of 5)
        for (let i = 0; i <= 6; i++) {
          const pathSegment = i === 0 ? 'deep' : `deep/${'level'.repeat(i)}`
          server.use(
            http.get(
              `https://api.github.com/repos/user/repo/contents/${encodeURIComponent(pathSegment)}`,
              () => {
                return HttpResponse.json(createDeepResponse(i))
              },
            ),
          )
        }

        const result = await fetchSchemaFromGitHubFolder(url)

        expect(result.isErr()).toBe(true)
        if (result.isErr()) {
          expect(result.error.message).toContain(
            'Maximum recursion depth (5) exceeded',
          )
        }
      })

      it('should handle maximum total files limit', async () => {
        const url = 'https://github.com/user/repo/tree/main/many-files'

        // Create multiple folders that collectively exceed MAX_TOTAL_FILES: 100
        // Use 40 files per folder to avoid hitting MAX_FILES_PER_FOLDER: 50
        const mockFolder1 = Array.from({ length: 40 }, (_, i) => ({
          type: 'file' as const,
          name: `schema${i}.sql`,
          path: `many-files/folder1/schema${i}.sql`,
          download_url: `https://raw.githubusercontent.com/user/repo/main/many-files/folder1/schema${i}.sql`,
        }))

        const mockFolder2 = Array.from({ length: 40 }, (_, i) => ({
          type: 'file' as const,
          name: `schema${i}.sql`,
          path: `many-files/folder2/schema${i}.sql`,
          download_url: `https://raw.githubusercontent.com/user/repo/main/many-files/folder2/schema${i}.sql`,
        }))

        const mockFolder3 = Array.from({ length: 40 }, (_, i) => ({
          type: 'file' as const,
          name: `schema${i}.sql`,
          path: `many-files/folder3/schema${i}.sql`,
          download_url: `https://raw.githubusercontent.com/user/repo/main/many-files/folder3/schema${i}.sql`,
        }))

        const mockParent = [
          { type: 'dir' as const, name: 'folder1', path: 'many-files/folder1' },
          { type: 'dir' as const, name: 'folder2', path: 'many-files/folder2' },
          { type: 'dir' as const, name: 'folder3', path: 'many-files/folder3' },
        ]

        server.use(
          http.get(
            'https://api.github.com/repos/user/repo/contents/many-files',
            () => {
              return HttpResponse.json(mockParent)
            },
          ),
          http.get(
            'https://api.github.com/repos/user/repo/contents/many-files%2Ffolder1',
            () => {
              return HttpResponse.json(mockFolder1)
            },
          ),
          http.get(
            'https://api.github.com/repos/user/repo/contents/many-files%2Ffolder2',
            () => {
              return HttpResponse.json(mockFolder2)
            },
          ),
          http.get(
            'https://api.github.com/repos/user/repo/contents/many-files%2Ffolder3',
            () => {
              return HttpResponse.json(mockFolder3)
            },
          ),
        )

        const result = await fetchSchemaFromGitHubFolder(url)

        expect(result.isErr()).toBe(true)
        if (result.isErr()) {
          expect(result.error.message).toContain(
            'Maximum total files limit (100) exceeded',
          )
        }
      })

      it('should handle download timeout', async () => {
        const url = 'https://github.com/user/repo/tree/main/timeout-test'

        const mockApiResponse = [
          {
            type: 'file' as const,
            name: 'slow.sql',
            path: 'timeout-test/slow.sql',
            download_url:
              'https://raw.githubusercontent.com/user/repo/main/timeout-test/slow.sql',
          },
        ]

        server.use(
          http.get(
            'https://api.github.com/repos/user/repo/contents/timeout-test',
            () => {
              return HttpResponse.json(mockApiResponse)
            },
          ),
          // Mock a slow response that exceeds timeout
          http.get(
            'https://raw.githubusercontent.com/user/repo/main/timeout-test/slow.sql',
            async () => {
              // Wait longer than the default 10s timeout
              await new Promise((resolve) => setTimeout(resolve, 15000))
              return HttpResponse.text('CREATE TABLE slow (id INT);')
            },
          ),
        )

        const result = await fetchSchemaFromGitHubFolder(url)

        // Should fail due to timeout, resulting in no schema files found
        expect(result.isErr()).toBe(true)
        if (result.isErr()) {
          expect(result.error.message).toBe(
            'Failed to download any schema files',
          )
        }
      }, 20000) // Set test timeout to 20s to allow for the timeout to occur

      it('should reject non-GitHub raw URLs', async () => {
        const url = 'https://github.com/user/repo/tree/main/malicious'

        const mockApiResponse = [
          {
            type: 'file' as const,
            name: 'schema.sql',
            path: 'malicious/schema.sql',
            download_url: 'https://malicious.example.com/evil.sql', // Non-GitHub host
          },
        ]

        server.use(
          http.get(
            'https://api.github.com/repos/user/repo/contents/malicious',
            () => {
              return HttpResponse.json(mockApiResponse)
            },
          ),
        )

        const result = await fetchSchemaFromGitHubFolder(url)

        expect(result.isErr()).toBe(true)
        if (result.isErr()) {
          expect(result.error.message).toBe(
            'Failed to download any schema files',
          )
        }
      })

      it('should reject oversized files', async () => {
        const url = 'https://github.com/user/repo/tree/main/large-file'

        const mockApiResponse = [
          {
            type: 'file' as const,
            name: 'large.sql',
            path: 'large-file/large.sql',
            download_url:
              'https://raw.githubusercontent.com/user/repo/main/large-file/large.sql',
          },
        ]

        server.use(
          http.get(
            'https://api.github.com/repos/user/repo/contents/large-file',
            () => {
              return HttpResponse.json(mockApiResponse)
            },
          ),
          // Mock a response with Content-Length exceeding 5MB limit
          http.get(
            'https://raw.githubusercontent.com/user/repo/main/large-file/large.sql',
            () => {
              return HttpResponse.text('CREATE TABLE large (id INT);', {
                headers: {
                  'Content-Length': String(10 * 1024 * 1024), // 10MB (exceeds 5MB limit)
                },
              })
            },
          ),
        )

        const result = await fetchSchemaFromGitHubFolder(url)

        expect(result.isErr()).toBe(true)
        if (result.isErr()) {
          expect(result.error.message).toBe(
            'Failed to download any schema files',
          )
        }
      })

      it('should handle folders with too many subdirectories', async () => {
        const url = 'https://github.com/user/repo/tree/main/many-dirs'

        // Create 51 subdirectories (exceeds MAX_DIRS_PER_FOLDER: 50)
        const mockManyDirs = Array.from({ length: 51 }, (_, i) => ({
          type: 'dir' as const,
          name: `subdir${i}`,
          path: `many-dirs/subdir${i}`,
        }))

        server.use(
          http.get(
            'https://api.github.com/repos/user/repo/contents/many-dirs',
            () => {
              return HttpResponse.json(mockManyDirs)
            },
          ),
        )

        const result = await fetchSchemaFromGitHubFolder(url)

        expect(result.isErr()).toBe(true)
        if (result.isErr()) {
          expect(result.error.message).toContain(
            'Too many subdirectories in folder (51). Maximum allowed: 50',
          )
        }
      })
    })
  })
})
