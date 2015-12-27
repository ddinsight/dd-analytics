drop table `dbmenu`;

CREATE TABLE `dbmenu` (
  `menuid` int(11) NOT NULL AUTO_INCREMENT,
  `parentid` int(11) NOT NULL,
  `dspnm` varchar(255) NOT NULL DEFAULT '',
  `url` varchar(1000) NOT NULL DEFAULT '',
  `leafyn` char(1) DEFAULT 'N',
  `menutype` char(1) NOT NULL DEFAULT 'O',
  `ordr` int(11) NOT NULL DEFAULT '0',
  `crtdt` int(11) NOT NULL DEFAULT '0',
  `crtid` varchar(40) NULL,
  PRIMARY KEY (`menuid`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;

insert into `dbmenu`(menuid, parentid, dspnm, leafyn, menutype,ordr, crtdt, crtid) values(1, 0, 'Overview', 'Y', 'O', 0, unix_timestamp(now()), 'ethan_dev');
insert into `dbmenu`(menuid, parentid, dspnm, leafyn, menutype,ordr, crtdt, crtid) values(2, 0, 'Custom Report', 'N', 'O', 0, unix_timestamp(now()), 'ethan_dev');
insert into `dbmenu`(menuid, parentid, dspnm, leafyn, menutype,ordr, crtdt, crtid) values(3, 2, 'Add Report', 'Y', 'O', 0, unix_timestamp(now()), 'ethan_dev');

insert into `dbmenu`(menuid, parentid, dspnm, leafyn, menutype,ordr, crtdt, crtid) values(4, 0, 'User eXperience', 'N', 'O', 0, unix_timestamp(now()), 'ethan_dev');
insert into `dbmenu`(menuid, parentid, dspnm, leafyn, menutype,ordr, crtdt, crtid) values(5, 4, 'Overview', 'Y', 'O', 0, unix_timestamp(now()), 'ethan_dev');
insert into `dbmenu`(menuid, parentid, dspnm, leafyn, menutype,ordr, crtdt, crtid) values(6, 4, 'Pause Rate', 'Y', 'O', 0, unix_timestamp(now()), 'ethan_dev');
insert into `dbmenu`(menuid, parentid, dspnm, leafyn, menutype,ordr, crtdt, crtid) values(7, 4, 'Pause Time', 'Y', 'O', 0, unix_timestamp(now()), 'ethan_dev');
insert into `dbmenu`(menuid, parentid, dspnm, leafyn, menutype,ordr, crtdt, crtid) values(8, 4, 'Buffering Time', 'Y', 'O', 0, unix_timestamp(now()), 'ethan_dev');
insert into `dbmenu`(menuid, parentid, dspnm, leafyn, menutype,ordr, crtdt, crtid) values(9, 4, 'Periodic', 'Y', 'O', 0, unix_timestamp(now()), 'ethan_dev');

insert into `dbmenu`(menuid, parentid, dspnm, leafyn, menutype,ordr, crtdt, crtid) values(10, 0, 'Audience', 'N', 'O', 0, unix_timestamp(now()), 'ethan_dev');
insert into `dbmenu`(menuid, parentid, dspnm, leafyn, menutype,ordr, crtdt, crtid) values(11, 10, 'Overview', 'Y', 'O', 0, unix_timestamp(now()), 'ethan_dev');
insert into `dbmenu`(menuid, parentid, dspnm, leafyn, menutype,ordr, crtdt, crtid) values(12, 10, 'New & Return User', 'Y', 'O', 0, unix_timestamp(now()), 'ethan_dev');
insert into `dbmenu`(menuid, parentid, dspnm, leafyn, menutype,ordr, crtdt, crtid) values(13, 10, 'Retention', 'Y', 'O', 0, unix_timestamp(now()), 'ethan_dev');
insert into `dbmenu`(menuid, parentid, dspnm, leafyn, menutype,ordr, crtdt, crtid) values(14, 10, 'Geo', 'Y', 'O', 0, unix_timestamp(now()), 'ethan_dev');
insert into `dbmenu`(menuid, parentid, dspnm, leafyn, menutype,ordr, crtdt, crtid) values(15, 10, 'Device & OS', 'Y', 'O', 0, unix_timestamp(now()), 'ethan_dev');
insert into `dbmenu`(menuid, parentid, dspnm, leafyn, menutype,ordr, crtdt, crtid) values(16, 10, 'Network Operator', 'Y', 'O', 0, unix_timestamp(now()), 'ethan_dev');

insert into `dbmenu`(menuid, parentid, dspnm, leafyn, menutype,ordr, crtdt, crtid) values(17, 0, 'Network', 'N', 'O', 0, unix_timestamp(now()), 'ethan_dev');
insert into `dbmenu`(menuid, parentid, dspnm, leafyn, menutype,ordr, crtdt, crtid) values(18, 17, 'Overview', 'Y', 'O', 0, unix_timestamp(now()), 'ethan_dev');
insert into `dbmenu`(menuid, parentid, dspnm, leafyn, menutype,ordr, crtdt, crtid) values(19, 17, 'Usage', 'Y', 'O', 0, unix_timestamp(now()), 'ethan_dev');
insert into `dbmenu`(menuid, parentid, dspnm, leafyn, menutype,ordr, crtdt, crtid) values(20, 17, 'Speed', 'Y', 'O', 0, unix_timestamp(now()), 'ethan_dev');
insert into `dbmenu`(menuid, parentid, dspnm, leafyn, menutype,ordr, crtdt, crtid) values(21, 17, 'Geo', 'Y', 'O', 0, unix_timestamp(now()), 'ethan_dev');
insert into `dbmenu`(menuid, parentid, dspnm, leafyn, menutype,ordr, crtdt, crtid) values(22, 17, 'Periodic', 'Y', 'O', 0, unix_timestamp(now()), 'ethan_dev');

insert into `dbmenu`(menuid, parentid, dspnm, leafyn, menutype,ordr, crtdt, crtid) values(23, 0, 'Real Time', 'N', 'O', 0, unix_timestamp(now()), 'ethan_dev');
insert into `dbmenu`(menuid, parentid, dspnm, leafyn, menutype,ordr, crtdt, crtid) values(24, 23, 'Overview', 'Y', 'O', 0, unix_timestamp(now()), 'ethan_dev');
insert into `dbmenu`(menuid, parentid, dspnm, leafyn, menutype,ordr, crtdt, crtid) values(25, 23, 'Geo', 'Y', 'O', 0, unix_timestamp(now()), 'ethan_dev');
insert into `dbmenu`(menuid, parentid, dspnm, leafyn, menutype,ordr, crtdt, crtid) values(26, 23, 'User', 'Y', 'O', 0, unix_timestamp(now()), 'ethan_dev');
insert into `dbmenu`(menuid, parentid, dspnm, leafyn, menutype,ordr, crtdt, crtid) values(27, 23, 'Event', 'Y', 'O', 0, unix_timestamp(now()), 'ethan_dev');
insert into `dbmenu`(menuid, parentid, dspnm, leafyn, menutype,ordr, crtdt, crtid) values(28, 23, 'Network', 'Y', 'O', 0, unix_timestamp(now()), 'ethan_dev');
insert into `dbmenu`(menuid, parentid, dspnm, leafyn, menutype,ordr, crtdt, crtid) values(29, 23, 'User eXperience', 'Y', 'O', 0, unix_timestamp(now()), 'ethan_dev');

insert into `dbmenu`(menuid, parentid, dspnm, leafyn, menutype,ordr, crtdt, crtid) values(30, 0, 'Comprehensive', 'N', 'O', 0, unix_timestamp(now()), 'ethan_dev');
insert into `dbmenu`(menuid, parentid, dspnm, leafyn, menutype,ordr, crtdt, crtid) values(31, 30, 'Overview', 'Y', 'O', 0, unix_timestamp(now()), 'ethan_dev');
insert into `dbmenu`(menuid, parentid, dspnm, leafyn, menutype,ordr, crtdt, crtid) values(32, 30, 'By TodoW', 'Y', 'O', 0, unix_timestamp(now()), 'ethan_dev');
insert into `dbmenu`(menuid, parentid, dspnm, leafyn, menutype,ordr, crtdt, crtid) values(33, 30, 'By Content', 'Y', 'O', 0, unix_timestamp(now()), 'ethan_dev');


insert into `dbmenu`(menuid, parentid, dspnm, leafyn, menutype,ordr, crtdt, crtid) values(34, 0, 'Chart Generator', 'N', 'O', 0, unix_timestamp(now()), 'ethan_dev');
insert into `dbmenu`(menuid, parentid, dspnm, leafyn, menutype,ordr, crtdt, crtid) values(35, 0, 'Chart Viewer', 'N', 'O', 0, unix_timestamp(now()), 'ethan_dev');
insert into `dbmenu`(menuid, parentid, dspnm, leafyn, menutype,ordr, crtdt, crtid) values(36, 0, 'Data Generator', 'N', 'O', 0, unix_timestamp(now()), 'ethan_dev');
insert into `dbmenu`(menuid, parentid, dspnm, leafyn, menutype,ordr, crtdt, crtid) values(37, 0, 'Data Viewer', 'N', 'O', 0, unix_timestamp(now()), 'ethan_dev');

select * from dbmenu;
update dbmenu set url = '/#/chartviewer/list';
alter table dbmenu add column icon varchar(100);


CREATE TABLE `dbmenu_admin` (
  `menuid` int(11) NOT NULL DEFAULT '0',
  `adminid` int(11) NOT NULL DEFAULT '0',
  `crtdt` int(11) DEFAULT NULL,
  `crtid` int(11) DEFAULT NULL,
  PRIMARY KEY (`menuid`,`adminid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



CREATE TABLE `dbmenu_client` (
  `menuid` int(11) NOT NULL DEFAULT '0',
  `clientid` int(11) NOT NULL DEFAULT '0',
  `crtdt` int(11) DEFAULT NULL,
  `crtid` int(11) DEFAULT NULL,
  PRIMARY KEY (`menuid`,`clientid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

insert into dbmenu_client (menuid, clientid)
select c.id, d.menuid from client c, dbmenu d  where c.orgprefix = 'otm';


CREATE TABLE `client` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `orgprefix` varchar(100) DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL,
  `desc` varchar(100) DEFAULT NULL,
  `crtdt` int(11) DEFAULT NULL,
  `crtid` varchar(40) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `opid` (`orgprefix`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;
;



insert into test.client(`orgprefix`, `name`, `desc`, `crtdt`, `crtid`) values('otm', 'Test Mobile', 'Test Mobile', unix_timestamp(now()), 'ethan_dev');
insert into test.client(`orgprefix`, `name`, `desc`, `crtdt`, `crtid`) values('hp', 'Test Planet', 'Test Planet', unix_timestamp(now()), 'ethan_dev');


CREATE TABLE `menus` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `parent_id` int(11) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `url` varchar(255) DEFAULT NULL,
  `ordr` int(11) NOT NULL DEFAULT '0',
  `useyn` char(1) DEFAULT 'Y',
  `svcname` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



INSERT INTO `menus` (`id`, `parent_id`, `name`, `url`, `ordr`, `useyn`, `svcname`)
VALUES
  (12, 0, 'Query Config', '/', 0, 'Y', 'wave'),
  (13, 0, 'Select Confiig', '/', 0, 'Y', 'wave'),
  (14, 0, 'Where Config', '/', 0, 'Y', 'wave'),
  (15, 0, 'Menu Config', '/', 0, 'Y', 'wave'),
  (16, 12, 'Query List', '/admin/query', 0, 'Y', 'wave'),
  (17, 13, 'Select List', '/admin/select', 0, 'Y', 'wave'),
  (18, 14, 'Where List', '/admin/where', 0, 'Y', 'wave'),
  (19, 15, 'Menu[Select] Mng', '/admin/menu/select', 0, 'Y', 'wave'),
  (20, 15, 'Menu[Where] Mng', '/admin/menu/where', 0, 'Y', 'wave');




CREATE TABLE `admin` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `opid` varchar(40) DEFAULT NULL,
  `opnm` varchar(40) DEFAULT NULL,
  `pwd` varchar(256) DEFAULT NULL,
  `email` varchar(40) DEFAULT NULL,
  `crtdt` int(11) DEFAULT NULL,
  `crtid` varchar(40) DEFAULT NULL,
  `orgprefix` varchar(500) DEFAULT NULL,
  `svcname` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `opid` (`opid`)
);

INSERT INTO `admin` (`id`, `opid`, `opnm`, `pwd`, `email`, `crtdt`, `crtid`, `orgprefix`, `svcname`)
VALUES
  (19, 'a1234@example.com', 'ethanlees', '$6$rounds=100398$oyiD7kdbvwv.xpjt$QwK9/V90r5G7a7thQjRMFHuFWqLHKdy53/afbx1qx5FIMWC/3c2yE00DC0VjFD5DmcsRGdl5FU.xoiH3s6MyL/', 'a1234@example.com', NULL, NULL, 'otm', 'wave');


CREATE TABLE `menus_users` (
  `menuid` int(11) NOT NULL,
  `userid` varchar(40) NOT NULL DEFAULT '',
  `userseq` int(11) NOT NULL DEFAULT '0',
  `crtdt` date DEFAULT NULL,
  `crtid` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`menuid`,`userseq`)
) ;


INSERT INTO `menus_users` (`menuid`, `userid`, `userseq`, `crtdt`, `crtid`)
VALUES
  (16, 'a1234@example.com', 19, NULL, NULL),
  (18, 'a1234@example.com', 19, NULL, NULL),
  (15, 'a1234@example.com', 19, NULL, NULL),
  (19, 'a1234@example.com', 19, NULL, NULL),
  (14, 'a1234@example.com', 19, NULL, NULL),
  (20, 'a1234@example.com', 19, NULL, NULL),
  (13, 'a1234@example.com', 19, NULL, NULL),
  (21, 'a1234@example.com', 19, NULL, NULL),
  (12, 'a1234@example.com', 19, NULL, NULL),
  (17, 'a1234@example.com', 19, NULL, NULL);


  -- Create syntax for TABLE 'dsquery'
CREATE TABLE `dsquery` (
  `sqlid` int(11) NOT NULL AUTO_INCREMENT,
  `sqlnm` varchar(255) DEFAULT NULL,
  `sqldesc` varchar(255) DEFAULT NULL,
  `sqlstmt` mediumtext,
  `dbtype` varchar(10) NOT NULL DEFAULT 'mysql',
  `useyn` char(1) NOT NULL DEFAULT 'y',
  PRIMARY KEY (`sqlid`)
) CHARSET=utf8;

-- Create syntax for TABLE 'dsquery_admin'
CREATE TABLE `dsquery_admin` (
  `sqlid` int(11) NOT NULL DEFAULT '0',
  `adminid` int(11) NOT NULL DEFAULT '0',
  `crtdt` int(11) DEFAULT NULL,
  `crtid` int(11) DEFAULT NULL,
  PRIMARY KEY (`sqlid`,`adminid`)
) CHARSET=utf8;

-- Create syntax for TABLE 'dsreport'
CREATE TABLE `dsreport` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(40) DEFAULT NULL,
  `uri` varchar(255) DEFAULT NULL,
  `desc` varchar(500) DEFAULT NULL,
  `adminid` int(11) NOT NULL,
  `refresh_intv` int(11) NOT NULL DEFAULT '60',
  `period_range` int(4) NOT NULL DEFAULT '2',
  PRIMARY KEY (`id`)
) CHARSET=utf8;

-- Create syntax for TABLE 'dsreport_item'
CREATE TABLE `dsreport_item` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sqlid` int(11) DEFAULT NULL,
  `selid` int(11) DEFAULT NULL,
  `tmplid` int(11) DEFAULT NULL,
  `size` varchar(20) DEFAULT 'span6',
  `ordr` int(11) DEFAULT '0',
  `type` char(1) DEFAULT '0',
  `url` varchar(1000) DEFAULT NULL,
  `report_id` int(11) NOT NULL,
  PRIMARY KEY (`id`)
)  CHARSET=utf8;

-- Create syntax for TABLE 'dsselect'
CREATE TABLE `dsselect` (
  `selid` int(11) NOT NULL AUTO_INCREMENT,
  `selcols` text,
  `grpbystmt` varchar(1000) DEFAULT NULL,
  `seldesc` varchar(400) DEFAULT NULL,
  `restype` varchar(10) DEFAULT NULL,
  `resfmt` varchar(500) DEFAULT NULL,
  `sqlid` int(11) DEFAULT NULL,
  `selnm` varchar(400) DEFAULT NULL,
  `havingstmt` varchar(999) DEFAULT NULL,
  `orderbystmt` varchar(999) DEFAULT NULL,
  `selcolsforapi` varchar(1000) DEFAULT NULL,
  PRIMARY KEY (`selid`)
)  CHARSET=utf8;

-- Create syntax for TABLE 'dsviewtmpl'
CREATE TABLE `dsviewtmpl` (
  `sqlid` int(11) NOT NULL DEFAULT '0',
  `selid` int(11) NOT NULL DEFAULT '0',
  `tmplid` int(11) NOT NULL DEFAULT '0',
  `crtdt` int(11) DEFAULT NULL,
  `crtid` int(11) DEFAULT NULL,
  PRIMARY KEY (`sqlid`,`selid`,`tmplid`)
)  CHARSET=utf8;

-- Create syntax for TABLE 'dswhcolumn'
CREATE TABLE `dswhcolumn` (
  `whid` int(11) NOT NULL AUTO_INCREMENT,
  `sqlid` int(11) DEFAULT NULL,
  `colstr` varchar(256) DEFAULT NULL,
  `colnm` varchar(256) DEFAULT NULL,
  `operand` varchar(10) DEFAULT NULL,
  `coltype` varchar(10) DEFAULT NULL,
  `filtertype` varchar(20) DEFAULT 'Predefined',
  PRIMARY KEY (`whid`)
)  CHARSET=utf8;

-- Create syntax for TABLE 'dswhvalue'
CREATE TABLE `dswhvalue` (
  `valid` int(11) NOT NULL AUTO_INCREMENT,
  `valstr` varchar(1000) DEFAULT NULL,
  `valnm` varchar(1000) DEFAULT NULL,
  `sqlid` int(11) DEFAULT NULL,
  `whid` int(11) DEFAULT NULL,
  `operand` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`valid`),
  KEY `whid` (`whid`),
  CONSTRAINT `dswhvalue_ibfk_2` FOREIGN KEY (`whid`) REFERENCES `dswhcolumn` (`whid`)
) CHARSET=utf8;




