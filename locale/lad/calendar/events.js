const {Event, day, week, month, dayYear, EventLevel} = require("../../../src/calendar/helpers");

module.exports = [
    // --- months ---
    new Event('Mez de la Estoria LGBT (Estatos Unitos)', 'Progress Pride', 10, month, EventLevel.Month),
    new Event('Mez de la Diversidad (Uruguay)', 'LGBTQ', 9, month, EventLevel.Month),

    // --- static date ---
    new Event('Dia de la Vizibilidad {/terminolojia#lesbian=Lezbiana} (Chile)', 'Lesbian', 7, day(9), EventLevel.Day, ['lesbian']),
    new Event('Dia de la Vizibilidad {/terminolojia#lesbian=Lezbiana} (Arjentina)', 'Lesbian', 3, day(7), EventLevel.Day, ['lesbian']),
    new Event('Dia de la Vizibilidad {/terminolojia#lesbian=Lezbiana} (Paraguay)', 'Lesbian', 9, day(16), EventLevel.Day, ['lesbian']),
    new Event('Dia del Aktivizmo por la Diversidad Seksuala (Arjentina)', 'LGBTQ', 8, day(20), EventLevel.Day),
    new Event('Dia de las Rebelyas {/terminolojia#lesbian=Lezbianas}', 'Lesbian', 10, day(13), EventLevel.Day, ['lesbian']),
    new Event('Dia de la Promosion de los Diritos de las Personas Trans (Arjentina)', 'Transgender', 3, day(18), EventLevel.Day, ['transgender']),
    new Event('Dia de la Libertad para Kazarse (Estatos Unitos)', '_hrc', 2, day(12), EventLevel.Day),
    new Event('Dia  Nacional de la Proba del HIV (Espanya)', '_red-ribbon', 10, day(20), EventLevel.Day, ['aids']),
    new Event('Día  Nacional de la Proba del HIV (Meksiko)', '_red-ribbon', 11, day(23), EventLevel.Day, ['aids']),
    new Event('Dia  Nacional de la Proba del HIV (Peru)', '_red-ribbon', 6, day(10), EventLevel.Day, ['aids']),
    new Event('Dia de la Konsensya de los Sentros de la Komunita LGBT (Estatos Unitos)', null, 10, day(19), EventLevel.Day),
    new Event('Dia Latinx para la Konsensya sovre AIDS (Estatos Unitos)', '_red-ribbon', 10, day(15), EventLevel.Day, ['aids']),
    new Event('Dia de la Visibilidad Trans-, Travesti i No Binarie (Paraguay)', 'Transgender', 10, day(15), EventLevel.Day, ['transgender', 'travesti', 'nonbinary']),
    new Event('Dia de Konsensya de las Mujeres, Ninyas i Personas Indijenas de Dos Espiritos Dezaparesidas i Asasinadas', 'Two Spirit_', 5, day(5), EventLevel.Day, ['two spirit']),
    new Event('Dia de la Konsensya de Personas de Dos Espiritos (Estatos Unitos)', 'Two Spirit_', 7, day(11), EventLevel.Day, ['two spirit']),
    new Event('Dia Nasional de Pelea kontra el HIV/AIDS (Uruguay)', '_red-ribbon', 7, day(29), EventLevel.Day, ['aids']),
    new Event('Dia Nasional por la NO Violensia i Omofobia kontra la Populasyon LGBTI (Kolombia)', null, 8, day(23), EventLevel.Day, ['homophobia', 'transphobia', 'biphobia']),
    new Event('Dia por los Diritos de las Personas LGBTI (Paraguay)', 'LGBTQ', 9, day(30), EventLevel.Day, ['lgbtq']),
    new Event('Dia kontra los Krimenes de Garez (Peru)', null, 5, day(31), EventLevel.Day, ['homophobia', 'transphobia', 'biphobia']),
    new Event('Dia Nasional para el Empedimyento del Suisidyo (Uruguay)', '_yellow-ribbon', 7, day(17), EventLevel.Day),
    new Event('Dia Nasional para el Empedimyento del Suisidyo (Puerto Riko)', '_yellow-ribbon', 8, day(12), EventLevel.Day),
    new Event('Dia de la Konsensya de Personas de Dos Espiritos (Kanada)', 'Two Spirit_', 3, day(21), EventLevel.Day, ['two spirit']),
];
