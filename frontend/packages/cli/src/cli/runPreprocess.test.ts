import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { runPreprocess } from './runPreprocess.js'

describe('runPreprocess', () => {
  it('should create schema.json with the SQL content in the specified directory', async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'test-distDir-'))
    const inputPath = path.join(tmpDir, 'input.sql')

    const sqlContent = 'CREATE TABLE test (id INT, name VARCHAR(255));'
    fs.writeFileSync(inputPath, sqlContent, 'utf8')

    const outputFilePath = await runPreprocess(inputPath, tmpDir)
    if (!outputFilePath) throw new Error('Implement the test')

    expect(fs.existsSync(outputFilePath)).toBe(true)

    const outputContent = JSON.parse(fs.readFileSync(outputFilePath, 'utf8'))
    expect(outputContent.tables).toBeDefined()
  })

  it('should throw an error if the input file does not exist', async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'test-distDir-'))
    const nonExistentPath = path.join(tmpDir, 'non-existent.sql')

    await expect(runPreprocess(nonExistentPath, tmpDir)).rejects.toThrow(
      'Invalid input path. Please provide a valid file.',
    )
  })
})
