<template>
    <section class="w-100">
        <slot name="header"></slot>
        <div v-if="isLoaded">
            <slot/>
        </div>
        <p class="text-center" v-if="!isLoaded">
            <Spinner :size="size"/>
        </p>
    </section>
</template>

<script>
    export default {
        props: {
            value: { required: true },
            size: {'default': '5rem'},
        },
        computed: {
            isLoaded() {
                return this.value !== undefined;
            },
        },
    };
</script>
