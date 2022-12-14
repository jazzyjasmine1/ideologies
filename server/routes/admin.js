import { Router } from 'express';
import SQL from 'sql-template-strings';
import avatar from '../avatar';
import {buildDict, now, shuffle, handleErrorAsync} from "../../src/helpers";
import locales from '../../src/locales';
import {calculateStats, statsFile} from '../../src/stats';
import fs from 'fs';
import { caches }  from "../../src/cache";
import mailer from "../../src/mailer";
import {profilesSnapshot} from "./profile";
import buildLocaleList from "../../src/buildLocaleList";
import {archiveBan, liftBan} from "../ban";
import marked from 'marked';
import {loadCurrentUser} from "./user";
import {encodeTime} from "ulid";

const router = Router();

router.get('/admin/list', handleErrorAsync(async (req, res) => {
    return res.json(await caches.admins.fetch(async () => {
        const admins = await req.db.all(SQL`
            SELECT u.username, p.teamName, p.locale, u.id, u.email, u.avatarSource, p.credentials, p.credentialsLevel, p.credentialsName, a.payload
            FROM users u
                LEFT JOIN profiles p ON p.userId = u.id
                LEFT JOIN authenticators a ON u.id = a.userId AND a.type = u.avatarSource 
            WHERE p.teamName IS NOT NULL
              AND p.teamName != ''
              AND (a.validUntil IS NULL OR a.validUntil > ${now()})
            ORDER BY RANDOM()
        `);

        const adminsGroupped = buildDict(function* () {
            yield [global.config.locale, []];
            for (let [locale, , , published] of locales) {
                if (locale !== global.config.locale && published) {
                    yield [locale, []];
                }
            }
            yield ['', []];
        });
        for (let admin of admins) {
            admin.avatar = await avatar(req.db, admin);
            delete admin.id;
            delete admin.email;
            delete admin.payload;
            if (admin.credentials) {
                admin.credentials = admin.credentials.split('|');
            }

            if (adminsGroupped[admin.locale] !== undefined) {
                adminsGroupped[admin.locale].push(admin);
            } else {
                adminsGroupped[''].push(admin);
            }
        }

        return adminsGroupped;
    }));
}));

router.get('/admin/list/footer', handleErrorAsync(async (req, res) => {
    return res.json(shuffle(await caches.adminsFooter.fetch(async () => {
        const fromDb = await req.db.all(SQL`
            SELECT u.username, p.footerName, p.footerAreas, p.locale
            FROM users u
            LEFT JOIN profiles p ON p.userId = u.id
            WHERE p.locale = ${global.config.locale}
              AND p.footerName IS NOT NULL AND p.footerName != ''
              AND p.footerAreas IS NOT NULL AND p.footerAreas != ''
        `);

        const fromConfig = global.config.contact.authors || [];

        return [...fromDb, ...fromConfig];
    })));
}));

router.get('/admin/users', handleErrorAsync(async (req, res) => {
    if (!req.isGranted('users')) {
        return res.status(401).json({error: 'Unauthorised'});
    }

    const conditions = [];

    let sql = SQL`
        SELECT u.id, u.username, u.email, u.roles, u.avatarSource, group_concat(p.locale) AS profiles
        FROM users u
        LEFT JOIN profiles p ON p.userId = u.id
    `

    if (req.query.filter) {
        conditions.push(SQL`(lower(u.username) LIKE ${'%' + req.query.filter.toLowerCase() + '%'} OR lower(u.email) LIKE ${'%' + req.query.filter.toLowerCase() + '%'})`);
    }
    if (req.query.localeFilter) {
        conditions.push(SQL`p.locale=${global.config.locale}`);
    }
    if (req.query.adminsFilter) {
        conditions.push(SQL`u.roles != ''`);
    }

    let conditionsSql = SQL``;
    if (conditions.length) {
        let i = 0;
        for (let condition of conditions) {
            conditionsSql = conditionsSql.append(i++ ? SQL` AND ` : SQL` WHERE `).append(condition);
        }
    }

    sql = sql.append(conditionsSql).append(SQL`
        GROUP BY u.id
        ORDER BY u.id DESC
        LIMIT ${parseInt(req.query.limit || 100)}
        OFFSET ${parseInt(req.query.offset || 0)}
    `);

    const countSql = SQL`SELECT COUNT(*) AS c FROM (SELECT u.id FROM users u LEFT JOIN profiles p ON p.userId = u.id`.append(conditionsSql).append(` GROUP BY u.id)`);

    return res.json({
        count: (await req.db.get(countSql)).c,
        data: (await req.db.all(sql)).map(u => {
            u.profiles = u.profiles ? u.profiles.split(',') : [];
            return u;
        }),
    });
}));

const fetchStats = async () => {
    if (fs.existsSync(statsFile)) {
        return JSON.parse(fs.readFileSync(statsFile));
    }

    const stats = await calculateStats(req.db, buildLocaleList(global.config.locale));
    fs.writeFileSync(statsFile, JSON.stringify(stats));
    return stats;
}

router.get('/admin/stats', handleErrorAsync(async (req, res) => {
    if (!req.isGranted('panel')) {
        return res.status(401).json({error: 'Unauthorised'});
    }

    const stats = await fetchStats();

    for (let locale in stats.locales) {
        if (stats.locales.hasOwnProperty(locale) && !req.isGranted('panel', locale)) {
            delete stats.locales[locale];
        }
    }

    return res.json(stats);
}));

