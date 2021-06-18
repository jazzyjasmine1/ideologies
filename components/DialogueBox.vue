<template>
    <div :class="['modal', shown ? 'd-block' : '']" @click="hideClick">
        <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content shadow">
                <div class="modal-header" v-if="choice">
                    <p class="h5 modal-title">
                        <Icon v="map-marker-question"/>
                        {{$t('confirm.header')}}
                    </p>
                </div>
                <div class="modal-body">
                    <p class="py-5 text-center" v-html="message"></p>
                </div>
                <div v-if="choice" class="modal-footer">
                    <button class="btn btn-outline-dark" @click="cancel">
                        {{$t('confirm.no')}}
                    </button>
                    <button :class="'btn btn-' + (color || 'primary')" @click="confirm">
                        {{$t('confirm.yes')}}
                    </button>
                </div>
                <div v-else class="modal-footer">
                    <button :class="'btn btn-' + (color || 'primary')" @click="confirm">
                        {{$t('confirm.ok')}}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                shown: false,
                choice: false,
                message: undefined,
                resolve: undefined,
                reject: undefined,
                color: null,
            }
        },
        mounted() {
            if (process.client) {
                window.addEventListener('keydown', e => {
                    if (!this.shown) {
                        return;
                    }

                    if (e.keyCode === 27) {
                        e.stopPropagation();
                        e.preventDefault();
                        this.cancel();
                    } else if (e.keyCode === 13) {
                        e.stopPropagation();
                        e.preventDefault();
                        this.confirm();
                    }
                });
            }
        },
        methods: {
            show(choice, message, color, resolve, reject) {
                this.choice = choice;
                this.message = message;
                this.resolve = resolve;
                this.reject = reject;
                this.color = color;
                this.shown = true;
            },
            confirm() {
                const resolve = this.resolve;
                this.shown = false;
                this.choice = false;
                this.message = undefined;
                this.resolve = undefined;
                this.reject = undefined;
                this.color = null;
                if (resolve) {
                    resolve();
                }
            },
            cancel(event) {
                const reject = this.reject;
                this.shown = false;
                this.message = undefined;
                this.resolve = undefined;
                this.reject = undefined;
                this.color = null;
                if (reject) {
                    reject();
                }
            },
            hideClick(event) {
                if (event.target === this.$el) {
                    this.cancel();
                }
            },
        },
    };
</script>

<style lang="scss" scoped>
    @import "assets/variables";

    .modal {
        background-color: rgba($black, 0.5);
    }
</style>