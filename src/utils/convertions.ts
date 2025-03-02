function base64ToBuffer(base64: string) {
	const str = atob(base64);
	const buffer = new Uint8Array(str.length);
	for (let i = 0; i < buffer.byteLength; i++) {
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

export { base64ToBuffer, bufferToBase64, textToBuffer, bufferToText };
