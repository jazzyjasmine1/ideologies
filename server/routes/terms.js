import { Router } from 'express';
import SQL from 'sql-template-strings';
import {ulid} from "ulid";
import {isTroll, handleErrorAsync, sortClearedLinkedText, clearKey} from "../../src/helpers";
import { caches } from "../../src/cache";

const approve = async (db, id) => {
    const { base_id } = await db.get(SQL`SELECT base_id FROM terms WHERE id=${id}`);
    if (base_id) {
        await db.get(SQL`
            UPDATE terms
            SET deleted=1
            WHERE id = ${base_id}
        `);
    }
    await db.get(SQL`
        UPDATE terms
        SET approved = 1, base_id = NULL
        WHERE id = ${id}
    `);
    await caches.terms.invalidate();
}

const linkOtherVersions = async (req, terms) => {
    const keys = new Set(terms.filter(s => !!s && s.key).map(s => `'` + clearKey(s.key) + `'`));

    const otherVersions = await req.db.all(SQL`
        SELECT t.*, u.username AS author FROM terms t
        LEFT JOIN users u ON t.author_id = u.id
        WHERE t.locale != ${global.config.locale}
        AND t.deleted = 0
        AND t.approved >= ${req.isGranted('terms') ? 0 : 1}
        AND t.key IN (`.append([...keys].join(',')).append(SQL`)
    `));

    const otherVersionsMap = {};
    otherVersions.forEach(version => {
        if (otherVersionsMap[version.key] === undefined) {
            otherVersionsMap[version.key] = [];
        }
        otherVersionsMap[version.key].push(version);
    });

    return terms.map(t => {
        t.versions = t.key ? otherVersionsMap[t.key] || [] : [];
        return t;
    });
};

const router = Router();

router.get('/terms', handleErrorAsync(async (req, res) => {
    return res.json(await caches.terms.fetch(async () => {
        return await linkOtherVersions(
            req,
            sortClearedLinkedText(await req.db.all(SQL`
                SELECT i.*, u.username AS author FROM terms i
                LEFT JOIN users u ON i.author_id = u.id
                WHERE i.locale = ${global.config.locale}
                AND i.approved >= ${req.isGranted('terms') ? 0 : 1}
                AND i.deleted = 0
            `), 'term'),
        );
    }, !req.isGranted('terms')));
}));

router.get('/terms/search/:term', handleErrorAsync(async (req, res) => {
    const term = '%' + req.params.term + '%';
    return res.json(
        await linkOtherVersions(
            req,
            sortClearedLinkedText(await req.db.all(SQL`
                SELECT i.*, u.username AS author FROM terms i
                LEFT JOIN users u ON i.author_id = u.id
                WHERE i.locale = ${global.config.locale}
                AND i.approved >= ${req.isGranted('terms') ? 0 : 1}
                AND i.deleted = 0
                AND (i.term like ${term} OR i.original like ${term})
            `), 'term'),
        )
    );
}));

router.post('/terms/submit', handleErrorAsync(async (req, res) => {
    if (!req.user || !await req.isUserAllowedToPost()) {
        return res.status(401).json({error: 'Unauthorised'});
    }

    if (!(req.user && req.user.admin) && isTroll(JSON.stringify(req.body))) {
        return res.json('ok');
    }

    const id = ulid();
    await req.db.get(SQL`
        INSERT INTO terms (id, term, original, key, definition, approved, base_id, locale, author_id, category, flags, images)
        VALUES (
            ${id},
            ${req.body.term.join('|')}, ${req.body.original.join('|')}, ${clearKey(req.body.key)}, ${req.body.definition},
            0, ${req.body.base}, ${global.config.locale}, ${req.user ? req.user.id : null},
            ${req.body.categories.join(',')}, ${JSON.stringify(req.body.flags)}, ${req.body.images}
        )
    `);

    if (req.isGranted('terms')) {
        await approve(req.db, id);
    }

    return res.json('ok');
}));

router.post('/terms/hide/:id', handleErrorAsync(async (req, res) => {
    if (!req.isGranted('terms')) {
        return res.status(401).json({error: 'Unauthorised'});
    }

    await req.db.get(SQL`
        UPDATE terms
        SET approved = 0
        WHERE id = ${req.params.id}
    `);

    await caches.terms.invalidate();

    return res.json('ok');
}));

router.post('/terms/approve/:id', handleErrorAsync(async (req, res) => {
    if (!req.isGranted('terms')) {
        return res.status(401).json({error: 'Unauthorised'});
    }

    await approve(req.db, req.params.id);

    return res.json('ok');
}));

router.post('/terms/remove/:id', handleErrorAsync(async (req, res) => {
    if (!req.isGranted('terms')) {
        return res.status(401).json({error: 'Unauthorised'});
    }

    await req.db.get(SQL`
        UPDATE terms
        SET deleted=1
        WHERE id = ${req.params.id}
    `);

    await caches.terms.invalidate();

    return res.json('ok');
}));

export default router;
