function base64ToBuffer(base64: string) {
	const str = atob(base64);
	const buffer = new Uint8Array(str.length);
	for (let i = 0; i < buffer.length; i++) {
		buffer[i] = str.charCodeAt(i);
	}
	return buffer;
}

function bufferToBase64(buffer: Uint8Array) {
	return btoa(String.fromCharCode.apply(null, buffer as any));
}

function textToBuffer(text: string) {
	return new TextEncoder().encode(text);
}

function bufferToText(buffer: Uint8Array) {
	return new TextDecoder().decode(buffer);
}

function concatBuffers(...bufs: Uint8Array[]) {
	const result = new Uint8Array(bufs.reduce((x, buf) => x + buf.length, 0));
	let i = 0;
	for (const buf of bufs) {
		result.set(buf, i);
		i += buf.length;
	}
	return result;
}

function compareBuffers(buf1: Uint8Array, buf2: Uint8Array) {
	if (buf1.length !== buf2.length) {
		return false;
	}
	for (let i = 0; i < buf1.length; i++) {
		if (buf1[i] !== buf2[i]) {
			return false;
		}
	}
	return true;
}

export { base64ToBuffer, bufferToBase64, textToBuffer, bufferToText, concatBuffers, compareBuffers };
