import { base64ToBuffer, bufferToBase64 } from "./convertions";

const EXCHANGE_ALGO = { name: "ECDH", namedCurve: "P-256" } as const;
const ENC_ALGO = { name: "AES-GCM", length: 256 } as const;
const IV_LEN = 12;

export interface CachedCryptoKey extends CryptoKey {
	str: string;
}

export interface CachedCryptoKeyPair extends CryptoKeyPair {
	publicKey: CachedCryptoKey;
}

async function _exportKey(key: CryptoKey) {
	return new Uint8Array(await crypto.subtle.exportKey("raw", key));
}

function _cachedKey(key: CryptoKey, str: string) {
	const cachedKey = key as CachedCryptoKey;
	cachedKey.str = str;
	return cachedKey;
}

async function _cacheKey(key: CryptoKey) {
	return _cachedKey(key, bufferToBase64(await _exportKey(key)));
}

async function generateKeyPair() {
	const { publicKey, privateKey } = await crypto.subtle.generateKey(EXCHANGE_ALGO, true, ["deriveKey"]);
	return { publicKey: await _cacheKey(publicKey), privateKey } as CachedCryptoKeyPair;
}

async function importKey(data: string | Uint8Array, type: "Public" | "Crypt") {
	const algo = type === "Public" ? EXCHANGE_ALGO : ENC_ALGO;
	const usages = type === "Public" ? [] : (["encrypt", "decrypt"] as const);

	const str = typeof data === "string" ? data : bufferToBase64(data);
	const buf = typeof data === "string" ? base64ToBuffer(data) : data;

	const key = await crypto.subtle.importKey("raw", buf, algo, false, usages);
	return _cachedKey(key, str);
}

async function deriveKey(privateKey: CryptoKey, otherPublicKey: CryptoKey) {
	return await _cacheKey(
		await crypto.subtle.deriveKey(
			{
				name: EXCHANGE_ALGO.name,
				public: otherPublicKey,
			},
			privateKey,
			ENC_ALGO,
			true,
			["encrypt", "decrypt"],
		),
	);
}

async function randomKey() {
	const randomBuf = crypto.getRandomValues(new Uint8Array(ENC_ALGO.length / 8));
	return [await importKey(randomBuf, "Crypt"), randomBuf] as const;
}

async function decrypt(data: Uint8Array, key: CryptoKey) {
	return new Uint8Array(await crypto.subtle.decrypt({ name: ENC_ALGO.name, iv: data.subarray(0, IV_LEN) }, key, data.subarray(IV_LEN)));
}

async function encrypt(data: Uint8Array, key: CryptoKey) {
	const iv = crypto.getRandomValues(new Uint8Array(IV_LEN));
	const encryptedData = new Uint8Array(await crypto.subtle.encrypt({ name: ENC_ALGO.name, iv }, key, data));
	const finalData = new Uint8Array(iv.byteLength + encryptedData.byteLength);
	finalData.set(iv, 0);
	finalData.set(encryptedData, iv.byteLength);
	return finalData;
}

export { generateKeyPair, importKey, deriveKey, randomKey, encrypt, decrypt };
