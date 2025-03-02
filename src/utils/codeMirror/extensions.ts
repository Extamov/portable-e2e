import { closeBrackets, closeBracketsKeymap, completionKeymap } from "@codemirror/autocomplete";
import { defaultKeymap, history, historyKeymap, indentLess, insertTab } from "@codemirror/commands";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { bracketMatching, indentOnInput, indentUnit } from "@codemirror/language";
import { languages } from "@codemirror/language-data";
import { highlightSelectionMatches } from "@codemirror/search";
import { EditorState } from "@codemirror/state";
import { drawSelection, highlightActiveLine, highlightActiveLineGutter, keymap, lineNumbers } from "@codemirror/view";
import vsCodeDark from "./theme";
import rainbowBracketsPlugin from "./rainbowBrackets";

const codeMirrorExtensions = [
	lineNumbers(),
	highlightActiveLineGutter(),
	history(),
	drawSelection(),
	EditorState.allowMultipleSelections.of(true),
	indentOnInput(),
	bracketMatching(),
	closeBrackets(),
	highlightActiveLine(),
	highlightSelectionMatches(),
	indentUnit.of("\t"),
	keymap.of([
		...closeBracketsKeymap,
		...defaultKeymap,
		...historyKeymap,
		...completionKeymap,
		{
			key: "Tab",
			preventDefault: true,
			run: insertTab,
		},
		{
			key: "Shift-Tab",
			preventDefault: true,
			run: indentLess,
		},
	]),
	markdown({ base: markdownLanguage, codeLanguages: languages }),
	vsCodeDark,
	rainbowBracketsPlugin,
];
export default codeMirrorExtensions;
