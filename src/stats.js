const {decodeTime} = require('ulid');
const mailer = require('./mailer');
const Plausible = require('plausible-api');
const fetch = require('node-fetch');

// TODO all the duplication...
const buildDict = (fn, ...args) => {
    const dict = {};
    for (let [key, value] of fn(...args)) {
        dict[key] = value;
    }
    return dict;
}

const zip = (list, reverse) => {
    return buildDict(function* () {
        for (let [k, v] of list) {
            yield reverse ? [v, k] : [k, v];
        }
    });
}

const sortByValue = (obj, reverse = false, firstN = -1) => {
    let list = [];
    for (let i in obj) {
        if (obj.hasOwnProperty(i)) {
            list.push([parseInt(obj[i]), i]);
        }
    }
    list = list.sort((a, b) => reverse ? b[0] - a[0] : a[0] - b[0]);
    if (firstN >= 0) {
        list = list.slice(0, firstN);
    }

    return zip(list, true);
}

const formatMonth = d => `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;

const buildChart = (rows) => {
    const dates = rows.map(row => new Date(decodeTime(row.id)));

    const chart = {};

    let loop = dates[0];
    const end = dates[dates.length - 1];
    while(loop <= end){
        chart[formatMonth(loop)] = 0;
        loop = new Date(loop.setDate(loop.getDate() + 1));
    }
    if (!loop) {
        return {};
    }
    chart[formatMonth(loop)] = 0;

    for (let date of dates) {
        chart[formatMonth(date)]++;
    }

    return chart;
}

module.exports.statsFile = process.env.STATS_FILE.replace('%projectdir%', __dirname + '/..')

const plausibleClient = new Plausible(process.env.PLAUSIBLE_API_KEY, process.env.PLAUSIBLE_API_HOST + '/api/v1/stats');

const checkPlausible = async (url) => {
    let plausible = undefined;

    try {
        const domain = url.replace(new RegExp('^https?://'), '')
        plausible = await plausibleClient.aggregate(domain, '30d', ['visitors', 'pageviews', 'visit_duration'])
        plausible.realTimeVisitors = await plausibleClient.getRealtimeVisitors(domain);
    } catch {}

    return plausible;
}

const upptimeApiBase = `https://raw.githubusercontent.com/${process.env.UPPTIME_REPO}/master/api`;

const checkUpptime = async (url) => {
    let upptime = undefined;

    try {
        const domain = url.replace(new RegExp('^https?://'), '').replace(/\./g, '-');
        upptime = {
            uptime: (await (await fetch(`${upptimeApiBase}/${domain}/uptime-month.json`)).json()).message,
            responseTime: (await (await fetch(`${upptimeApiBase}/${domain}/response-time-month.json`)).json()).message,
        };
    } catch {}

    return upptime;
}

module.exports.calculateStats = async (db, allLocales) => {
    const users = {
        overall: (await db.get(`SELECT count(*) AS c FROM users`)).c,
        admins: (await db.get(`SELECT count(*) AS c FROM users WHERE roles!=''`)).c,
        chart: buildChart(await db.all(`SELECT id FROM users ORDER BY id`)),
    };

    const home = {
        plausible: await checkPlausible('https://pronouns.page'),
        //upptime: await checkUpptime('https://pronouns.page'),
    };

    const locales = {};
    for (let locale in allLocales) {
        if (!allLocales.hasOwnProperty(locale)) { continue; }

        const profiles = await db.all(`SELECT pronouns, flags FROM profiles WHERE locale='${locale}'`);
        const pronouns = {}
        const flags = {}
        for (let profile of profiles) {
            const pr = JSON.parse(profile.pronouns);
            for (let pronoun in pr) {
                if (!pr.hasOwnProperty(pronoun)) { continue; }

                if (pronoun.includes(',') || pr[pronoun] < 0) {
                    continue;
                }
                const p = pronoun.replace(/^.*:\/\//, '').replace(/^\//, '').toLowerCase().replace(/^[a-z]+\.[^/]+\//, '');
                if (pronouns[p] === undefined) {
                    pronouns[p] = 0;
                }
                pronouns[p] += pr[pronoun] === 1 ? 1 : 0.5;
            }

            const fl = JSON.parse(profile.flags);
            for (let flag of fl) {
                if (flags[flag] === undefined) {
                    flags[flag] = 0;
                }
                flags[flag] += 1;
            }
        }

        locales[locale] = {
            name: allLocales[locale].name,
            url: allLocales[locale].url,
            profiles: profiles.length,
            pronouns: sortByValue(pronouns, true, 36),
            flags: sortByValue(flags, true, 36),
            nouns: {
                approved: (await db.get(`SELECT count(*) AS c FROM nouns WHERE locale='${locale}' AND approved=1 AND deleted=0`)).c,
                awaiting: (await db.get(`SELECT count(*) AS c FROM nouns WHERE locale='${locale}' AND approved=0 AND deleted=0`)).c,
            },
            chart: buildChart(await db.all(`SELECT id FROM profiles WHERE locale='${locale}' ORDER BY id`)),
            plausible: await checkPlausible(allLocales[locale].url),
            //upptime: await checkUpptime(allLocales[locale].url),
        };
    }

    const cardsQueue = (await db.get(`SELECT count(*) as c FROM profiles WHERE card = '' OR cardDark = ''`)).c;

    if (cardsQueue > 64) {
        mailer('contact@pronouns.page', 'cardsWarning', {count: cardsQueue});
    }

    return { calculatedAt: parseInt(new Date() / 1000), users, home, locales, cardsQueue };
}
