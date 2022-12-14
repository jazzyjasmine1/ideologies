<template>
    <section v-if="$user()">
        <div v-if="afterSubmit" class="alert alert-success text-center">
            <p>
                <T>nouns.submit.thanks</T>
            </p>
            <p>
                <button class="btn btn-success" @click="afterSubmit = false">
                    <Icon v="plus"/>
                    <T>nouns.submit.another</T>
                </button>
            </p>
        </div>
        <form v-else @submit.prevent="submit">
            <div class="table-responsive">
                <table :class="'table table-borderless table-sm table-fixed-' + (config.nouns.plurals ? '4' : '3')">
                    <thead>
                    <tr>
                        <th v-if="config.nouns.plurals"></th>
                        <th class="text-nowrap">
                            <Icon v="mars"/>
                            <span class="d-none d-md-inline"><T>nouns.masculine</T></span>
                            <span class="d-md-none"><T>nouns.masculineShort</T></span>
                        </th>
                        <th class="text-nowrap">
                            <Icon v="venus"/>
                            <span class="d-none d-md-inline"><T>nouns.feminine</T></span>
                            <span class="d-md-none"><T>nouns.feminineShort</T></span>
                        </th>
                        <th class="text-nowrap">
                            <Icon v="neuter"/>
                            <span class="d-none d-md-inline"><T>nouns.neuter</T></span>
                            <span class="d-md-none"><T>nouns.neuterShort</T></span>
                        </th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <th v-if="config.nouns.plurals" class="text-nowrap">
                            <span class="d-none d-md-inline">⋅ <T>nouns.singular</T></span>
                            <span class="d-md-none">⋅ <T>nouns.singularShort</T></span>
                        </th>
                        <td>
                            <NounForm v-model="form.masc" required/>
                        </td>
                        <td>
                            <NounForm v-model="form.fem" required/>
                        </td>
                        <td>
                            <NounForm v-model="form.neutr" required/>
                        </td>
                    </tr>
                    <tr v-if="config.nouns.plurals">
                        <th class="text-nowrap">
                            <span class="d-none d-md-inline">⁖ <T>nouns.plural</T></span>
                            <span class="d-md-none">⁖ <T>nouns.pluralShort</T></span>
                        </th>
                        <td>
                            <NounForm v-model="form.mascPl" :required="config.nouns.pluralsRequired"/>
                        </td>
                        <td>
                            <NounForm v-model="form.femPl" :required="config.nouns.pluralsRequired"/>
                        </td>
                        <td>
                            <NounForm v-model="form.neutrPl" :required="config.nouns.pluralsRequired"/>
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div>
            <div v-if="$isGranted('sources')" class="form-group">
                <label><strong><T>sources.referenced</T><T>quotation.colon</T></strong></label>
                <ListInput v-model="form.sources"/>
            </div>
            <div class="alert alert-info" v-if="form.base">
                <Icon v="info-circle"/>
                <T>nouns.editing</T>
                <button class="btn btn-sm float-end" @click="form.base = null">
                    <Icon v="times"/>
                </button>
            </div>

            <template v-if="config.nouns.templates">
                <a v-if="!templateVisible" href="#" @click.prevent="templateVisible = true" class="btn btn-outline-primary w-100 mb-3">
                    <Icon v="copy"/>
                    <T>nouns.template</T>
                </a>
                <div v-else class="card mb-3">
                    <a href="#" class="card-header" @click.prevent="templateVisible = false">
                        <Icon v="copy"/>
                        <T>nouns.template</T>
                    </a>
                    <div class="card-body">
                        <T>nouns.root</T><T>quotation.colon</T> <input class="form-control form-control-sm d-inline-block w-auto" v-model="templateBase" autofocus/>

                        <ul>
                            <li v-for="template in templates" class="my-2">
                                {{ template.toString() }}
                                <button type="button" class="btn btn-outline-primary btn-sm" @click="form = template.fill(templateBase)">
                                    <Icon v="copy"/>
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
            </template>

            <button class="btn btn-primary w-100" :disabled="submitting">
                <template v-if="submitting">
                    <Icon v="circle-notch fa-spin"/>
                </template>
                <template v-else>
                    <Icon v="plus"/>
                    <T>nouns.submit.actionLong</T>
                </template>
            </button>
            <p class="small text-muted mt-1"><T>nouns.submit.moderation</T></p>
            <ul v-if="Object.keys(abbreviations).length > 0" class="small text-muted">
                <li v-for="(meaning, abbr) in abbreviations">
                    {{abbr}} – {{meaning}}
                </li>
            </ul>
        </form>
    </section>
    <section v-else class="text-center">
        <div class="alert alert-info">
            <T>crud.loginRequired</T>
        </div>
    </section>
</template>

<script>
    import { nounTemplates, abbreviations } from '../src/data';

    export default {
        data() {
            return {
                form: {
                    masc: [''],
                    fem: [''],
                    neutr: [''],
                    mascPl: this.config.nouns.pluralsRequired ? [''] : [],
                    femPl: this.config.nouns.pluralsRequired ? [''] : [],
                    neutrPl: this.config.nouns.pluralsRequired ? [''] : [],
                    sources: [],
                    base: null,
                },
                submitting: false,
                afterSubmit: false,
                templates: nounTemplates,
                templateBase: '',
                templateVisible: false,
                abbreviations,
            }
        },
        methods: {
            async submit(event) {
                this.submitting = true;
                try {
                    await this.$post(`/nouns/submit`, this.form);

                    this.afterSubmit = true;
                    this.form = {
                        masc: [''],
                        fem: [''],
                        neutr: [''],
                        mascPl: this.config.nouns.pluralsRequired ? [''] : [],
                        femPl: this.config.nouns.pluralsRequired ? [''] : [],
                        neutrPl: this.config.nouns.pluralsRequired ? [''] : [],
                        sources: [],
                        base: null,
                    };
                    this.templateVisible = false;
                    this.templateBase = '';
                } finally {
                    this.submitting = false;
                }
            },
            edit(word) {
                this.form = {
                    masc: word.masc,
                    fem: word.fem,
                    neutr: word.neutr,
                    mascPl: word.mascPl,
                    femPl: word.femPl,
                    neutrPl: word.neutrPl,
                    sources: word.sources,
                    base: word.id,
                }
                this.afterSubmit = false;
                this.$el.scrollIntoView();
            }
        },
    };
</script>
