<template>
    <div>
        <NounsNav/>

        <h2>
            <Icon v="comment-times"/>
            <T>nouns.xNouns.header</T>
        </h2>

        <div class="d-flex flex-column flex-md-row">
            <div>
                <T>nouns.xNouns.info</T>
                <p><Share :title="$t('nouns.xNouns.header')"/></p>
            </div>
            <figure>
                <img src="/img-local/flags/iksatywy.png" :alt="$t('nouns.xNouns.flag.alt')"/>
                <!--<figcaption><T>nouns.xNouns.flag.caption</T></figcaption>-->
            </figure>
        </div>

        <details open class="border mb-3">
            <summary class="bg-light p-3">
                <h4 class="h5 d-inline"><T>nouns.examples</T></h4>
            </summary>
            <div class="border-top table-responsive">
                <table class="table table-striped table-hover table-fixed-3">
                    <thead>
                    <tr>
                        <th class="text-nowrap">
                            <Icon v="mars"/>
                            <T>nouns.masculine</T>
                        </th>
                        <th class="text-nowrap">
                            <Icon v="venus"/>
                            <T>nouns.feminine</T>
                        </th>
                        <th class="text-nowrap">
                            <Icon v="neuter"/>
                            <T>nouns.xNouns.label</T>
                        </th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-for="noun in xNouns" :key="noun.id">
                        <td>
                            <ul class="list-singular">
                                <li v-for="w in noun.masc">{{ w }}</li>
                            </ul>
                            <ul class="list-plural">
                                <li v-for="w in noun.mascPl">{{ w }}</li>
                            </ul>
                        </td>
                        <td>
                            <ul class="list-singular">
                                <li v-for="w in noun.fem">{{ w }}</li>
                            </ul>
                            <ul class="list-plural">
                                <li v-for="w in noun.femPl">{{ w }}</li>
                            </ul>
                        </td>
                        <td>
                            <ul class="list-singular">
                                <li v-for="w in noun.neutr">
                                    <Declension :word="w" :template="noun.declension"/>
                                </li>
                            </ul>
                            <ul class="list-plural">
                                <li v-for="w in noun.neutrPl">
                                    <Declension :word="w" plural :singularOptions="noun.neutr" :template="noun.declension"/>
                                </li>
                            </ul>
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div>
        </details>

        <details open class="border mb-3">
            <summary class="bg-light p-3">
                <h4 class="h5 d-inline"><T>nouns.xNouns.extended.header</T></h4>
            </summary>
            <div class="border-top">
                <div class="d-flex flex-column flex-md-row">
                    <div class="p-3">
                        <h5>??? <T>nouns.singular</T></h5>
                        <Declension word="" :template="xExtendedDeclension" open/>
                    </div>
                    <div class="p-3">
                        <h5>??? <T>nouns.plural</T></h5>
                        <Declension word="" :template="xExtendedDeclension" open plural/>
                    </div>
                </div>
            </div>
        </details>

        <details open class="border mb-3">
            <summary class="bg-light p-3">
                <h4 class="h5 d-inline">Generator</h4>
            </summary>
            <div class="border-top p-3">
                <p>
                    Ko??c??wki iksatyw??w s?? tak regularne, ??e zamiast pe??nego s??ownika
                    powinien wystarczy?? nawet automatyczny generator.
                </p>
                <p>
                    Wpisz poni??ej dowolny rzeczownik okre??laj??cy osob??,
                    <strong>w rodzaju m??skim liczby pojedynczej</strong>:
                </p>
                <div class="form-group">
                    <input v-model="generatorWord" class="form-control" placeholder="Wpisz rzeczownik w rodzaju m??skim liczby pojedynczej"/>
                </div>
                <div v-if="generatorResult" class="table-responsive">
                    <table class="table table-fixed-3">
                        <thead>
                        <tr>
                            <th class="text-nowrap">
                                <Icon v="mars"/>
                                <T>nouns.masculine</T>
                            </th>
                            <th class="text-nowrap">
                                <Icon v="venus"/>
                                <T>nouns.feminine</T>
                            </th>
                            <th class="text-nowrap">
                                <Icon v="neuter"/>
                                <T>nouns.xNouns.label</T>
                            </th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <td>
                                <ul class="list-singular">
                                    <li v-for="w in generatorResult.masc">{{ w }}</li>
                                </ul>
                                <ul class="list-plural">
                                    <li v-for="w in generatorResult.mascPl">{{ w }}</li>
                                </ul>
                            </td>
                            <td>
                                <ul class="list-singular">
                                    <li v-for="w in generatorResult.fem">{{ w }}</li>
                                </ul>
                                <ul class="list-plural">
                                    <li v-for="w in generatorResult.femPl">{{ w }}</li>
                                </ul>
                            </td>
                            <td>
                                <ul class="list-singular">
                                    <li v-for="w in generatorResult.neutr">
                                        <Declension :word="w" :template="generatorResult.declension"/>
                                    </li>
                                </ul>
                                <ul class="list-plural">
                                    <li v-for="w in generatorResult.neutrPl">
                                        <Declension :word="w" :template="generatorResult.declension" plural/>
                                    </li>
                                </ul>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </div>
                <div v-else class="alert alert-warning">
                    <p class="mb-0">Niestety, podane s??owo nie pasuje do ??adnego naszego szablonu</p>
                </div>
            </div>
        </details>

        <section v-if="sources && Object.keys(sources).length">
            <Literature :sources="sources"/>
        </section>
    </div>
