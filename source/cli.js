#!/usr/bin/env node

import getStdin from "get-stdin"

import {parseConfig} from "./parse-config"
import {resolvePackage} from "./resolve-package"

main()

async function main() {
	try {
		const input = await getStdin()
		const config = parseConfig(input)
		if (config.hosts.length < 1)
			throw new Error(`at least one host must be provided, eg, "📡 unpkg"`)
		const pending = config.packages.map(
			pack => resolvePackage({...pack, hosts: config.hosts})
		)
		const metaImports = await Promise.all(pending)
		const importmap = {imports: combineImports(metaImports)}
		const json = JSON.stringify(importmap, null, "\t")
		process.stdout.write(`\n${json}\n`)
		process.exit(0)
	}
	catch (error) {
		error.message = `importly: ${error.message}`
		console.error(error.message)
		console.error(error.stack)
		process.exit(-1)
	}
}

function combineImports(metaImports) {
	return metaImports.reduce((last, current) => ({...last, ...current}), {})
}
