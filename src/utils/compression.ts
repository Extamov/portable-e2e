async function _compress(buffer: Uint8Array, format: CompressionFormat) {
	const stream = new Response(buffer).body!.pipeThrough(new CompressionStream(format));
	return new Uint8Array(await new Response(stream).arrayBuffer());
}

async function _uncompress(buffer: Uint8Array, format: CompressionFormat) {
	const stream = new Response(buffer).body!.pipeThrough(new DecompressionStream(format));
	return new Uint8Array(await new Response(stream).arrayBuffer());
}

async function compress(buffer: Uint8Array) {
	const deflateBuffer = await _compress(buffer, "deflate");
	const gzipBuffer = await _compress(buffer, "gzip");
	if (buffer.length <= deflateBuffer.length && buffer.length <= gzipBuffer.length) {
		return buffer;
	}
	if (deflateBuffer.length <= buffer.length && deflateBuffer.length <= gzipBuffer.length) {
		return deflateBuffer;
	}
	return gzipBuffer;
}

async function uncompress(buffer: Uint8Array) {
	if (buffer[0] === 0x1f && buffer[1] === 0x8b) {
		return await _uncompress(buffer, "gzip");
	}
	if (buffer[0] === 0x78 && buffer[1] === 0x9c) {
		return await _uncompress(buffer, "deflate");
	}
	return buffer;
}

export { compress, uncompress };
