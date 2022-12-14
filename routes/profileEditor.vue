<template>
    <MustLogin v-if="!$user()"/>
    <div v-else>
        <div class="mb-3 d-flex justify-content-between flex-column flex-md-row">
            <h2 class="text-nowrap">
                <Avatar :user="$user()"/>
                @{{ $user().username }}
            </h2>
            <div>
                <nuxt-link :to="`/@${$user().username}`" class="btn btn-outline-primary btn-sm">
                    <Icon v="id-card"/>
                    <T>profile.show</T>
                </nuxt-link>
            </div>
        </div>

        <form @submit.prevent="save" :class="[saving ? 'saving' : '']">
            <div v-if="$isGranted()" class="border border-primary rounded p-4">
                <h3 class="h4 mb-3">
                    <Icon v="user-cog"/>
                    Admin section
                </h3>

                <p class="small text-muted mb-0">
                    This will be shown on the “Team” page.
                    If you leave it empty, you won't show up there (for this language version).
                    You can use a different display name in different language versions.
                </p>

                <div class="form-group">
                    <label for="teamName">Team page display name:</label>
                    <input class="form-control" name="teamName" maxlength="64" v-model="teamName"/>
                    <PropagateCheckbox field="teamName" :before="beforeChanges.teamName" :after="teamName" v-if="otherProfiles > 0" @change="propagateChanged"/>
                </div>

                <hr/>

                <p class="small text-muted mb-0">
                    If you feel that you've contributed to this language version enough to get credited in the footer
                    (not saying how much that is, that's on you to decide 😉),
                    then add your name and areas here (in the local language!).
                    The team as a whole will be credited in the footer either way.
                </p>

                <div class="form-group">
                    <label for="footerName">Footer display name:</label>
                    <input class="form-control" name="footerName" maxlength="64" v-model="footerName"/>
                    <PropagateCheckbox field="footerName" :before="beforeChanges.footerName" :after="footerName" v-if="otherProfiles > 0" @change="propagateChanged"/>
                </div>

                <div class="form-group">
                    <label for="footerAreas">Areas responsible for / contributing to:</label>
                    <ListInput v-model="footerAreas"/>
                </div>

                <template v-if="$te('contact.team.credentials')">
                    <hr/>

                    <p class="small text-muted mb-0">
                        This will be displayed on the team page in the "Credentials" section.
                        You might want to put here your full legal name here, but it's not required
                        (you can leave this field empty).
                    </p>

                    <div class="form-group">
                        <label for="credentials">Credentials:</label>
                        <ListInput v-model="credentials"/>
                    </div>

                    <div class="form-group">
                        <label for="credentials">Credentials level:</label>
                        <select v-model="credentialsLevel" class="form-select">
                            <option :value="null"></option>
                            <option :value="1">Higher education, but irrelevant field</option>
                            <option :value="2">Bachelor (not completed yet)</option>
                            <option :value="3">Bachelor</option>
                            <option :value="4">Master (not completed yet)</option>
                            <option :value="5">Master</option>
                            <option :value="6">PhD (not completed yet)</option>
                            <option :value="7">PhD</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="credentials">Name for credentials:</label>
                        <input v-model="credentialsName" class="form-control" placeholder="(not required)"/>
                    </div>
                </template>
            </div>

            <section>
                <OpinionLegend/>
            </section>

            <section class="form-group">
                <h3 class="h4">
                    <Icon v="signature"/>
                    <T>profile.names</T>
                </h3>
                <p v-if="$te('profile.namesInfo')" class="small text-muted">
                    <T>profile.namesInfo</T>
                </p>
                <OpinionListInput v-model="names"/>
                <PropagateCheckbox field="names" :before="beforeChanges.names" :after="names" v-if="otherProfiles > 0" @change="propagateChanged"/>
            </section>

            <section class="form-group">
                <h3 class="h4">
                    <Icon v="tags"/>
                    <T>profile.pronouns</T>
                </h3>
                <div class="alert alert-info" v-if="$t('profile.pronounsInfo')">
                    <p class="small mb-0">
                        <Icon v="info-circle"/>
                        <T>profile.pronounsInfo</T>
                    </p>
                </div>
                <OpinionListInput v-model="pronouns" :validation="validatePronoun"/>
            </section>

            <section class="form-group">
                <h3 class="h4">
                    <Icon v="comment-edit"/>
                    <T>profile.description</T>
                </h3>
                <textarea class="form-control form-control-sm" v-model="description" maxlength="256" rows="8"/>
            </section>

            <section class="form-group">
                <h3 class="h4">
                    <Icon v="flag"/>
                    <T>profile.flags</T>
                </h3>
                <p class="small text-muted mb-0">
                    <T>profile.flagsInfo</T>
                </p>
                <ButtonList v-model="flags" :options="allFlags" v-slot="s">
                    <Flag
                        :name="s.desc.split('|')[0]"
                        :alt="s.desc.split('|')[1]"
                        :img="`/flags/${s.v}.png`"
                        :asterisk="flagsAsterisk.includes(s.v)"
                    />
                </ButtonList>
                <PropagateCheckbox field="flags" :before="beforeChanges.flags" :after="flags" v-if="otherProfiles > 0" @change="propagateChanged"/>

                <details class="form-group border rounded" :open="Object.keys(customFlags).length > 0">
                    <summary class="px-3 py-2">
                        <T>profile.flagsCustom</T>
                    </summary>
                    <div class="border-top">
                        <ImageWidgetRich v-model="customFlags" sizes="flag"/>
                    </div>
                </details>
                <PropagateCheckbox field="customFlags" :before="beforeChanges.customFlags" :after="customFlags" v-if="otherProfiles > 0" @change="propagateChanged"/>
                <Answer question="flags" small/>
            </section>

            <section class="form-group">
                <h3 class="h4">
                    <Icon v="link"/>
                    <T>profile.links</T>
                </h3>
                <ListInput v-model="links" v-slot="s">
                    <input v-model="s.val" type="url" class="form-control" @keyup="s.update(s.val)" @paste="$nextTick(() => s.update(s.val))" @change="s.update(s.val)" required/>
                </ListInput>
                <PropagateCheckbox field="links" :before="beforeChanges.links" :after="links" v-if="otherProfiles > 0" @change="propagateChanged"/>
                <p class="small text-muted mb-0">
                    <Icon v="ad"/>
                    <T>profile.linksRecommended</T>
                    <a v-for="provider in recommendedLinkProviders()" :href="provider.homepage" target="_blank" rel="noopener">
                        <Icon :v="provider.icon" :set="provider.iconSet || 'l'"/>
                        {{ provider.name }}
                    </a>
                    <T silent>profile.linksRecommendedAfter</T>
                    😉
                </p>
                <p v-if="$te('profile.linksWarning')" class="small text-muted mt-2 mb-0">
                    <Icon v="exclamation-triangle"/>
                    <T>profile.linksWarning</T>
                </p>
            </section>

            <section class="form-group">
                <h3 class="h4">
                    <Icon v="birthday-cake"/>
                    <T>profile.birthday</T>
                    <button type="button" class="btn btn-outline-danger btn-sm" v-if="birthday !== null" @click="birthday = null">
                        <Icon v="times"/>
                        <T>crud.remove</T>
                    </button>
                </h3>
                <p class="small text-muted">
                    <T>profile.birthdayInfo</T>
                </p>
                <div class="input-group mb-3">
                    <datepicker v-model="birthday" inline :disabled-dates="disabledDates" initial-view="year"/>
                </div>
                <PropagateCheckbox field="birthday" :before="beforeChanges.birthday" :after="birthday" v-if="otherProfiles > 0" @change="propagateChanged"/>
            </section>

            <section class="form-group">
                <div class="h4 d-flex justify-content-between">
                    <h3 class="h4">
                        <Icon v="scroll-old"/>
                        <T>profile.words</T>
                    </h3>
                    <button type="button" class="btn btn-outline-warning btn-sm" @click.prevent="resetWords">
                        <T>profile.editor.defaults</T>
                    </button>
                </div>
                <template v-for="i in [0, 1, 2, 3]">
                    <h4 class="h5">
                        <T>profile.column</T> {{i + 1}}
                    </h4>
                    <OpinionListInput v-model="words[i]" group="words"/>
                </template>
            </section>

            <section>
                <button class="btn btn-primary w-100" type="submit">
                    <Icon v="save"/>
                    <T>profile.editor.save</T>
                </button>
            </section>
        </form>
    </div>
</template>

<script>
    import {head, dictToList, listToDict, buildList, buildDict} from "../src/helpers";
    import { pronouns } from "~/src/data";
    import { buildPronoun } from "../src/buildPronoun";
    import config from '../data/config.suml';
    import link from '../plugins/link';
    import {minBirthdate, maxBirthdate, formatDate} from '../src/birthdate';

    const defaultWords = config.profile.defaultWords.map(c => buildList(function* () {
        for (let word of c) {
            yield {key: word, value: 0};
        }
    }))

    const buildProfile = (profiles, currentLocale) => {
        for (let locale in profiles) {
            if (!profiles.hasOwnProperty(locale)) {
                continue;
            }
            if (locale === currentLocale) {
                const profile = profiles[locale];
                return {
                    names: dictToList(profile.names),
                    pronouns: dictToList(profile.pronouns),
                    description: profile.description,
                    birthday: profile.birthday,
                    links: Object.keys(profile.links).length ? profile.links : [],
                    flags: profile.flags,
                    customFlags: profile.customFlags,
                    words: profile.words.map(x => dictToList(x)),
                    teamName: profile.teamName,
                    footerName: profile.footerName,
                    footerAreas: profile.footerAreas,
                    credentials: profile.credentials,
                    credentialsLevel: profile.credentialsLevel,
                    credentialsName: profile.credentialsName,
                };
            }
        }

        for (let locale in profiles) {
            if (!profiles.hasOwnProperty(locale)) {
                continue;
            }
            const profile = profiles[locale];
            return {
                names: dictToList(profile.names),
                pronouns: [],
                description: '',
                birthday: profile.birthday,
                links: Object.keys(profile.links).length ? profile.links : [],
                flags: profile.flags.filter(f => !f.startsWith('-')),
                customFlags: profile.customFlags,
                words: [...defaultWords],
                teamName: profile.teamName,
                footerName: profile.footerName,
                footerAreas: [],
                credentials: [],
                credentialsLevel: null,
                credentialsName: null,
            };
        }

        return {
            names: [],
            pronouns: [],
            description: '',
            birthday: null,
            links: [],
            flags: [],
            customFlags: {},
            words: [...defaultWords],
            teamName: '',
            footerName: '',
            footerAreas: [],
            credentials: [],
            credentialsLevel: null,
            credentialsName: null,
        };
    };

    export default {
        mixins: [link],
        data() {
            return {
                saving: false,
                disabledDates: {
                    to: minBirthdate,
                    from: maxBirthdate,
                },
                propagate: [],
                flagsAsterisk: process.env.FLAGS_ASTERISK,
            };
        },
        async asyncData({ app, store }) {
            if (!store.state.user) {
                return {};
            }

            const profiles = (await app.$axios.$get(`/profile/get/${encodeURIComponent(store.state.user.username)}`, { headers: {
                authorization: 'Bearer ' + store.state.token,
            } })).profiles;

            const profile = buildProfile(profiles, app.context.env.LOCALE);

            return {
                ...profile,
                beforeChanges: JSON.parse(JSON.stringify(profile)),
                otherProfiles: Object.keys(profiles).filter(l => l !== app.context.env.LOCALE).length,
            };
        },
        mounted() {
            if (process.client && !this.$user()) {
                window.sessionStorage.setItem('after-login', window.location.pathname);
                this.$router.push('/' + this.config.user.route);
            }
        },
        methods: {
            async save() {
                this.saving = true;
                try {
                    await this.$post(`/profile/save`, {
                        names: listToDict(this.names),
                        pronouns: listToDict(this.pronouns),
                        description: this.description,
                        birthday: formatDate(this.birthday),
                        links: [...this.links],
                        flags: [...this.flags],
                        customFlags: {...this.customFlags},
                        words: this.words.map(x => listToDict(x)),

                        teamName: this.teamName,
                        footerName: this.footerName,
                        footerAreas: this.footerAreas,
                        credentials: this.credentials,
                        credentialsLevel: this.credentialsLevel,
                        credentialsName: this.credentialsName,

                        propagate: this.propagate,
                    });
                    this.$router.push(`/@${this.$user().username}`);
                } finally {
                    this.saving = false;
                }
            },
            normalisePronoun(pronoun) {
                try {
                    return decodeURIComponent(
                        pronoun
                            .toLowerCase()
                            .trim()
                            .replace(new RegExp('^' + this.$base), '')
                            .replace(new RegExp('^' + this.$base.replace(/^https?:\/\//, '')), '')
                            .replace(new RegExp('^/'), '')
                    );
                } catch {
                    return null;
                }
            },
            normaliseAndBuildPronoun(pronoun) {
                return buildPronoun(pronouns, this.normalisePronoun(pronoun));
            },
            validatePronoun(pronoun) {
                pronoun = this.normalisePronoun(pronoun);
                if (!pronoun) {
                    return 'profile.pronounsNotFound';
                }
                return pronoun === this.config.pronouns.any
                    || pronoun.startsWith(this.config.pronouns.any + ':')
                    || (this.config.pronouns.null && this.config.pronouns.null.routes && this.config.pronouns.null.routes.includes(pronoun))
                    || (this.config.pronouns.mirror && this.config.pronouns.mirror.route === pronoun)
                    || buildPronoun(pronouns, pronoun)
                        ? null
                        : 'profile.pronounsNotFound'
            },
            async resetWords() {
                await this.$confirm();

                this.words = [...defaultWords];
            },
            propagateChanged(field, checked) {
                this.propagate = this.propagate.filter(f => f !== field);
                if (checked) {
                    this.propagate.push(field);
                }
            },
        },
        computed: {
            mainPronoun() {
                let mainPronoun = buildPronoun(pronouns, this.config.profile.flags.defaultPronoun);
                let mainOpinion = -1;
                for (let {key: pronoun, value: opinion} of this.pronouns) {
                    if (opinion === 2) {
                        opinion = 0.5;
                    }
                    if (opinion > mainOpinion) {
                        const p = this.normaliseAndBuildPronoun(pronoun);
                        if (p) {
                            mainPronoun = p;
                            mainOpinion = opinion;
                        }
                    }
                }

                return mainPronoun;
            },
            allFlags() {
                const that = this;
                const flags = buildList(function*() {
                    for (let key in process.env.FLAGS) {
                        if (!process.env.FLAGS.hasOwnProperty(key)) { continue; }
                        yield [
                            key,
                            (key.startsWith('-') ? process.env.FLAGS[key] : that.$translateForPronoun(process.env.FLAGS[key], that.mainPronoun))
                                + '|' + process.env.FLAGS[key]
                        ];
                    }
                });

                flags.sort((a, b) => a[1].localeCompare(b[1]));

                return buildDict(function *() {
                    for (let [key, display] of flags) {
                        yield [key, display];
                    }
                });
            },
        },
        head() {
            return head({
                title: this.$t('profile.editor.header'),
            });
        },
    }
</script>

<style lang="scss" scoped>
    .avatar {
        width: 100%;
        max-width: 5rem;
        max-height: 5rem;
    }
    .saving {
        opacity: .5;
    }
    section.form-group {
        margin-bottom: 5rem;
    }
</style>
