import { useCallback, useEffect, useState } from "preact/hooks";
import { CachedCryptoKey, CachedCryptoKeyPair, decrypt, deriveKey, encrypt, generateKeyPair, importKey, randomKey } from "../utils/encyption";
import { base64ToBuffer, bufferToBase64 } from "../utils/convertions";

const ENC_KEY_REGEX = /^[a-zA-Z0-9=+/-]{44}$/;
const PUB_KEY_REGEX = /^[a-zA-Z0-9=+/-]{88}$/;
const MUL_KEY_REGEX = /^[a-zA-Z0-9=+/-]{88}(:?\|[a-zA-Z0-9=+/-]{80})+$/;

export default function useE2E() {
	const [keyPair, setKeyPair] = useState<CachedCryptoKeyPair>();
	const [otherKeys, setOtherKeys] = useState<CachedCryptoKey[]>([]);
	const [encKey, setEncKey] = useState<CachedCryptoKey>();

	const reset = useCallback(async () => {
		setKeyPair(undefined);
		setEncKey(undefined);
		setOtherKeys([]);
		setKeyPair(await generateKeyPair());
	}, []);

	const addOtherKey = useCallback(
		async (str: string) => {
			if (!keyPair) throw new Error("No key pair");
			if (!PUB_KEY_REGEX.test(str)) {
				throw new Error("Unrecognised input");
			}
			if (str === keyPair.publicKey.str) {
				throw new Error("You can't use your own public key");
			}
			if (otherKeys.find((key) => key.str === str)) {
				throw new Error("The key is already in the list");
			}
			setOtherKeys([...otherKeys, await importKey(str, "Public")]);
		},
		[keyPair, otherKeys],
	);

	const exchange = useCallback(
		async (str?: string) => {
			if (!keyPair) throw new Error("No key pair");
			if (!str) {
				// Exchange between multiple people as the host.
				if (otherKeys.length === 0) throw new Error("Can't multi exchange as host without public keys");
				const [key, keyBuf] = await randomKey();
				const finalData = [keyPair.publicKey.str];
				for (const otherKey of otherKeys) {
					const sharedKey = await deriveKey(keyPair.privateKey, otherKey);
					finalData.push(bufferToBase64(await encrypt(keyBuf, sharedKey)));
				}
				setEncKey(key);
				return finalData.join("|");
			} else if (ENC_KEY_REGEX.test(str)) {
				// Use an existing encryption key instead of exchange
				setEncKey(await importKey(str, "Crypt"));
			} else if (PUB_KEY_REGEX.test(str)) {
				// Exchange between 2 people
				if (str === keyPair.publicKey.str) {
					throw new Error("You can't use your own public key");
				}
				setEncKey(await deriveKey(keyPair.privateKey, await importKey(str, "Public")));
			} else if (MUL_KEY_REGEX.test(str)) {
				// Exchange between more than two people with keys provided by host.
				const keys = str.split("|");
				const hostPubKey = await importKey(keys.splice(0, 1)[0], "Public");
				const sharedKey = await deriveKey(keyPair.privateKey, hostPubKey);
				for (const key of keys) {
					try {
						return setEncKey(await importKey(await decrypt(base64ToBuffer(key), sharedKey), "Crypt"));
					} catch {}
				}
				throw new Error("Failed to multi exchange");
			} else {
				throw new Error("Unrecognised input");
			}
		},
		[keyPair, otherKeys],
	);

	useEffect(() => {
		generateKeyPair().then(setKeyPair);
	}, []);

	return { pubKey: keyPair?.publicKey, otherKeys, encKey, exchange, reset, addOtherKey };
}
