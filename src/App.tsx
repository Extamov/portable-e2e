import { useCallback, useState } from "preact/hooks";
import css from "./App.module.scss";
import { EncryptionKey } from "./utils/encryption";
import { base64ToBuffer, bufferToBase64, bufferToText, textToBuffer } from "./utils/buffers";
import { compress, uncompress } from "./utils/compression";
import CodeMirrorEditor from "./components/CodeMirrorEditor";
import useE2E from "./hooks/useE2E";

export default function App() {
	const { exchangeKey, encKey, otherKeys, reset, exchange, addOtherKey, setEncKey } = useE2E();
	const [input, setInput] = useState({ text: "", isExternal: false });

	const handleInputCopy = useCallback(async () => {
		await navigator.clipboard.writeText(bufferToBase64(await encKey!.encrypt(await compress(textToBuffer(input.text)))));
	}, [encKey, input.text]);

	const handleInputPaste = useCallback(async () => {
		const encryptedText = (await navigator.clipboard.readText()).trim();
		try {
			setInput({
				text: bufferToText(await uncompress(await encKey!.decrypt(base64ToBuffer(encryptedText)))),
				isExternal: true,
			});
		} catch {
			alert("Failed to decrypt message!");
		}
	}, [encKey]);

	const handleReset = useCallback(async () => {
		await reset();
		setInput({ text: "", isExternal: true });
	}, [reset]);

	const handleExchange = useCallback(async () => {
		try {
			const input = otherKeys.length > 0 ? undefined : (await navigator.clipboard.readText()).trim();
			const output = await exchange(input);
			if (output) {
				await navigator.clipboard.writeText(output);
			}
		} catch (e) {
			alert((e as Error).message);
		}
	}, [exchange, otherKeys.length]);

	const handleSetEncKey = useCallback(async () => {
		try {
			const input = (await navigator.clipboard.readText()).trim();
			setEncKey(await EncryptionKey.fromBuffer(base64ToBuffer(input)));
		} catch (e) {
			alert((e as Error).message);
		}
	}, [setEncKey]);

	const handleOtherKey = useCallback(async () => {
		try {
			await addOtherKey((await navigator.clipboard.readText()).trim());
			await navigator.clipboard.writeText(exchangeKey!.toString());
		} catch (e) {
			alert((e as Error).message);
		}
	}, [addOtherKey, exchangeKey]);

	return (
		<main>
			<nav>
				{!encKey && exchangeKey && (
					<>
						<button onClick={() => navigator.clipboard.writeText(exchangeKey.toString())}>Copy pub key</button>
						<button onClick={handleOtherKey}>Add key ({otherKeys.length})</button>
						<button onClick={handleSetEncKey}>Paste enc key</button>
						<button onClick={handleExchange}>{otherKeys.length > 0 ? "Done" : "Paste pub key"}</button>
					</>
				)}
				{encKey && (
					<>
						<button onClick={handleReset}>Reset</button>
						<button onClick={() => navigator.clipboard.writeText(encKey.toString())}>Copy enc key</button>
						<span> </span>
						<button onClick={handleInputCopy}>Copy message</button>
						<button onClick={handleInputPaste}>Paste message</button>
					</>
				)}
			</nav>
			<div className={css["editor"]}>
				<CodeMirrorEditor value={input} onChange={(newValue) => setInput(newValue)} readOnly={encKey === undefined} />
			</div>
		</main>
	);
}
