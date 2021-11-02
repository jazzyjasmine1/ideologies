const {Event, day, week, month, dayYear, EventLevel} = require("../../src/calendar/helpers");

module.exports = [
    // months
    new Event('Mois de l\'histoire des LGBT (Canada/USA/Australia)', 'Progress Pride', 10, month, EventLevel.Month),

    // static date
    new Event('Journée du triangle rose (Canada)', null, 2, day(14), EventLevel.Day),
    new Event('Journée de le mariage pour tous (Canada)', null, 7, day(20), EventLevel.Day),
    new Event('Journée de le mariage pour tous (France)', null, 5, day(18), EventLevel.Day),
    new Event('Journée de le mariage pour tous (Belgique)', null, 6, day(1), EventLevel.Day),
    new Event('Journée de sensibilisation au VIH/sida des communautés noires (Canada/USA)', null, 2, day(7), EventLevel.Day),
    new Event('Journée de sensibilité à la bispiritualité', 'Two Spirit', 7, day(11), EventLevel.Day, ['two spirit']),
    new Event('Journée de sensibilisation aux femmes, aux filles et aux personnes bispirituelles autochtones disparues et assassinées (Canada/USA)', 'Two Spirit', 5, day(5), EventLevel.Day, ['two spirit']),
    new Event('Journée du dépistage du VIH (Canada/USA)', null, 6, day(27), EventLevel.Day),
    new Event('Journée de la sensibilisation du VIH/sida et au vieillissement (Canada/USA)', null, 9, day(18), EventLevel.Day),
    new Event('Anniversaire de la décrimilisation de l\'homosexualité (Canada)', null, 6, day(27), EventLevel.Day),

    // dynamic date
    new Event('Journée d\'esprit (Canada/USA)', null, 10, function* (monthDays) {
        let thursdays = 0;
        for (let d of monthDays) {
            if (d.dayOfWeek === 4) {
                thursdays++;
                if (thursdays === 3) {
                    yield d;
                    return;
                }
            }
        }
    }, EventLevel.Day),

    // one-off events
    new Event('Journée de le mariage pour tous (Suisse)', null, 7, dayYear(1, 2022), EventLevel.Day),

];