router.get('/admin/stats-public', handleErrorAsync(async (req, res) => {
    const statsAll = await fetchStats();

    const stats = {
        calculatedAt: statsAll.calculatedAt,
        overall: {
            users: statsAll.users.overall,
            cards: 0,
            pageViews: statsAll.home.plausible.pageviews,
            visitors: statsAll.home.plausible.visitors,
            online: statsAll.home.plausible.realTimeVisitors,
        },
        current: {},
    }

    for (let [locale, localeStats] of Object.entries(statsAll.locales)) {
        stats.overall.cards += localeStats.profiles;
        if (locale === global.config.locale) {
            stats.current = {
                cards: localeStats.profiles,
            }
        }
        if (localeStats.plausible) {
            stats.overall.pageViews += localeStats.plausible.pageviews;
            stats.overall.visitors += localeStats.plausible.visitors;
            stats.overall.online += localeStats.plausible.realTimeVisitors;
            if (locale === global.config.locale) {
                stats.current.pageViews = localeStats.plausible.pageviews;
                stats.current.visitors = localeStats.plausible.visitors;
                stats.current.online = localeStats.plausible.realTimeVisitors;
                stats.current.visitDuration = localeStats.plausible.visit_duration;
            }
        }
        if (localeStats.upptime) {
            stats.current.uptime = localeStats.upptime.uptime;
            stats.current.responseTime = localeStats.upptime.responseTime;
        }
    }

    return res.json(stats);
}));

const normalise = s => s.trim().toLowerCase();

router.post('/admin/ban/:username', handleErrorAsync(async (req, res) => {
    if (!req.isGranted('users')) {
        return res.status(401).json({error: 'Unauthorised'});
    }

    const user = await req.db.get(SQL`SELECT id, email FROM users WHERE usernameNorm = ${normalise(req.params.username)}`);
    if (!user) {
        return res.status(400).json({error: 'No such user'});
    }

    if (req.body.reason) {
        if (!req.body.terms.length) {
            return res.status(400).json({error: 'Terms are required'});
        }
        await req.db.get(SQL`
            UPDATE users
            SET bannedReason = ${req.body.reason},
                bannedTerms = ${req.body.terms.join(',')},
                bannedBy = ${req.user.id},
                banSnapshot = ${await profilesSnapshot(req.db, normalise(req.params.username))}
            WHERE id = ${user.id}
        `);
        await archiveBan(req.db, user);
        mailer(user.email, 'ban', {reason: req.body.reason, username: normalise(req.params.username)});
    } else {
        await req.db.get(SQL`
            UPDATE users
            SET bannedReason = null
            WHERE id = ${user.id}
        `);
        await liftBan(req.db, user);
    }

    await req.db.get(SQL`
        UPDATE reports
        SET isHandled = 1 
        WHERE userId = ${user.id}
    `);

    return res.json(true);
}));

router.get('/admin/reports', handleErrorAsync(async (req, res) => {
    if (!req.isGranted('users')) {
        return res.status(401).json({error: 'Unauthorised'});
    }

    const cutoff = encodeTime(Date.now() - 3*31*24*60*60*1000, 10) + '0'.repeat(16);

    return res.json(await req.db.all(SQL`
        SELECT reports.id, group_concat(p.locale) as profiles, sus.username AS susUsername, reporter.username AS reporterUsername, reports.comment, reports.isAutomatic, reports.isHandled
        FROM reports
            LEFT JOIN users sus ON reports.userId = sus.id
            LEFT JOIN users reporter ON reports.reporterId = reporter.id
            LEFT JOIN profiles p on sus.id = p.userId
        WHERE reports.id > ${cutoff}
        GROUP BY reports.id
        ORDER BY min(reports.isHandled) ASC, reports.id DESC
    `));
}));

router.get('/admin/reports/:id', handleErrorAsync(async (req, res) => {
    if (!req.isGranted('users')) {
        return res.status(401).json({error: 'Unauthorised'});
    }

    return res.json(await req.db.all(SQL`
        SELECT reports.id, sus.username AS susUsername, reporter.username AS reporterUsername, reports.comment, reports.isAutomatic, reports.isHandled
        FROM reports
        LEFT JOIN users sus ON reports.userId = sus.id
        LEFT JOIN users reporter ON reports.reporterId = reporter.id
        WHERE reports.userId = ${req.params.id}
        ORDER BY reports.isHandled ASC, reports.id DESC
    `));
}));

router.post('/admin/reports/handle/:id', handleErrorAsync(async (req, res) => {
    if (!req.isGranted('users')) {
        return res.status(401).json({error: 'Unauthorised'});
    }

    await req.db.get(SQL`
        UPDATE reports
        SET isHandled = 1
        WHERE id=${req.params.id}
    `);

    return res.json(true);
}));

router.get('/admin/moderation', handleErrorAsync(async (req, res) => {
    if (!req.isGranted('users')) {
        return res.status(401).json({error: 'Unauthorised'});
    }

    const dir = __dirname + '/../../moderation';
    const susRegexes = fs.readFileSync(dir + '/sus.txt').toString('utf-8').split('\n').filter(x => !!x);
    const rulesUsers = marked(fs.readFileSync(dir + '/rules-users.md').toString('utf-8'));
    const rulesTerminology = marked(fs.readFileSync(dir + '/rules-terminology.md').toString('utf-8'));
    const rulesSources = marked(fs.readFileSync(dir + '/rules-sources.md').toString('utf-8'));

    return res.json({
        susRegexes,
        rulesUsers,
        rulesTerminology,
        rulesSources,
    })
}));

router.post('/admin/set-notification-frequency', handleErrorAsync(async (req, res) => {
    if (!req.isGranted()) {
        return res.status(401).json({error: 'Unauthorised'});
    }

    if (![0, 1, 7].includes(req.body.frequency)) {
        return res.status(400).json({error: 'Bad request'});
    }

    await req.db.get(SQL`UPDATE users SET adminNotifications = ${req.body.frequency} WHERE id = ${req.user.id}`);

    return await loadCurrentUser(req, res);
}));

export default router;
