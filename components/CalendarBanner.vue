<template>
    <section v-if="config.calendar && config.calendar.enabled && events !== undefined" class="alert alert-light border">
        <div class="d-flex flex-column-reverse flex-md-row justify-content-between">
            <p class="h3">
                <Icon v="calendar-star"/>
                <T>calendar.banner</T><T>quotation.colon</T>
            </p>
            <p class="small">
                <DateWords :day="day" inline/>
            </p>
        </div>
        <ul class="list-unstyled my-3 ms-3">
            <li v-for="event in events" class="mb-2">
                <CalendarEvent :event="event" :key="event.name"/>
            </li>
        </ul>
        <nuxt-link v-if="link" :to="`/${config.calendar.route}`" class="small">
            <Icon v="angle-right"/>
            <T>calendar.headerLong</T>
        </nuxt-link>
    </section>
</template>

<script>
    import { calendar } from '../src/calendar/calendar';
    import { Day } from '../src/calendar/helpers';

    export default {
        props: {
            day: { 'default': () => Day.today() },
            link: { type: Boolean },
        },
        data() {
            return {
                events: calendar.getCurrentYear().eventsByDate[this.day.toString()],
            }
        }
    }
</script>
