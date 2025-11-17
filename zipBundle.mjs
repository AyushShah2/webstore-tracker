// @ts-check

import { createReadStream, createWriteStream } from "node:fs"
import { resolve } from "node:path"
import { argv } from "node:process"
import glob from 'fast-glob'
import { Zip, AsyncZipDeflate } from 'fflate'

/**
 * @typedef {Object} ZipParameters
 * @property {string} distDirectory
 * @property {string} buildDirectory
 * @property {string} distDirectoryName
 */

// From https://github.com/PlasmoHQ/plasmo/blob/main/cli/plasmo/src/features/manifest-factory/zip.ts
const zipBundle = async (
  /** @type {ZipParameters} */{ distDirectory, buildDirectory, distDirectoryName },
  withMaps = false
) => {
  const zipFilePath = resolve(buildDirectory, `${distDirectoryName}.zip`)

  const output = createWriteStream(zipFilePath)

  const fileList = await glob(
    [
      "**/*", // Pick all nested files
      ...withMaps ? ["!**/(*.js.map|*.css.map)"] : [] // Exclude source maps
    ],
    {
      cwd: distDirectory,
      onlyFiles: true
    }
  )

  return /** @type {Promise<void>} */(new Promise((pResolve, pReject) => {
    let size = 0
    let aborted = false
    const timer = Date.now()
    const zip = new Zip((err, data, final) => {
      if (aborted) {
        return
      } else if (err) {
        pReject(err)
      } else {
        size += data.length
        output.write(data)
        if (final) {
          output.end()
          pResolve()
        }
      }
    })

    // Start all the file read streams
    for (const file of fileList) {
      if (aborted) {
        return
      }

      const data = new AsyncZipDeflate(file, {
        level: 9
      })

      zip.add(data)

      const absPath = resolve(distDirectory, file)

      createReadStream(absPath)
        .on("data", (/** @type {Buffer} */chunk) => {
          data.push(Uint8Array.from(chunk), false)
        })
        .on("end", () => {
          data.push(new Uint8Array(0), true) // Notify completion
        })
        .on("error", (error) => {
          aborted = true
          zip.terminate()
          pReject(`Error reading file ${absPath}: ${error.message}`)
        })
    }

    zip.end()
  }))
}

if (argv.length == 5 && argv[2] && argv[3] && argv[4]) {
  zipBundle({ distDirectory: argv[2], buildDirectory: argv[3], distDirectoryName: argv[4] })
}