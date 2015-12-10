-- This tables should be created  in Postgre Database where OpenDD Presentation web read summarized data
CREATE TABLE lteidux
(
    fullid VARCHAR(23),
    lat NUMERIC(10),
    lng NUMERIC(10),
    sesscnt BIGINT,
    logcnt BIGINT,
    usrcnt BIGINT,
    playtime BIGINT,
    usrmaxtime BIGINT,
    pausetime NUMERIC(38),
    pausecnt NUMERIC(38),
    cellrxbytes BIGINT,
    cellduration BIGINT,
    stpscnt BIGINT,
    stfail BIGINT
);
CREATE INDEX lteidux_idx ON lteidux (fullid, lat, lng);

CREATE TABLE lteidux_badness
(
    fullid VARCHAR(23),
    lat NUMERIC(10),
    lng NUMERIC(10),
    usrcnt BIGINT,
    sesscnt BIGINT,
    badusrcnt BIGINT,
    badsesscnt BIGINT,
    baddaycnt BIGINT,
    daycnt BIGINT,
    stfail BIGINT,
    dronst INT,
    largepc NUMERIC(38),
    smallpc BIGINT
);
CREATE INDEX lteidux_badness_idx ON lteidux_badness (fullid, lat, lng);

CREATE TABLE lteidux_badness_3hr
(
    fullid VARCHAR(23),
    lat NUMERIC(10),
    lng NUMERIC(10),
    todow NUMERIC(10),
    usrcnt BIGINT,
    sesscnt BIGINT,
    badusrcnt BIGINT,
    badsesscnt BIGINT,
    baddaycnt BIGINT,
    daycnt BIGINT,
    stfail NUMERIC(38),
    dronst INT,
    largepc NUMERIC(38),
    smallpc BIGINT
);
CREATE INDEX lteidux_badness_3hr_idx ON lteidux_badness_3hr (fullid, lat, lng, todow);

CREATE TABLE lteidux_badness_dev
(
    fullid VARCHAR(23),
    lat NUMERIC(10),
    lng NUMERIC(10),
    brand VARCHAR(20),
    model VARCHAR(20),
    usrcnt BIGINT,
    sesscnt BIGINT,
    badusrcnt BIGINT,
    badsesscnt BIGINT,
    baddaycnt BIGINT,
    daycnt BIGINT,
    stfail BIGINT,
    dronst INT,
    largepc NUMERIC(38),
    smallpc BIGINT
);

CREATE TABLE lteidux_badness_dow
(
    fullid VARCHAR(23),
    lat NUMERIC(10),
    lng NUMERIC(10),
    todow VARCHAR(10),
    usrcnt BIGINT,
    sesscnt BIGINT,
    badusrcnt BIGINT,
    badsesscnt BIGINT,
    baddaycnt BIGINT,
    daycnt BIGINT,
    stfail NUMERIC(38),
    dronst INT,
    largepc NUMERIC(38),
    smallpc BIGINT
);

CREATE TABLE lteidux_badness_os
(
    fullid VARCHAR(23),
    lat NUMERIC(10),
    lng NUMERIC(10),
    osver VARCHAR(10),
    usrcnt BIGINT,
    sesscnt BIGINT,
    badusrcnt BIGINT,
    badsesscnt BIGINT,
    baddaycnt BIGINT,
    daycnt BIGINT,
    stfail BIGINT,
    dronst INT,
    largepc NUMERIC(38),
    smallpc BIGINT
);

CREATE TABLE lteidux_badness_todow
(
    fullid VARCHAR(23),
    lat NUMERIC(10),
    lng NUMERIC(10),
    todow VARCHAR(12),
    usrcnt BIGINT,
    sesscnt BIGINT,
    badusrcnt BIGINT,
    badsesscnt BIGINT,
    baddaycnt BIGINT,
    daycnt BIGINT,
    stfail NUMERIC(38),
    dronst INT,
    largepc NUMERIC(38),
    smallpc BIGINT
);

