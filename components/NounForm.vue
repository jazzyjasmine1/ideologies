<template>
    <div>
        <div v-for="(synonym, i) in val" :key="i" class="input-group input-group-sm p-1">
            <input type="text" class="form-control" v-model="val[i]" required ref="inp" :maxlength="maxlength">
            <button v-if="i || !required" type="button" class="btn btn-outline-danger btn-sm" @click="remove(i)">
                <Icon v="times"/>
            </button>
        </div>
        <div class="p-1">
            <button type="button" class="btn btn-outline-success btn-sm w-100" @click="add">
                <Icon v="plus"/>
            </button>
        </div>
    </div>
</template>

<script>
    export default {
        props: {
            value: {required: true},
            required: {type: Boolean},
            maxlength: {'default': 36},
        },
        data() {
            return {
                val: this.value,
            }
        },
        watch: {
            val() {
                this.$emit('input', this.val);
            },
            value() {
                this.val = this.value;
            },
        },
        methods: {
            add() {
                this.val.push('');
                this.$nextTick(_ => {
                    this.$refs.inp[this.$refs.inp.length - 1].focus()
                })
            },
            remove(i) {
                this.val.splice(i, 1);
            }
        },
    }
</script>
