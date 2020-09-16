import {MORPHEMES, Template} from "./classes";
import Compressor from "./compressor";
import {buildDict} from "./helpers";

export const addAliasesToTemplates = (templates) => {
    const templatesWithAliases = {}
    for (let base in templates) {
        if (templates.hasOwnProperty(base)) {
            const template = templates[base];
            templatesWithAliases[base] = template;
            for (let alias of template.aliases) {
                templatesWithAliases[alias] = template;
            }
        }
    }
    return templatesWithAliases;
}

export const getTemplate = (templates, id) => {
    return addAliasesToTemplates(templates)[id];
}

export const buildTemplate = (templates, path) => {
    const templatesWithAliases = addAliasesToTemplates(templates);

    const templateStr = path.split(',');

    let base = null;
    for (let option of templateStr[0].split('&')) {
        if (!base) {
            base = templatesWithAliases[option]
        } else {
            base = base.merge(templatesWithAliases[option])
        }
    }

    return templateStr.length === 1
        ? base
        : Template.from(Compressor.uncompress(templateStr, base ? base.toArray() : null));
}

export const parseTemplates = (templatesRaw) => {
    return buildDict(function* () {
        for (let t of templatesRaw) {
            const aliases = t.key.split(',');

            yield [
                aliases[0],
                new Template(
                    aliases[0],
                    t.description,
                    t.normative,
                    buildDict(function* () {
                        for (let morpheme of MORPHEMES) {
                            yield [morpheme, t[morpheme]];
                        }
                    }),
                    t.plural,
                    t.pluralHonorific,
                    t.sources ? t.sources.split(',') : [],
                    aliases.slice(1),
                    t.history,
                )
            ];
        }
    });
}
