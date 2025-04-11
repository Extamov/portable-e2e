import { bufferToBase64 } from "./buffers";
import { EncryptionKey } from "./encryption";

export const ECDHTypes = {
	P256: { name: "ECDH", namedCurve: "P-256", pkLen: 65 },
	P384: { name: "ECDH", namedCurve: "P-384", pkLen: 97 },
	P521: { name: "ECDH", namedCurve: "P-521", pkLen: 133 },
	X25519: { name: "X25519", pkLen: 32 },
} as const;

export type ECDHType = (typeof ECDHTypes)[keyof typeof ECDHTypes];

export class ECDHExchangeKey {
	constructor(
		readonly publicKey: Uint8Array,
		readonly privateKey: CryptoKey,
		readonly type: ECDHType,
	) {}
	static async new(type: ECDHType) {
		const { publicKey, privateKey } = (await crypto.subtle.generateKey(type, true, ["deriveBits"])) as CryptoKeyPair;
		const publicKeyBuf = new Uint8Array(await crypto.subtle.exportKey("raw", publicKey));
		return new ECDHExchangeKey(publicKeyBuf, privateKey, type);
	}
	async deriveBits(otherPublicKey: Uint8Array) {
		return new Uint8Array(
			await crypto.subtle.deriveBits(
				{
					name: this.type.name,
					public: await crypto.subtle.importKey("raw", otherPublicKey, this.type, false, []),
				},
				this.privateKey,
				256,
			),
		);
	}
	async derive(otherPublicKey: Uint8Array) {
		return EncryptionKey.fromBuffer(await this.deriveBits(otherPublicKey));
	}
	toString() {
		return bufferToBase64(this.publicKey);
	}
}