CREATE TABLE lteidux_dev
(
    fullid VARCHAR(23),
    lat NUMERIC(10),
    lng NUMERIC(10),
    brand VARCHAR(20),
    model VARCHAR(20),
    sesscnt BIGINT,
    logcnt BIGINT,
    usrcnt BIGINT,
    playtime BIGINT,
    pausetime BIGINT,
    pausecnt BIGINT,
    cellrxbytes BIGINT,
    cellduration BIGINT,
    stpscnt BIGINT,
    stfail BIGINT
);

CREATE TABLE lteidux_dow
(
    fullid VARCHAR(23),
    lat NUMERIC(10),
    lng NUMERIC(10),
    todow VARCHAR(10),
    sesscnt BIGINT,
    logcnt BIGINT,
    usrcnt BIGINT,
    playtime BIGINT,
    pausetime BIGINT,
    pausecnt BIGINT,
    cellrxbytes BIGINT,
    cellduration BIGINT,
    stpscnt BIGINT,
    stfail BIGINT
);

CREATE TABLE lteidux_os
(
    fullid VARCHAR(23),
    lat NUMERIC(10),
    lng NUMERIC(10),
    osver VARCHAR(10),
    sesscnt BIGINT,
    logcnt BIGINT,
    usrcnt BIGINT,
    playtime BIGINT,
    pausetime BIGINT,
    pausecnt BIGINT,
    cellrxbytes BIGINT,
    cellduration BIGINT,
    stpscnt BIGINT,
    stfail BIGINT
);

CREATE TABLE lteidux_recentness
(
    fullid VARCHAR(23),
    todow VARCHAR(16),
    badness DOUBLE PRECISION,
    rxbytes BIGINT,
    playtime BIGINT
);
CREATE INDEX lteidux_recentness_idx ON lteidux_recentness (fullid, todow);

CREATE TABLE lteidux_todow
(
    fullid VARCHAR(23),
    lat NUMERIC(10),
    lng NUMERIC(10),
    todow VARCHAR(12),
    sesscnt BIGINT,
    logcnt BIGINT,
    usrcnt BIGINT,
    playtime BIGINT,
    pausetime BIGINT,
    pausecnt BIGINT,
    cellrxbytes BIGINT,
    cellduration BIGINT,
    stpscnt BIGINT,
    stfail BIGINT
);
CREATE INDEX lteidux_todow_idx ON lteidux_todow (fullid, lat, lng, todow);


CREATE TABLE sktdemo_cell_badness
(
    fullid VARCHAR(23),
    lat NUMERIC(10),
    lng NUMERIC(10),
    usrcnt BIGINT,
    sesscnt BIGINT,
    stfail BIGINT,
    dronst BIGINT,
    largepc BIGINT,
    smallpc BIGINT
);
CREATE INDEX sktdemo_cell_badness_idx ON sktdemo_cell_badness (fullid, lat, lng);

CREATE TABLE sktdemo_cell_badness_dev
(
    fullid VARCHAR(23),
    lat NUMERIC(10),
    lng NUMERIC(10),
    brand VARCHAR(20),
    model VARCHAR(20),
    usrcnt BIGINT,
    sesscnt BIGINT,
    stfail BIGINT,
    dronst BIGINT,
    largepc BIGINT,
    smallpc BIGINT
);
CREATE INDEX sktdemo_cell_badness_dev_idx ON sktdemo_cell_badness_dev (fullid, lat, lng, brand, model);

CREATE TABLE sktdemo_cell_badness_todow
(
    fullid VARCHAR(23),
    lat NUMERIC(10),
    lng NUMERIC(10),
    todow VARCHAR(12),
    usrcnt BIGINT,
    sesscnt BIGINT,
    stfail BIGINT,
    dronst BIGINT,
    largepc BIGINT,
    smallpc BIGINT
);
CREATE INDEX sktdemo_cell_badness_todow_idx ON sktdemo_cell_badness_todow (fullid, lat, lng, todow);

CREATE TABLE sktdemo_wf_badness
(
    bssid CHAR(17),
    lat NUMERIC(10),
    lng NUMERIC(10),
    usrcnt BIGINT,
    sesscnt BIGINT,
    stfail BIGINT,
    dronst BIGINT,
    largepc BIGINT,
    smallpc BIGINT
);
CREATE INDEX sktdemo_wf_badness_idx ON sktdemo_wf_badness (bssid, lat, lng);

