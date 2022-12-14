const {Event, day, week, month, dayYear, EventLevel} = require("../../../src/calendar/helpers");

module.exports = [
    // --- months ---
    new Event('{https://queerhistory.de=Queer History Month} (Monat der queeren Geschichte) in Deutschland und Kuba', 'Progress Pride', 5, month, EventLevel.Month),
    new Event('Jahrestag der Ehe für alle in Deutschland', '_hrc', 10, day(1), EventLevel.Day),
    new Event('Jahrestag der Ehe für alle in Österreich', '_hrc', 1, day(1), EventLevel.Day),
    new Event('Jahrestag der Ehe für alle in Belgien', '_hrc', 6, day(1), EventLevel.Day),
    new Event('Jahrestag der Ehe für alle in Luxemburg', '_hrc', 1, day(1), EventLevel.Day),

    // --- one-off events ---
    new Event('Ehe für alle in der Schweiz', '_hrc', 7, dayYear(1, 2022), EventLevel.Day),
    new Event('{https://www.csd-d.de/de/=CSD Düsseldorf}', 'LGBTQ', 10, dayYear(16, 2021), EventLevel.Day),
    new Event('{https://csd-bielefeld.de/=CSD Bielefeld}', 'LGBTQ', 10, dayYear(2, 2021), EventLevel.Day),
    new Event('{https://www.facebook.com/events/133873485389727=CSD Erfurt}', 'LGBTQ', 10, dayYear(9, 2021), EventLevel.Day),
    new Event('{https://queereprovinz.de/home/=Queeres Leben statt nationalem Einheitsbrei}, Salzwedel', 'Progress Pride', 10, dayYear(3, 2021), EventLevel.Day),
];
