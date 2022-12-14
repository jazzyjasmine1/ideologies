<template>
    <LazyHydrate when-visible>
    <div class="my-2 clearfix" v-if="!deleted">
        <h3 class="h6">
            <Icon :v="source.icon()"/>
            <strong><Spelling v-if="source.author" :text="source.author.replace('^', '')"/><span v-if="source.author"> – </span><em><a v-if="source.link" :href="source.link" target="_blank" rel="noopener"><Spelling :text="addMarks(source.title)"></Spelling></a><Spelling v-else :text="addMarks(source.title)"></Spelling></em></strong><template v-if="source.extra"> (<Spelling :text="source.extra"/>)</template>, {{source.year}}<template v-if="source.comment">; <Spelling :text="source.comment"/></template>
        </h3>
        <ul class="list-inline" v-if="manage && $isGranted('sources')">
            <li v-if="!source.approved" class="list-inline-item">
                <span class="badge bg-danger">
                    <Icon v="map-marker-question"/>
                    <T>nouns.pending</T>
                </span>
            </li>
            <li v-if="source.submitter" class="list-inline-item">
                <nuxt-link :to="`/@${source.submitter}`" class="badge bg-light text-dark border btn-sm m-1">
                    <Icon v="user"/>
                    <span class="btn-label">
                        <T>crud.author</T><T>quotation.colon</T>
                        @{{source.submitter}}
                    </span>
                </nuxt-link>
            </li>
            <li v-if="!source.approved" class="list-inline-item">
                <a href="#" class="badge bg-success btn-sm m-1" @click.prevent="approve()">
                    <Icon v="check"/>
                    <span class="btn-label"><T>crud.approve</T></span>
                </a>
            </li>
            <li v-else class="list-inline-item">
                <a href="#" class="badge bg-light text-dark border border-secondary btn-sm m-1" @click.prevent="hide()">
                    <Icon v="times"/>
                    <span class="btn-label"><T>crud.hide</T></span>
                </a>
            </li>
            <li class="list-inline-item">
                <a href="#" class="badge bg-light text-dark border border-danger btn-sm m-1" @click.prevent="remove()">
                    <Icon v="trash"/>
                    <span class="btn-label"><T>crud.remove</T></span>
                </a>
            </li>
            <li class="list-inline-item">
                <a href="#" class="badge bg-light text-dark border border-primary btn-sm m-1" @click.prevent="$emit('edit-source', source)">
                    <Icon v="pen"/>
                    <span class="btn-label">
                        <T>crud.edit</T>
                    </span>
                </a>
            </li>
            <li class="list-inline-item">
                <span v-for="p in source.pronouns" :class="['badge', pronounLibrary.isCanonical(p) || (config.sources.extraTypes || []).includes(p) ? 'bg-success' : 'bg-danger', 'm-1']">
                    <Spelling :text="p"/>
                </span>
            </li>
            <li class="list-inline-item" v-if="source.key">
                <span class="badge bg-primary text-white">
                    <T>sources.submit.key</T><T>quotation.colon</T> {{source.key}}
                </span>
            </li>
        </ul>
        <div v-if="source.spoiler && !showSpoiler" class="py-3">
            <button type="button" class="btn btn-outline-primary" @click="showSpoiler = true">
                <Icon v="eye-slash"/>
                <T>sources.submit.spoiler</T>
            </button>
        </div>
        <div v-else>
            <div v-if="source.images.length" class="source-images">
                <ImageThumb v-for="image in source.images" :key="image" :id="image" class="m-2" size="8rem"/>
            </div>
            <ul v-if="source.fragments.length">
                <li v-for="fragment in source.fragments" class="text-break">
                    <T>quotation.start</T><Spelling :text="addMarks(fragment.replace(/\n/g, '<br/>'))"></Spelling><T>quotation.end</T>
                </li>
            </ul>
        </div>
        <div v-if="source.versions.length" class="my-3">
            <p>
                <button :class="['btn', versionsShown ? 'btn-primary' : 'btn-outline-primary', 'btn-sm']" @click="versionsShown = !versionsShown">
                    <Icon v="language"/>
                    <T>sources.otherVersions</T>
                    <Icon :v="versionsShown ? 'caret-up' : 'caret-down'"/>
                </button>
            </p>
            <ul v-if="versionsShown" class="clearfix">
                <li v-for="version in source.versions" v-if="locales[version.locale] !== undefined">
                    <h4 class="h6 mb-2">
                        <strong>
                            <a :href="`${locales[version.locale].url}/${version.pronouns[0]}`" target="_blank" rel="noopener">{{locales[version.locale].name}}</a>:
                        </strong>
                    </h4>
                    <Source :source="version"/>
                </li>
            </ul>
        </div>
    </div>
    </LazyHydrate>
</template>

<script>
    import {pronounLibrary} from "../src/data";
    import LazyHydrate from 'vue-lazy-hydration';

    export default {
        components: { LazyHydrate },
        props: {
            source: { required: true },
            manage: { type: Boolean },
        },
        data() {
            return {
                pronounLibrary,
                deleted: false,
                versionsShown: false,
                showSpoiler: false,
            }
        },
        methods: {
            async approve() {
                await this.$post(`/sources/approve/${this.source.id}`);
                this.source.approved = true;
                this.source.base = null;
                this.$forceUpdate();
            },
            async hide() {
                await this.$post(`/sources/hide/${this.source.id}`);
                this.source.approved = false;
                this.$forceUpdate();
            },
            async remove() {
                await this.$confirm(this.$t('crud.removeConfirm'), 'danger');

                await this.$post(`/sources/remove/${this.source.id}`);
                this.deleted = true;
                this.$forceUpdate();
            },
            addMarks(t) {
                return t.replace(/\[\[/g, '<mark>').replace(/]]/g, '</mark>');
            }
        },
    }
</script>

<style lang="scss" scoped>
    @import "assets/variables";

    @include media-breakpoint-down('sm', $grid-breakpoints) {
        .source-images {
            text-align: center;
        }
    }

    @include media-breakpoint-up('md', $grid-breakpoints) {
        .source-images {
            float: right;
            max-width: 18rem;
        }
    }
</style>