CREATE TABLE sktdemo_wf_badness_dev
(
    bssid CHAR(17),
    lat NUMERIC(10),
    lng NUMERIC(10),
    brand VARCHAR(20),
    model VARCHAR(20),
    usrcnt BIGINT,
    sesscnt BIGINT,
    stfail BIGINT,
    dronst BIGINT,
    largepc BIGINT,
    smallpc BIGINT
);
CREATE INDEX sktdemo_wf_badness_dev_idx ON sktdemo_wf_badness_dev (bssid, lat, lng, brand, model);

CREATE TABLE sktdemo_wf_badness_todow
(
    bssid CHAR(17),
    lat NUMERIC(10),
    lng NUMERIC(10),
    todow VARCHAR(12),
    usrcnt BIGINT,
    sesscnt BIGINT,
    stfail BIGINT,
    dronst BIGINT,
    largepc BIGINT,
    smallpc BIGINT
);
CREATE INDEX sktdemo_wf_badness_todow_idx ON sktdemo_wf_badness_todow (bssid, lat, lng, todow);


CREATE TABLE bssidux
(
    bssid VARCHAR(17),
    lat NUMERIC(10),
    lng NUMERIC(10),
    sesscnt BIGINT,
    logcnt BIGINT,
    usrcnt BIGINT,
    playtime BIGINT,
    pausetime BIGINT,
    pausecnt BIGINT,
    wfrxbytes BIGINT,
    wfduration BIGINT,
    stpscnt BIGINT,
    stfail BIGINT
);
CREATE INDEX bssidux_badness_idx ON bssidux (bssid, lat, lng);
CREATE INDEX bssidux_idx ON bssidux (bssid, lat, lng);

CREATE TABLE bssidux_badness
(
    bssid CHAR(17),
    lat NUMERIC(10),
    lng NUMERIC(10),
    usrcnt BIGINT,
    sesscnt BIGINT,
    badusrcnt BIGINT,
    badsesscnt BIGINT,
    baddaycnt BIGINT,
    daycnt BIGINT,
    stfail BIGINT,
    dronst BIGINT,
    largepc BIGINT,
    smallpc BIGINT
);

CREATE TABLE bssidux_badness_dev
(
    bssid CHAR(17),
    lat NUMERIC(10),
    lng NUMERIC(10),
    brand VARCHAR(20),
    model VARCHAR(20),
    usrcnt BIGINT,
    sesscnt BIGINT,
    badusrcnt BIGINT,
    badsesscnt BIGINT,
    baddaycnt BIGINT,
    daycnt BIGINT,
    stfail BIGINT,
    dronst BIGINT,
    largepc BIGINT,
    smallpc BIGINT
);

CREATE TABLE bssidux_badness_todow
(
    bssid CHAR(17),
    lat NUMERIC(10),
    lng NUMERIC(10),
    todow VARCHAR(12),
    usrcnt BIGINT,
    sesscnt BIGINT,
    badusrcnt BIGINT,
    badsesscnt BIGINT,
    baddaycnt BIGINT,
    daycnt BIGINT,
    stfail BIGINT,
    dronst BIGINT,
    largepc BIGINT,
    smallpc BIGINT
);
CREATE INDEX bssidux_badness_todow_idx ON bssidux_badness_todow (bssid, lat, lng, todow);


CREATE TABLE bssidux_dev
(
    bssid VARCHAR(17),
    lat NUMERIC(10),
    lng NUMERIC(10),
    brand VARCHAR(20),
    model VARCHAR(20),
    sesscnt BIGINT,
    logcnt BIGINT,
    usrcnt BIGINT,
    playtime BIGINT,
    pausetime BIGINT,
    pausecnt BIGINT,
    wfrxbytes BIGINT,
    wfduration BIGINT,
    stpscnt BIGINT,
    stfail BIGINT
);

