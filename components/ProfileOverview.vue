<template>
    <div class="d-flex justify-content-between align-items-center">
        {{ locales[locale].name }}
        <span v-if="profile">
            <LocaleLink :locale="locale" :link="`/@${username}`" class="badge bg-primary text-white text-white">
                <Icon v="id-card"/>
                <T>profile.show</T>
            </LocaleLink>
            <LocaleLink :locale="locale" link="/editor" class="badge bg-light text-dark border">
                <Icon v="edit"/>
                <T>profile.edit</T>
            </LocaleLink>
            <Spinner v-if="deleting"/>
            <a v-else href="#" class="badge bg-light text-dark" @click.prevent="removeProfile(locale)" :aria-label="$t('profile.delete')">
                <Icon v="trash-alt"/>
            </a>
        </span>
        <span v-else>
            <LocaleLink :locale="locale" link="/editor" class="badge bg-light text-dark border">
                <Icon v="plus-circle"/>
                <T>profile.init</T>
            </LocaleLink>
        </span>
    </div>
</template>

<script>
    export default {
        props: {
            username: { required: true },
            profile: { required: true },
            locale: { required: true },
        },
        data() {
            return {
                deleting: false,
            }
        },
        methods: {
            async removeProfile(locale) {
                await this.$confirm(this.$t('profile.deleteConfirm'), 'danger');

                this.deleting = true;
                try {
                    const response = await this.$post(`/profile/delete/${locale}`);
                    this.$emit('update', response);
                } finally {
                    this.deleting = false;
                }
            },
        },
    }
</script>
