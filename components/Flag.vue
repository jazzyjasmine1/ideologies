<template>
    <span class="flag-wrapper">
        <a v-if="link" :href="`/${config.nouns.route}/${config.terminology.route}#${link.toLowerCase()}`" :title="alt">
            <img :src="img" :alt="name" class="flag-mini rounded"/>
            <Twemoji><Spelling escape :text="name"/><sup v-if="custom" class="text-muted"><small><Icon v="user"/></small></sup><sup v-if="asterisk" class="text-muted"><small>*</small></sup></Twemoji>
        </a>
        <span v-else :title="alt">
            <img :src="img" :alt="name" class="flag-mini rounded"/>
            <Twemoji><Spelling escape :text="name"/><sup v-if="custom" class="text-muted"><small><Icon v="user"/></small></sup><sup v-if="asterisk" class="text-muted"><small>*</small></sup></Twemoji>
        </span>
        <span class="flag-preview bg-white rouded p-2 border">
            <img :src="img" :alt="name" class="rounded"/>
            <span v-if="asterisk" class="alert alert-warning small d-block mt-2 mb-0 p-2">
                *
                <T>profile.flagsAsterisk</T>
            </span>
            <span v-if="custom" class="alert alert-warning small d-block mt-2 mb-0 p-2">
                <Icon v="user"/>
                <T>profile.flagsCustomWarning</T>
            </span>
        </span>
    </span>
</template>

<script>
    export default {
        props: {
            name: { required: true },
            alt: { required: true },
            img: { required: true },
            terms: { },
            custom: { type: Boolean },
            asterisk: { type: Boolean },
        },
        computed: {
            link() {
                if (!this.config.terminology.enabled || !(this.config.terminology.published || this.$isGranted('terms'))) {
                    return null;
                }

                let fallback = null;

                for (let term of this.terms || []) {
                    // exact match
                    if (term.key && term.key.toLowerCase() === this.alt.toLowerCase()) {
                        return term.key;
                    }
                    if (term.term.toLowerCase() === this.name.toLowerCase()) {
                        return this.name;
                    }
                    if (term.original.toLowerCase() === this.alt.toLowerCase()) {
                        return this.alt;
                    }

                    // fallback
                    if (term.key && term.key.toLowerCase().includes(this.alt.toLowerCase())) {
                        fallback = term.key;
                    }
                    if (term.term.toLowerCase().includes(this.name.toLowerCase())) {
                        fallback = this.name;
                    }
                    if (term.original.toLowerCase().includes(this.alt.toLowerCase())) {
                        fallback = this.alt;
                    }
                }

                return fallback;
            },
        },
    }
</script>

<style lang="scss" scoped>
    .flag-mini {
        height: 1rem;
    }

    .flag-wrapper {
        position: relative;

        .flag-preview {
            position: absolute;
            top: 1.5em;
            left: 0;
            z-index: 999;
            display: none;
            img {
                max-height: 128px;
            }
        }

        text-align: left;
        font-weight: normal;

        &:hover {
            .flag-preview {
                display: block;
                span {
                    white-space: normal;
                }
            }
        }
    }
</style>
