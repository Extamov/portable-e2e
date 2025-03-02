import { useCallback, useState } from "preact/hooks";
import css from "./App.module.scss";
import { decrypt, encrypt } from "./utils/encyption";
import { base64ToBuffer, bufferToBase64, bufferToText, textToBuffer } from "./utils/convertions";
import { compress, uncompress } from "./utils/compression";
import CodeMirrorEditor from "./components/CodeMirrorEditor";
import useE2E from "./hooks/useE2E";

export default function App() {
	const { pubKey, otherKeys, encKey, reset, exchange, addOtherKey } = useE2E();
	const [input, setInput] = useState({ text: "", isExternal: false });

	const handleInputCopy = useCallback(async () => {
		await navigator.clipboard.writeText(bufferToBase64(await encrypt(await compress(textToBuffer(input.text)), encKey!)));
	}, [encKey, input.text]);

	const handleInputPaste = useCallback(async () => {
		const encryptedText = (await navigator.clipboard.readText()).trim();
		try {
			setInput({
				text: bufferToText(await uncompress(await decrypt(base64ToBuffer(encryptedText), encKey!))),
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

	const handleOtherKey = useCallback(async () => {
		try {
			await addOtherKey((await navigator.clipboard.readText()).trim());
		} catch (e) {
			alert((e as Error).message);
		}
	}, [addOtherKey]);

	return (
		<main>
			<nav>
				{!encKey && pubKey && (
					<>
						<button onClick={() => navigator.clipboard.writeText(pubKey.str)}>Copy pub key</button>
						<button onClick={handleOtherKey}>Add key ({otherKeys.length})</button>
						<button onClick={handleExchange}>{otherKeys.length > 0 ? "Done" : "Paste pub/enc key"}</button>
					</>
				)}
				{encKey && (
					<>
						<button onClick={handleReset}>Reset</button>
						<button onClick={() => navigator.clipboard.writeText(encKey.str)}>Copy enc key</button>
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
