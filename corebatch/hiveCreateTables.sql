-- This scripts are sample for creating HIVE tables.
create table vidsession_log (
playSessionID STRING,
tTM DECIMAL(13, 3),
objid STRING,
logType INT,
logStartTime INT,
logEndTime INT,
cellid STRING,
ntype STRING,
abrMode STRING,
curBitrate INT,
reqBitrate INT,
elapsedTime DOUBLE,
bbCount  INT,
cellSysRxBytes BIGINT,
wfSysRxBytes BIGINT,
netCellState STRING,
bufferState STRING,
playEndState STRING,
ssid STRING,
bssid STRING,
lstuptmp INT,
playTime INT,
pauseTime INT,
cellRxBytes BIGINT,
wfRxBytes BIGINT,
cellDuration BIGINT,
wfDuration BIGINT );


create table if exists vidsession (
	playSessionID STRING,
	androidID STRING,
	vID STRING,
	sID INT,
	verCode INT,
	osVer STRING,
	brand STRING,
	model STRING,
	cellIdSt STRING,
	cellIdEnd STRING,
	bMao INT,
	startLogType INT,
	endLogType INT,
	vidnetStartTime INT,
	vidnetEndTime INT,
	playServiceMode INT,
	playTime INT,
	pauseCnt INT,
	resumeCnt INT,
	pauseTime INT,
	cellRxBytes BIGINT,
	cellAvgTP FLOAT,
	cellDuration BIGINT,
	wfRxBytes BIGINT,
	wfAvgTP FLOAT,
	wfDuration BIGINT,
	cellSysRxBytes BIGINT,
	wfSysRxBytes BIGINT,
	hostName STRING,
	originName STRING,
	contentID STRING,
	contentBitrate INT,
	channelName STRING,
	pkgnm STRING,
	apppkgnm STRING,
	appvercd STRING,
	netAllowCell STRING,
	bbCount INT,
	elapsedTime FLOAT,
	idxmax INT,
	idxmin INT,
	lstuptmp INT);


drop table opendd.vidsession;
CREATE TABLE opendd.vidsession
(
 playsessionid CHAR(30) NOT NULL,
 androidid CHAR(16) NOT NULL,
 vid VARCHAR(20) NOT NULL,
 sid INT NOT NULL,
 vercode INT NOT NULL,
 osver VARCHAR(10) NOT NULL,
 brand VARCHAR(20) NOT NULL,
 model VARCHAR(20) NOT NULL,
 cellidst VARCHAR(30) NOT NULL,
 cellidend VARCHAR(30) NOT NULL,
 bmao SMALLINT NOT NULL,
 startlogtype SMALLINT NOT NULL,
 endlogtype SMALLINT NOT NULL,
 vidnetstarttime INT NOT NULL,
 vidnetendtime INT NOT NULL,
 vidnetduration INT NOT NULL,
 playservicemode INT NOT NULL,
 playtime INT NOT NULL,
 pausecnt INT NOT NULL,
 resumecnt INT NOT NULL,
 pausetime INT NOT NULL,
 cellrxbytes BIGINT NOT NULL,
 cellsysrxbytes BIGINT NOT NULL,
 cellavgtp DOUBLE PRECISION NOT NULL,
 cellduration BIGINT NOT NULL,
 wfrxbytes BIGINT NOT NULL,
 wfsysrxbytes BIGINT NOT NULL,
 wfavgtp DOUBLE PRECISION NOT NULL,
 wfduration BIGINT NOT NULL,
 hostname VARCHAR(100) NOT NULL,
 originname VARCHAR(100) NOT NULL,
 contentbitrate DOUBLE PRECISION NOT NULL,
 channelname VARCHAR(100) NOT NULL,
 pkgnm VARCHAR(40) NOT NULL,
 apppkgnm VARCHAR(40) NOT NULL,
 appvercd VARCHAR(10) NOT NULL,
 netallowcell CHAR(1),
 bbcount INT,
 elapsedtime DOUBLE PRECISION,
 lstuptmp INT
);
CREATE INDEX vidsession_idx ON opendd.vidsession (playsessionid);
CREATE INDEX vidsession_idx2 ON opendd.vidsession (vidnetstarttime);
CREATE INDEX vidsession_idx3 ON opendd.vidsession (apppkgnm);

drop table opendd.vidsession_log;
CREATE TABLE opendd.vidsession_log
(
 playsessionid CHAR(30) NOT NULL,
 ttm NUMERIC(13) NOT NULL,
 mgoid CHAR(24) DEFAULT '' NOT NULL,
 logtype SMALLINT,
 logstarttime INT,
 logendtime INT,
 cellid VARCHAR(30),
 ntype CHAR(1),
 abrmode CHAR(1) DEFAULT '' NOT NULL,
 curbitrate INT DEFAULT 0 NOT NULL,
 reqbitrate INT DEFAULT 0 NOT NULL,
 elapsedtime DOUBLE PRECISION,
 bbcount INT,
 cellsysrxbytes BIGINT,
 wfsysrxbytes BIGINT,
 netcellstate VARCHAR(10),
 bufferstate CHAR(1),
 playendstate VARCHAR(20),
 playtime INT,
 pausetime INT,
 cellrxbytes BIGINT,
 cellduration BIGINT,
 wfrxbytes BIGINT,
 wfduration BIGINT,
 ssid VARCHAR(30),
 bssid VARCHAR(17),
 lstuptmp INT
);
CREATE INDEX vidsession_log_idx ON opendd.vidsession_log (playsessionid);
CREATE INDEX vidsession_log_idx2 ON opendd.vidsession_log (cellid);

