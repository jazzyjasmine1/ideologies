<template>
    <div class="card">
        <div class="card-header">
            <Icon v="plus-circle"/>
            <T>sources.submit.header</T>
        </div>
        <div v-if="$user()" class="card-body">
            <div v-if="afterSubmit" class="alert alert-success text-center">
                <p>
                    <T>sources.submit.thanks</T>
                </p>
                <p>
                    <button class="btn btn-success" @click="afterSubmit = false">
                        <Icon v="plus"/>
                        <T>sources.submit.another</T>
                    </button>
                </p>
            </div>
            <form v-else @submit.prevent="submit">
                <div class="form-group">
                    <label for="type" class="required"><T>sources.submit.type</T></label>
                    <select id="type" class="form-control" v-model="form.type" required>
                        <option value=""></option>
                        <option v-for="t in Object.keys(sourceTypes)" v-if="t !== ''" :value="t">{{$t('sources.type.' + t)}}</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="author"><T>sources.submit.author</T></label>
                    <input type="text" id="author" class="form-control" v-model="form.author"
                           maxlength="255"/>
                </div>
                <div class="form-group">
                    <label for="title" class="required"><T>sources.submit.title</T></label>
                    <input type="text" id="title" class="form-control" v-model="form.title"
                           required maxlength="255"/>
                </div>
                <div class="form-group">
                    <label for="extra"><T>sources.submit.extra</T></label>
                    <input type="text" id="extra" class="form-control" v-model="form.extra"
                           maxlength="255"/>
                </div>
                <div class="form-group">
                    <label for="year"><T>sources.submit.year</T></label>
                    <input type="number" id="year" class="form-control" v-model="form.year"
                           min="0" max="2100"/>
                </div>
                <div class="form-group">
                    <label for="fragments"><T>sources.submit.fragments</T></label>
                    <p class="small text-muted mb-0"><T>sources.submit.fragmentsInfo</T></p>
                    <ListInput v-model="form.fragments" v-slot="s" id="fragments">
                        <textarea v-model="s.val" class="form-control" rows="3" @keyup="s.update(s.val)" required></textarea>
                    </ListInput>
                </div>
                <div class="form-group">
                    <div class="form-check form-switch my-2">
                        <label>
                            <input class="form-check-input" type="checkbox" v-model="form.spoiler">
                            <T>sources.submit.spoiler</T>
                        </label>
                    </div>
                </div>
                <div class="form-group">
                    <label for="pronouns" class="required"><T>sources.submit.pronouns</T></label>
                    <p class="small text-muted mb-0">
                        <T>sources.submit.pronounsInfo</T>
                    </p>
                    <ListInput v-model="form.pronouns">
                        <template v-slot="s">
                            <input v-model="s.val" type="text" class="form-control" @keyup="s.update(s.val)" required maxlength="24"/>
                        </template>
                        <template v-slot:validation="s">
                            <p v-if="s.val && !pronounLibrary.isCanonical(s.val) && !(config.sources.extraTypes || []).includes(s.val)"
                               class="small text-danger"
                            >
                                <Icon v="exclamation-triangle"/>
                                <span class="ml-1"><T>profile.pronounsNotFound</T></span>
                            </p>
                        </template>
                    </ListInput>
                </div>
                <div class="form-group">
                    <label for="comment"><T>sources.submit.comment</T></label>
                    <input type="text" id="comment" class="form-control" v-model="form.comment"
                           maxlength="255"/>
                </div>
                <div class="form-group">
                    <label for="link"><T>sources.submit.link</T></label>
                    <input type="url" id="link" class="form-control" v-model="form.link"
                           maxlength="255"/>
                </div>
                <div class="form-group">
                    <label><T>sources.submit.images</T></label>
                    <ImageWidget v-model="form.images" multiple sizes="big,thumb"/>
                </div>
                <div class="form-group" v-if="$isGranted('sources')">
                    <label for="key"><T>sources.submit.key</T></label>
                    <input type="text" id="key" class="form-control" v-model="form.key"
                           maxlength="255"/>
                    <p class="small text-muted"><T>sources.submit.keyInfo</T></p>
                </div>
                <div class="alert alert-info" v-if="form.base">
                    <Icon v="info-circle"/>
                    <T>nouns.editing</T>
                    <button class="btn btn-sm float-end" @click="form.base = null">
                        <Icon v="times"/>
                    </button>
                </div>
                <button class="btn btn-success w-100" :disabled="submitting">
                    <Icon v="plus-circle"/>
                    <T>sources.submit.action</T>
                </button>
                <p class="small text-muted mt-1"><T>sources.submit.moderation</T></p>
            </form>
        </div>
        <div v-else class="card-body py-5 text-center">
            <T>crud.loginRequired</T>
        </div>
    </div>
</template>

<script>
    import {pronounLibrary} from "../src/data";
    import {Source} from "@/src/classes";

    export default {
        data() {
            return {
                form: {
                    pronouns: [''],
                    type: '',
                    author: '',
                    title: '',
                    extra: '',
                    year: '',
                    fragments: [],
                    comment: '',
                    images: [],
                    link: '',
                    spoiler: false,
                    key: null,
                    base: null,
                },

                sourceTypes: Source.TYPES,

                submitting: false,
                afterSubmit: false,

                pronounLibrary,
            }
        },
        methods: {
            async submit() {
                this.submitting = true;
                try {
                    await this.$post(`/sources/submit`, this.form);

                    this.afterSubmit = true;
                    this.form = {
                        pronouns: [''],
                        type: '',
                        author: '',
                        title: '',
                        extra: '',
                        year: '',
                        fragments: [],
                        comment: '',
                        images: [],
                        link: '',
                        spoiler: false,
                        key: null,
                        base: null,
                    }
                } finally {
                    this.submitting = false;
                }
            },
            edit(source) {
                this.form = {
                    pronouns: source.pronouns,
                    type: source.type,
                    author: source.author,
                    title: source.title,
                    extra: source.extra,
                    year: source.year,
                    fragments: source.fragments,
                    comment: source.comment,
                    images: source.images,
                    link: source.link,
                    spoiler: source.spoiler,
                    key: source.key,
                    base: source.id,
                }
                this.afterSubmit = false;
                this.$el.scrollIntoView();
            },
        },
    }
</script>