CREATE TABLE bssidux_todow
(
    bssid VARCHAR(17),
    lat NUMERIC(10),
    lng NUMERIC(10),
    todow VARCHAR(12),
    sesscnt BIGINT,
    logcnt BIGINT,
    usrcnt BIGINT,
    playtime BIGINT,
    pausetime BIGINT,
    pausecnt BIGINT,
    wfrxbytes BIGINT,
    wfduration BIGINT,
    stpscnt BIGINT,
    stfail BIGINT
);
CREATE INDEX bssidux_todow_idx ON bssidux_todow (bssid, lat, lng, todow);

CREATE TABLE cellidux
(
    fullid VARCHAR(23),
    lat NUMERIC(10),
    lng NUMERIC(10),
    sesscnt BIGINT,
    logcnt BIGINT,
    usrcnt BIGINT,
    playtime BIGINT,
    pausetime BIGINT,
    pausecnt BIGINT,
    cellrxbytes BIGINT,
    cellduration BIGINT,
    stpscnt BIGINT,
    stfail BIGINT
);
CREATE INDEX cellidux_idx ON cellidux (fullid, lat, lng);

CREATE TABLE cellidux_badness
(
    fullid VARCHAR(23),
    lat NUMERIC(10),
    lng NUMERIC(10),
    usrcnt BIGINT,
    sesscnt BIGINT,
    badusrcnt BIGINT,
    badsesscnt BIGINT,
    baddaycnt BIGINT,
    daycnt BIGINT,
    stfail NUMERIC(38),
    dronst NUMERIC(38),
    largepc NUMERIC(38),
    smallpc BIGINT
);
CREATE INDEX cellidux_badness_idx ON cellidux_badness (fullid, lat, lng);

CREATE TABLE cellidux_badness_dev
(
    fullid VARCHAR(23),
    lat NUMERIC(10),
    lng NUMERIC(10),
    brand VARCHAR(20),
    model VARCHAR(20),
    usrcnt BIGINT,
    sesscnt BIGINT,
    badusrcnt BIGINT,
    badsesscnt BIGINT,
    baddaycnt BIGINT,
    daycnt BIGINT,
    stfail NUMERIC(38),
    dronst NUMERIC(38),
    largepc NUMERIC(38),
    smallpc BIGINT
);
CREATE INDEX cellidux_badness_dev_idx ON cellidux_badness_dev (fullid, lat, lng, brand, model);

CREATE TABLE cellidux_badness_todow
(
    fullid VARCHAR(23),
    lat NUMERIC(10),
    lng NUMERIC(10),
    todow VARCHAR(12),
    usrcnt BIGINT,
    sesscnt BIGINT,
    badusrcnt BIGINT,
    badsesscnt BIGINT,
    baddaycnt BIGINT,
    daycnt BIGINT,
    stfail NUMERIC(38),
    dronst NUMERIC(38),
    largepc NUMERIC(38),
    smallpc BIGINT
);
CREATE INDEX cellidux_badness_todow_idx ON cellidux_badness_todow (fullid, lat, lng, todow);

CREATE TABLE cellidux_dev
(
    fullid VARCHAR(23),
    lat NUMERIC(10),
    lng NUMERIC(10),
    brand VARCHAR(20),
    model VARCHAR(20),
    sesscnt BIGINT,
    logcnt BIGINT,
    usrcnt BIGINT,
    playtime BIGINT,
    pausetime BIGINT,
    pausecnt BIGINT,
    cellrxbytes BIGINT,
    cellduration BIGINT,
    stpscnt BIGINT,
    stfail BIGINT
);
CREATE INDEX cellidux_dev_idx ON cellidux_dev (fullid, lat, lng, brand, model);

CREATE TABLE cellidux_todow
(
    fullid VARCHAR(23),
    lat NUMERIC(10),
    lng NUMERIC(10),
    todow VARCHAR(12),
    sesscnt BIGINT,
    logcnt BIGINT,
    usrcnt BIGINT,
    playtime BIGINT,
    pausetime BIGINT,
    pausecnt BIGINT,
    cellrxbytes BIGINT,
    cellduration BIGINT,
    stpscnt BIGINT,
    stfail BIGINT
);
CREATE INDEX cellidux_todow_idx ON cellidux_todow (fullid, lat, lng, todow);