</template>

<script>
    import {Noun, NounDeclension, SourceLibrary} from "../../../src/classes";
    import {head} from "../../../src/helpers";
    import NounsNav from "./NounsNav";
    import templates from './iksatywy.tsv';

    const xDeclension = new NounDeclension({
        M: 'x', D: 'x', C: 'x', B: 'x', N: 'x', Msc: 'x', W: 'x',
        M_pl: 'xx', D_pl: 'xx', C_pl: 'xx', B_pl: 'xx', N_pl: 'xx', Msc_pl: 'xx', W_pl: 'xx',
    });

    export default {
        components: { NounsNav },
        data() {
            return {
                xNouns: [
                    new Noun({
                        id: 'astronauta',
                        masc: 'astronauta', fem: 'astronautka', neutr: 'astronautxa',
                        mascPl: 'astronauci', femPl: 'astronautki', neutrPl: 'astronautxx',
                        declension: xDeclension,
                    }),
                    new Noun({
                        id: 'Europejczyk',
                        masc: 'Europejczyk', fem: 'Europejka', neutr: 'Europejkx',
                        mascPl: 'Europejczycy', femPl: 'Europejki', neutrPl: 'Europejkxx',
                        declension: xDeclension,
                    }),
                    new Noun({
                        id: 'przyjaciel',
                        masc: 'przyjaciel', fem: 'przyjaci????ka', neutr: 'przyjacio??x',
                        mascPl: 'przyjaciele', femPl: 'przyjaci????ki', neutrPl: 'przyjacio??xx',
                        declension: xDeclension,
                    }),
                    new Noun({
                        id: 'tw??rca',
                        masc: 'tw??rca', fem: 'tw??rczyni', neutr: 'tw??rcx',
                        mascPl: 'tw??rcy', femPl: 'tw??rczynie', neutrPl: 'tw??rcxx',
                        declension: xDeclension,
                    }),
                    new Noun({
                        id: 'radny',
                        masc: 'radny', fem: 'radna', neutr: 'radnx',
                        mascPl: 'radni', femPl: 'radne', neutrPl: 'radnxx',
                        declension: xDeclension,
                    }),
                ],
                xDeclension,
                xExtendedDeclension: new NounDeclension({
                    M: 'tx kosmicznx tw??rcx',
                    D: 'tx kosmicznx tw??rcx',
                    C: 'tx kosmicznx tw??rcx',
                    B: 'tx kosmicznx tw??rcx',
                    N: 'tx kosmicznx tw??rcx',
                    Msc: 'tx kosmicznx tw??rcx',
                    W: 'tx kosmicznx tw??rcx',

                    M_pl: 'txx kosmicznxx tw??rcxx',
                    D_pl: 'txx kosmicznxx tw??rcxx',
                    C_pl: 'txx kosmicznxx tw??rcxx',
                    B_pl: 'txx kosmicznxx tw??rcxx',
                    N_pl: 'txx kosmicznxx tw??rcxx',
                    Msc_pl: 'txx kosmicznxx tw??rcxx',
                    W_pl: 'txx kosmicznxx tw??rcxx',
                }),
                sources: undefined,
                templates,
                generatorWord: 'fotograf',
            }
        },
        async mounted() {
            this.sources = {
                '': new SourceLibrary(await this.$axios.$get(`/sources?pronoun=iksatywy`)).getForPronoun('iksatywy'),
            };
        },
        computed: {
            template() {
                let longestMatch = 0;
                let matchingTemplates = [];
                for (let t of templates) {
                    if (!this.generatorWord.endsWith(t.masc)) {
                        continue;
                    }
                    if (t.masc.length > longestMatch) {
                        longestMatch = t.masc.length;
                        matchingTemplates = [t];
                    } else if (t.masc.length === longestMatch) {
                        matchingTemplates.push(t);
                    }
                }

                if (!matchingTemplates.length) {
                    return null;
                }

                return matchingTemplates[0];
            },
            generatorResult() {
                if (!this.template) {
                    return null;
                }

                const root = this.generatorWord.substring(0, this.generatorWord.length - this.template.masc.length);

                const result = {id: null};
                for (let k in this.template) {
                    if (!this.template.hasOwnProperty(k)) { continue; }
                    result[k] = this.template[k].split('/').map(ending => root + ending).join(' / ');
                }

                result.declension = xDeclension;

                return new Noun(result);
            }
        },
        head() {
            return head({
                title: this.$t('nouns.xNouns.header'),
                banner: 'img-local/flags/iksatywy.png',
                description: this.$t('nouns.xNouns.info')[0],
            });
        },
    }
</script>

<style lang="scss" scoped>
    @import "assets/variables";

    figure {
        width: 100%;
        max-width: 24rem;
        padding: $spacer;
        img {
            width: 100%;
        }
        figcaption {
            font-size: $small-font-size;
        }
    }
    @include media-breakpoint-up('md') {
        figure {
            min-width: 20rem;
        }
    }
</style>
