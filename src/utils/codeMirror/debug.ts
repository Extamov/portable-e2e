import { HighlightStyle, syntaxHighlighting, TagStyle } from "@codemirror/language";
import { tags } from "@lezer/highlight";

const allTags: TagStyle[] = [];

for (const [tagName, tag] of Object.entries(tags)) {
	if (typeof tag === "function") {
		for (const [sTagName, sTag] of Object.entries(tags)) {
			if (typeof sTag === "function") {
				continue;
			}
			allTags.push({ tag: tag(sTag), class: `t.${tagName}(t.${sTagName})` });
		}
	} else {
		allTags.push({ tag, class: `t.${tagName}` });
	}
}

const debugPlugin = [syntaxHighlighting(HighlightStyle.define(allTags))];

export default debugPlugin;
