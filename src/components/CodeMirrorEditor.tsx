import { useEffect, useRef, useState } from "preact/hooks";
import { EditorView } from "@codemirror/view";
import { Compartment, EditorState } from "@codemirror/state";
import css from "./CodeMirrorEditor.module.scss";
import codeMirrorExtensions from "../utils/codeMirror/extensions";

interface Compartments {
	readOnly: Compartment;
	onChange: Compartment;
}

interface EditorValue {
	text: string;
	isExternal: boolean;
}

interface SimpleEditorProps {
	value: EditorValue;
	onChange: (newValue: EditorValue) => void;
	readOnly: boolean;
}
export default function CodeMirrorEditor({ value, onChange, readOnly }: SimpleEditorProps) {
	const divRef = useRef(null);
	const [view, setView] = useState<EditorView | null>(null);
	const compartments = useRef<Compartments>();

	useEffect(() => {
		compartments.current = { readOnly: new Compartment(), onChange: new Compartment() };
		const v = new EditorView({
			doc: value.text,
			parent: divRef.current!,
			extensions: [
				...codeMirrorExtensions,
				compartments.current.readOnly.of(EditorState.readOnly.of(false)),
				compartments.current.onChange.of(EditorView.updateListener.of(() => {})),
			],
		});
		setView(v);
		return v.destroy;
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (view && value.isExternal) {
			view.dispatch({
				changes: { from: 0, to: view.state.doc.length, insert: value.text },
			});
		}
	}, [value, view]);

	useEffect(() => {
		if (view) {
			view.dispatch({
				effects: [
					compartments.current!.readOnly.reconfigure(EditorState.readOnly.of(readOnly)),
					compartments.current!.onChange.reconfigure(
						EditorView.updateListener.of((update) => {
							if (update.docChanged) {
								onChange({ text: update.state.doc.toString(), isExternal: false });
							}
						}),
					),
				],
			});
		}
	}, [onChange, readOnly, view]);

	return <div className={css["editor"]} ref={divRef} />;
}
