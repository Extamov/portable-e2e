import { bufferToBase64, concatBuffers } from "./buffers";

const ENC_ALGO = { name: "AES-GCM", length: 256 } as const;
const IV_LEN = 12;

export const ENCAPSULED_KEY_LEN = ENC_ALGO.length / 8 + IV_LEN + 16;

export class EncryptionKey {
	constructor(
		readonly key: CryptoKey,
		readonly buffer: Uint8Array,
	) {}
	static async fromBuffer(buffer: Uint8Array) {
		const key = await crypto.subtle.importKey("raw", buffer, ENC_ALGO, false, ["encrypt", "decrypt"]);
		return new EncryptionKey(key, buffer);
	}
	static async random() {
		return await EncryptionKey.fromBuffer(crypto.getRandomValues(new Uint8Array(ENC_ALGO.length / 8)));
	}
	async decrypt(data: Uint8Array) {
		return new Uint8Array(await crypto.subtle.decrypt({ name: ENC_ALGO.name, iv: data.subarray(0, IV_LEN) }, this.key, data.subarray(IV_LEN)));
	}
	async encrypt(data: Uint8Array) {
		const iv = crypto.getRandomValues(new Uint8Array(IV_LEN));
		const encryptedData = new Uint8Array(await crypto.subtle.encrypt({ name: ENC_ALGO.name, iv }, this.key, data));
		return concatBuffers(iv, encryptedData);
	}
	toString() {
		return bufferToBase64(this.buffer);
	}
}
