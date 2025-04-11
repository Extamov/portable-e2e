import { useCallback, useEffect, useState } from "preact/hooks";
import { base64ToBuffer, bufferToBase64, compareBuffers, concatBuffers } from "../utils/buffers";
import { ECDHTypes, ECDHExchangeKey } from "../utils/exchange";
import { ENCAPSULED_KEY_LEN, EncryptionKey } from "../utils/encryption";

export default function useE2E() {
	const [exchangeKey, setExchangeKey] = useState<ECDHExchangeKey>();
	const [otherKeys, setOtherKeys] = useState<Uint8Array[]>([]);
	const [encKey, setEncKey] = useState<EncryptionKey>();

	const reset = useCallback(async () => {
		setExchangeKey(undefined);
		setEncKey(undefined);
		setOtherKeys([]);
		setExchangeKey(await ECDHExchangeKey.new(ECDHTypes.X25519));
	}, []);

	const addOtherKey = useCallback(
		async (inputStr: string) => {
			if (!exchangeKey) throw new Error("No exchange key");
			const input = base64ToBuffer(inputStr);
			if (input.length !== exchangeKey.type.pkLen) {
				throw new Error("Unrecognised input");
			}
			if (compareBuffers(input, exchangeKey.publicKey)) {
				throw new Error("You can't use your own public key");
			}
			if (otherKeys.find((key) => compareBuffers(input, key))) {
				throw new Error("The key is already in the list");
			}
			setOtherKeys([...otherKeys, input]);
		},
		[exchangeKey, otherKeys],
	);

	const exchange = useCallback(
		async (inputStr?: string) => {
			if (!exchangeKey) throw new Error("No exchange key");
			const input = base64ToBuffer(inputStr ?? "");
			if (input.length === 0) {
				// Exchange between multiple people as the host.
				if (otherKeys.length === 0) throw new Error("Can't multi exchange as host without public keys");
				const key = await EncryptionKey.random();
				const finalData = [exchangeKey.publicKey];
				for (const otherKey of otherKeys) {
					const encapsuledKey = await (await exchangeKey.derive(otherKey)).encrypt(key.buffer);
					finalData.push(encapsuledKey);
				}
				setEncKey(key);
				return bufferToBase64(concatBuffers(...finalData));
			} else if (input.length === exchangeKey.type.pkLen) {
				// Exchange between 2 people
				if (compareBuffers(input, exchangeKey.publicKey)) {
					throw new Error("You can't use your own public key");
				}
				setEncKey(await exchangeKey.derive(input));
			} else if ((input.length - exchangeKey.type.pkLen) % ENCAPSULED_KEY_LEN === 0) {
				// Exchange between more than two people with keys provided by host.
				const hostPubKey = input.subarray(0, exchangeKey.type.pkLen);
				const sharedKey = await exchangeKey.derive(hostPubKey);
				const keyList = input.subarray(exchangeKey.type.pkLen);
				for (let i = 0; i < keyList.length; i += ENCAPSULED_KEY_LEN) {
					const key = keyList.subarray(i, i + ENCAPSULED_KEY_LEN);
					try {
						return setEncKey(await EncryptionKey.fromBuffer(await sharedKey.decrypt(key)));
					} catch {}
				}
				throw new Error("Failed to multi exchange");
			} else {
				throw new Error("Unrecognised input");
			}
		},
		[exchangeKey, otherKeys],
	);

	useEffect(() => {
		ECDHExchangeKey.new(ECDHTypes.X25519).then(setExchangeKey);
	}, []);

	return { exchangeKey, encKey, otherKeys, exchange, reset, addOtherKey, setEncKey };
}
