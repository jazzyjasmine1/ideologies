import {Source, Example, NounTemplate, PronounGroup, PronounLibrary, Name, Person, NounDeclension} from './classes'
import { buildDict, buildList } from './helpers';
import { parsePronouns } from './buildPronoun';

import pronounsRaw from '../data/pronouns/pronouns.tsv';
export const pronouns = parsePronouns(pronounsRaw);

import examplesRaw from '../data/pronouns/examples.tsv';
export const examples = buildList(function* () {
    for (let e of examplesRaw) {
        yield new Example(
            Example.parse(e.singular),
            Example.parse(e.plural || e.singular),
            e.isHonorific,
        );
    }
});

import nounTemplatesRaw from '../data/nouns/nounTemplates.tsv';
export const nounTemplates = buildList(function* () {
    for (let t of nounTemplatesRaw) {
        yield new NounTemplate(
            t.masc.replace(/-/g, '').split('/'),
            t.fem.replace(/-/g, '').split('/'),
            t.neutr.replace(/-/g, '').split('/'),
            t.mascPl.replace(/-/g, '').split('/'),
            t.femPl.replace(/-/g, '').split('/'),
            t.neutrPl.replace(/-/g, '').split('/'),
        );
    }
});

import pronounGroupsRaw from '../data/pronouns/pronounGroups.tsv';
export const pronounGroups = buildList(function* () {
    for (let g of pronounGroupsRaw) {
        yield new PronounGroup(
            g.name,
            g.pronouns ? g.pronouns.split(',') : [],
            g.description,
            g.key || null,
        );
    }
});

export const pronounLibrary = new PronounLibrary(pronounGroups, pronouns);

import peopleRaw from '../data/people/people.tsv';
export const people = buildList(function* () {
    for (let p of peopleRaw) {
        yield new Person(
            p.name,
            p.description,
            p.pronouns.split(','),
            p.sources ? p.sources.split(',') : [],
        );
    }
});

import nounDeclensionTemplatesRaw from '../data/nouns/nounDeclension.tsv';
export const nounDeclensionTemplates = buildList(function* () {
    for (let d of nounDeclensionTemplatesRaw) {
        yield new NounDeclension(d);
    }
});

import abbreviationsRaw from '../data/nouns/abbr.tsv';
export const abbreviations = buildDict(function* () {
    for (let a of abbreviationsRaw) {
        yield [a.abbreviation, a.meaning];
    }
});
