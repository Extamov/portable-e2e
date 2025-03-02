import { EditorView } from "@codemirror/view";
import { Extension } from "@codemirror/state";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";

const background = "#1e1e1e",
	foreground = "#cccccc",
	caretColor = "#c6c6c6",
	fontFamily = "Cascadia Code, Fira Code, JetBrains Mono, SFMono-Regular, Consolas, Liberation Mono, Menlo, monospace",
	activeLineBackground = "#00000000",
	selectionBackground = "#2489db82",
	selectionMatchBackground = "#add6ff26",
	gutterForeground = "#838383",
	gutterActiveForeground = "#ffffff",
	keywordColor = "#569cd6",
	controlKeywordColor = "#c586c0",
	variableColor = "#9cdcfe",
	propertyColor = "#4fc1ff",
	classTypeColor = "#4ec9b0",
	functionColor = "#dcdcaa",
	numberColor = "#b5cea8",
	operatorColor = "#d4d4d4",
	regexpColor = "#d16969",
	stringColor = "#ce9178",
	commentColor = "#6a9955",
	invalidColor = "#f44747",
	escapeColor = "#d7ba7d",
	htmlTagColor = "#808080";

const theme = EditorView.theme(
	{
		"&": {
			color: foreground,
			backgroundColor: background,
		},
		".cm-content": {
			caret: caretColor,
			fontFamily,
		},
		".cm-activeLine": {
			backgroundColor: activeLineBackground,
		},
		"&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection": {
			backgroundColor: selectionBackground,
		},
		".cm-selectionMatch": {
			backgroundColor: selectionMatchBackground,
		},
		".cm-gutters": {
			backgroundColor: background,
			color: gutterForeground,
			fontFamily,
		},
		".cm-activeLineGutter": {
			backgroundColor: background,
			color: gutterActiveForeground,
		},
	},
	{ dark: true },
);

const syntax = syntaxHighlighting(
	HighlightStyle.define([
		{
			tag: [
				t.keyword,
				t.operatorKeyword,
				t.modifier,
				t.constant(t.name),
				t.standard(t.name),
				t.standard(t.typeName),
				t.bool,
				t.definitionOperator,
				t.special(t.variableName),
				t.special(t.brace),
				t.self,
				t.tagName,
				t.documentMeta,
				t.function(t.punctuation),
			],
			color: keywordColor,
		},
		{ tag: [t.controlKeyword, t.moduleKeyword, t.processingInstruction], color: controlKeywordColor },
		{ tag: [t.heading], color: keywordColor, fontWeight: "bold" },
		{
			tag: [t.name, t.deleted, t.character, t.variableName, t.attributeName],
			color: variableColor,
		},
		{ tag: t.propertyName, color: propertyColor },
		{
			tag: [t.typeName, t.className, t.number, t.changed, t.annotation, t.namespace],
			color: classTypeColor,
		},
		{
			tag: [t.function(t.variableName), t.function(t.propertyName), t.labelName, t.macroName],
			color: functionColor,
		},
		{ tag: [t.number, t.unit], color: numberColor },
		{
			tag: [t.operator, t.punctuation, t.separator, t.url, t.regexp],
			color: operatorColor,
		},
		{ tag: t.escape, color: escapeColor },
		{ tag: t.regexp, color: regexpColor },
		{
			tag: [t.special(t.string), t.string, t.inserted, t.color, t.atom],
			color: stringColor,
		},
		{ tag: t.angleBracket, color: htmlTagColor },
		{ tag: t.comment, color: commentColor },
		{ tag: t.meta, color: foreground },
		{ tag: t.invalid, color: invalidColor },
		{ tag: t.strong, fontWeight: "bold" },
		{ tag: t.emphasis, fontStyle: "italic" },
		{ tag: t.strikethrough, textDecoration: "line-through" },
		{ tag: t.url, textDecoration: "underline" },
	]),
);

const vsCodeDark: Extension = [theme, syntax];
export default vsCodeDark;
