import { syntaxTree } from "@codemirror/language";
import { EditorView, Decoration, ViewPlugin, ViewUpdate } from "@codemirror/view";
import { highlightTree } from "@lezer/highlight";

const COLORS = ["#ffd700", "#da70d6", "#179fff"];

const _theme: Record<string, Record<string, string>> = {};
for (const [i, color] of COLORS.entries()) {
	_theme[`.bracket-${i}`] = { color };
	_theme[`.bracket-${i} span`] = { color };
}
_theme[".cm-matchingBracket"] = { color: "inherit !important", outline: "1px solid #888888" };
const theme = EditorView.theme(_theme);

const pClass = ViewPlugin.fromClass(
	class {
		decorations;

		constructor(view: EditorView) {
			this.decorations = this.getBracketDecorations(view);
		}

		update(update: ViewUpdate) {
			if (update.docChanged || update.selectionSet || update.viewportChanged) {
				this.decorations = this.getBracketDecorations(update.view);
			}
		}

		getBracketDecorations(view: EditorView) {
			const tree = syntaxTree(view.state);
			const { doc } = view.state;
			const decorations: any[] = [];
			const stack: { type: string; from: number }[] = [];

			highlightTree(
				tree,
				{
					style: (tags) => (tags.some((tag) => ["brace", "paren", "squareBracket"].includes(tag.toString())) ? "_" : null),
				},
				(pos) => {
					const char = doc.sliceString(pos, pos + 1);
					if (char === "(" || char === "[" || char === "{") {
						stack.push({ type: char, from: pos });
					} else if (char === ")" || char === "]" || char === "}") {
						const open = stack.pop();
						if (open && open.type === this.getMatchingBracket(char)) {
							const colorNumber = stack.length % COLORS.length;
							decorations.push(
								Decoration.mark({ class: `bracket-${colorNumber}` }).range(open.from, open.from + 1),
								Decoration.mark({ class: `bracket-${colorNumber}` }).range(pos, pos + 1),
							);
						}
					}
				},
			);
			return Decoration.set(decorations, true);
		}

		getMatchingBracket(closingBracket: string) {
			switch (closingBracket) {
				case ")":
					return "(";
				case "]":
					return "[";
				case "}":
					return "{";
				default:
					return null;
			}
		}
	},
	{
		decorations: (v) => v.decorations,
	},
);

const rainbowBracketsPlugin = [pClass, theme];

export default rainbowBracketsPlugin;
