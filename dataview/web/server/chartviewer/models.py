#  Copyright 2015 AirPlug Inc.
#
#  Licensed under the Apache License, Version 2.0 (the "License");
#  you may not use this file except in compliance with the License.
#  You may obtain a copy of the License at
#
#       http://www.apache.org/licenses/LICENSE-2.0
#
#  Unless required by applicable law or agreed to in writing, software
#  distributed under the License is distributed on an "AS IS" BASIS,
#  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#  See the License for the specific language governing permissions and
#  limitations under the License.
#


from flask.ext.sqlalchemy import SQLAlchemy
from sqlalchemy import Column, Integer, String
from server.data import db, CRUDMixin

import sys
import simplejson as json

from server.data import db, compile_query, query_to_list_json, group_concat
from server.users.models import User, WaveMenuAdmin
from sqlalchemy.sql import text, exists, and_, or_, not_, func, operators, literal_column, union_all, distinct
from sqlalchemy.sql import tuple_
from sqlalchemy import cast, select, String


class DsQuery(CRUDMixin, db.Model):
    __tablename__ = 'dsquery'

    sqlid = db.Column(db.Integer, primary_key=True, autoincrement=True)
    sqlnm = db.Column(db.String)
    sqldesc = db.Column(db.String)
    sqlstmt = db.Column(db.String)
    dbtype = db.Column(db.String)
    useyn = db.Column(db.String)

    def __repr__(self):
        return '<DsQuery {0} {1} {2}>'.format(self.sqlid, self.sqlnm, self.sqldesc)


class DsQueryAdmin(CRUDMixin, db.Model):
    __tablename__ = 'dsquery_admin'

    sqlid = db.Column(db.Integer, primary_key=True)
    adminid = db.Column(db.Integer, primary_key=True)
    crtdt = db.Column(db.Date)
    crtid = db.Column(db.String)

    def __repr__(self):
        return '<DsQuery {0} {1}>'.format(self.sqlid, self.adminid)

class DsSelect(CRUDMixin, db.Model):
    __tablename__ = 'dsselect'

    selid = db.Column(db.Integer, primary_key=True, autoincrement=True)
    selnm = db.Column(db.String)
    selcols = db.Column(db.String)
    seldesc = db.Column(db.String)
    grpbystmt = db.Column(db.String)
    havingstmt = db.Column(db.String)
    orderbystmt = db.Column(db.String)
    restype = db.Column(db.String)
    resfmt = db.Column(db.String)
    sqlid = db.Column(db.Integer)

    def __repr__(self):
        return '<DsSelect {0} {1}>'.format(self.selid, self.sqlid )

class DsWhColumn(CRUDMixin, db.Model):
    __tablename__ = 'dswhcolumn'

    whid = db.Column(db.Integer, primary_key=True, autoincrement=True)
    sqlid = db.Column(db.Integer)
    colstr = db.Column(db.String)
    colnm = db.Column(db.String)
    operand = db.Column(db.String)
    coltype = db.Column(db.String)
    filtertype = db.Column(db.String)

    def __repr__(self):
        return '<DsWhColumn {0} {1} {2} {3} {4}>'.format(self.whid, self.colstr, self.sqlid, self.operand, self.filtertype)


class DsWhValue(CRUDMixin, db.Model):
    __tablename__ = 'dswhvalue'

    valid = db.Column(db.Integer, primary_key=True, autoincrement=True)
    valnm = db.Column(db.String)
    valstr = db.Column(db.String)
    whid = db.Column(db.Integer)
    sqlid = db.Column(db.Integer)

    def __repr__(self):
        # return '<DsWhValue {0} {1} {2}>'.format(self.valid, self.valstr, self.whid)
        return '<DsWhValue {0} {1} {2} {3}>'.format(self.valid, self.whid, self.valnm.encode('utf-8'), self.valstr.encode('utf-8'))


class WaveMenu(CRUDMixin, db.Model):
    __tablename__ = 'wavemenu'

    menuid = db.Column(db.Integer, primary_key=True)
    parentid = db.Column(db.Integer)
    dspnm = db.Column(db.String)
    leafyn = db.Column(db.String)
    sqlid = db.Column(db.Integer)
    dstbltype = db.Column(db.String)
    dstblid = db.Column(db.Integer)
    multiselectyn = db.Column(db.String)

    def __repr__(self):
        return '<WaveMenu {0} {1} {2} {3} {4} {5} {6}>'.format(self.menuid, self.parentid, self.dspnm.encode('utf-8'), self.leafyn, self.sqlid, self.dstbltype, self.dstblid)


class ViewTmpl(CRUDMixin, db.Model):
    __tablename__ = 'viewtmpl'

    tmplid = db.Column(db.Integer, primary_key=True)
    tmplnm = db.Column(db.String)
    tmpldesc = db.Column(db.String)
    filepath = db.Column(db.String)
    availdt = db.Column(db.String)

    def __repr__(self):
        return '<ViewTmpl {0} {1} {2} {3}>'.format(self.tmplid, self.tmplnm, self.tmpldesc, self.filepath)


class DsViewTmpl(CRUDMixin, db.Model):
    __tablename__ = 'dsviewtmpl'

    sqlid = db.Column(db.Integer, primary_key=True)
    selid = db.Column(db.Integer, primary_key=True)
    tmplid = db.Column(db.Integer, primary_key=True)
    crtdt = db.Column(db.Integer)
    crtid = db.Column(db.Integer)
    
    def __repr__(self):
        return '<DsViewTmpl {0} {1} {2}>'.format(self.sqlid, self.selid, self.tmplid)


def listDataSet(userid):
    query = db.session.query().from_statement(text("""
        select q.sqlid, sqlnm, sqldesc 
        from dsquery q, dsquery_admin qa , admin a
        where 1=1
        and q.sqlid = qa.sqlid
        and qa.adminid = a.id
        and a.opid = :userid
        and q.useyn = 'y'
        and lower(sqlnm) not like '%map%'
        """ )).params(userid=userid)

    return query_to_list_json(query)
    

def listMenus(sqlId, userId):
    query = db.session.query().from_statement(
            text(
                """
                select m1 as parent , group_concat(m2,'->',m3) as children    from (
                    select m1, m2, group_concat(m3 SEPARATOR '#') as m3 from (
                            select 
                                concat(m1.menuid,':',m1.dspnm,':',m1.dstbltype,':',m1.dstblid,':',m1.multiselectyn) as m1,
                                concat(m2.menuid,':',m2.dspnm,':',m2.dstbltype,':',m2.dstblid,':',m2.multiselectyn) as m2,
                                concat(m3.menuid,':',m3.dspnm,':',m3.dstbltype,':',m3.dstblid,':',m3.multiselectyn) as m3
                            from wavemenu as m1
                            left join wavemenu as m2 on m2.parentid = m1.menuid
                            left join wavemenu as m3 on m3.parentid = m2.menuid 
                            and exists (select 'x' from wavemenu_admin u, admin a where u.menuid = m3.menuid and u.adminid=a.id and a.opid = :userid )
                            where m1.parentid = 0 and m1.sqlid = :sqlid
                    ) a        group by m1, m2
                )    a 
                group by m1
                """
            )).params(sqlid=sqlId).params(userid=userId)
    return query_to_list_json(query)


def list_where_menus(sqlid):
    query = db.session.query().from_statement(
            text("""
                select concat('[', group_concat(json_str separator ',') ,']') as json_str from (
                select
                concat( '{"id":', c.whid, ',"nm":"', c.colnm, '","sub":[', group_concat(concat('{"id":',v.valid, ', "nm":"', v.valnm, '","desc":"', v.valstr ,'"}') separator ',') ,']}') as json_str
                from dswhcolumn c, dswhvalue v where c.whid = v.whid and c.sqlid = :sqlid
                group by c.whid, c.colnm ) a
                """)).params(sqlid=sqlid)
    return query_to_list_json(query)

def list_select_menus(sqlid):
    query = db.session.query().from_statement(
            text("""
                select selid as id, selnm as nm from dsselect where sqlid = :sqlid
                """)).params(sqlid=sqlid)
    return query_to_list_json(query)

def listTmpl(sqlId, selId, userId):
        # select concat('[',group_concat(tmpls), ']') as tmpls from (
        #   SELECT
        #     concat('{"tmpltype":"', tmpltype, '", "subs":[',
        #            group_concat(concat('{"tmplid":"', v.tmplid, '","tmplnm":"', v.tmplnm, '","filepath":"', v.filepath, '"}')
        #                         SEPARATOR ','), ']}') AS tmpls
        #   FROM viewtmpl v, dsviewtmpl m
        #   WHERE 1
        #         AND v.tmplid = m.tmplid
        #         AND m.sqlid = :sqlid
        #         AND m.selid = :selid
        #   GROUP BY tmpltype
    query = db.session.query().from_statement(text(
        """

        select concat('[',group_concat(tmpls),']') as tmpls from (
        select concat('{"tmplid":"',  v.tmplid, '","tmplnm":"', v.tmplnm, '","filepath":"',v.filepath, '","tmpltype":"', v.tmpltype ,'"}' ) as tmpls
        FROM viewtmpl v, dsviewtmpl m
        WHERE 1
        AND v.tmplid = m.tmplid
        AND m.sqlid = :sqlid
        AND m.selid = :selid
        ) a
        """
    )).params(sqlid=sqlId).params(selid=selId)
    return query_to_list_json(query)

def descriptions(sqlId,userId):
    query = db.session.query().from_statement(
            text(
                """
                select 'query' as types, concat('<strong>', sqlnm,'</strong><br/>',sqldesc, '') as descs from dsquery where sqlid = :sqlid
                union all
                select 'select' as types,  group_concat(seldesc,',') as descs from dsselect a where a.sqlid = :sqlid and exists (select 'e' from wavemenu b, wavemenu_admin c, admin d where a.sqlid=b.sqlid and a.selid=b.dstblid and b.dstbltype='dsselect' and b.menuid=c.menuid and c.adminid=d.id and d.opid = :userid)
                union all
                select 'where' as types, group_concat(colstr,',') as descs from dswhcolumn a where a.sqlid = :sqlid and exists (select 'e' from wavemenu b, wavemenu_admin c, admin d, dswhvalue e where a.sqlid=b.sqlid and e.whid=a.whid and e.valid=b.dstblid and b.dstbltype='dswhvalue' and b.menuid=c.menuid and c.adminid=d.id and d.opid = :userid)
                union all
                select 'template' as types, group_concat(distinct a1.tmpldesc,',') as descs from viewtmpl a1, dsviewtmpl a where a.tmplid = a1.tmplid and a.sqlid = :sqlid and exists (select 'e' from wavemenu b, wavemenu_admin c, admin d, dsselect e where a.selid = e.selid and a.sqlid=b.sqlid and e.selid=b.dstblid and b.dstbltype='dsselect' and b.menuid=c.menuid and c.adminid=d.id and d.opid = :userid)
                """
            )).params(sqlid=sqlId).params(userid=userId).params(sqlid=sqlId)
    return query_to_list_json(query)


def checkWhQuery(sqlid, colids):
    if colids and len(colids)>0:
        valqstr = "and v.valid in (" + colids + ")"
    else:
        valqstr = ""
    query = db.session.query().from_statement(
            text("""select c.whid, c.sqlid, c.colstr,c.colnm,c.operand,c.coltype,c.filtertype,v.valid,v.valstr,v.valnm from dswhcolumn c, dswhvalue v where c.whid=v.whid and c.sqlid=v.sqlid and c.sqlid=:sqlid """+valqstr+""" """)).params(sqlid=sqlid)
    return query_to_list_json(query)

def getExeQuery(sqlId, selId, whvalId, tmplId, userId, sdt, edt, limit, bounds, roundlevel):
    print 'getExeQuery result : ' + str(whvalId)
    colids = sum([[ a for a in k['colvals']] for k in whvalId], [])
    print 'colids is ' + str(colids)
    # print 'colids.join() is ' + str(colids).strip('[]')
    data = checkWhQuery(sqlId, str(colids).strip('[]') )
    print 'checkWhQuery result is ' + str(data)

    for idx, k in enumerate(whvalId):
        for i in data :
            print data
            if str(k['whid']) == str(i['whid']):
                # print 'is not true????'
                k['whid'] = i['whid']
                k['coltype'] = i['coltype']
                k['operand'] = i['operand'] # operand is  =, in, > , <, >=, <=
                k['colstr'] = i['colstr']
                k['filtertype'] = i['filtertype']
                whvalId[idx] = k

    new_whquery = []
    print '---- new setted whvalId is -----'
    print whvalId
    for k in whvalId:
        if k['coltype'] != 'number':
            squato = "\\'"
        else:
            squato = ""

        if len(k['colvals']) > 0:
            _str_colvals = " and v.valid in ( " + ",".join(map(str,k['colvals'])) + ")"
        else:
            _str_colvals = ""

        if len(k['colvals']) > 0 and k['filtertype'] and k['filtertype'].lower() == 'customezble':
            new_whquery.append("""
                select 'where' as cmd, cast(concat('and ', colstr,
                    ' """+k['operand']+""" ', cast(concat('"""+squato+"""',group_concat(concat(cast(v.valstr as char)) SEPARATOR '|'),'"""+squato+"""') as char(4000) CHARACTER SET utf8)) as char(1000)) as val
                    ,'' as name from dswhcolumn c, dswhvalue v  where c.sqlid = v.sqlid and c.whid = v.whid and c.sqlid = """+str(sqlId)+"""
                    and  v.whid = """+str(k['whid'])+"""   """+ _str_colvals +"""  group by c.sqlid, c.whid""")
        elif len(k['colvals']) > 0:
            if k['operand'] in ['in']:
                new_whquery.append("""select 'where' as cmd, cast(concat('and ', colstr,
                    ' """+k['operand']+""" (', cast(group_concat(concat('"""+squato+"""',cast(v.valstr as char),'"""+squato+"""') SEPARATOR ',') as char(4000) CHARACTER SET utf8), ')') as char(1000)) as val
                    ,'' as name from dswhcolumn c, dswhvalue v where c.sqlid = v.sqlid and c.whid = v.whid and c.sqlid = """+str(sqlId)+"""
                    and  v.whid = """+str(k['whid'])+"""  """+ _str_colvals +""" group by c.sqlid, c.whid""")
            elif k['operand'] in ['<=', '<', '>', '>=']:
                new_whquery.append("""
                    select 'where' as cmd, cast(concat('and ', colstr,
                        ' """+k['operand']+""" ', cast(group_concat(concat(cast(v.valstr as char)) SEPARATOR ',') as char(4000) CHARACTER SET utf8)) as char(1000)) as val
                    ,'' as name from dswhcolumn c, dswhvalue v  where c.sqlid = v.sqlid and c.whid = v.whid and c.sqlid = """+str(sqlId)+"""
                        and  v.whid = """+str(k['whid'])+"""   """+ _str_colvals +"""  group by c.sqlid, c.whid""")
            elif k['operand'] in ['=']:
                new_whquery.append("""select 'where' as cmd, cast(concat('and ', colstr,
                    ' """+k['operand']+""" ', cast(group_concat(concat('"""+squato+"""',cast(v.valstr as char),'"""+squato+"""') SEPARATOR ',') as char(4000) CHARACTER SET utf8)) as char(1000)) as val
                    ,'' as name from dswhcolumn c, dswhvalue v  where c.sqlid = v.sqlid and c.whid = v.whid and c.sqlid = """+str(sqlId)+"""
                    and  v.whid = """+str(k['whid'])+"""  """+ _str_colvals +"""  group by c.sqlid, c.whid""")


    sqlstr = """
            select 'stmt' as cmd, sqlstmt as val, sqlnm as name from dsquery where sqlid = :sqlId
            union all
            select 'select' as cmd, selcols as val,selnm as name  from dsselect where sqlid = :sqlId and selid = :selId
            union all
            select 'groupby' as cmd, grpbystmt as val ,''  as name from dsselect where sqlid = :sqlId and selid = :selId
            union all
            select 'having' as cmd, havingstmt as val,''  as name from dsselect where sqlid = :sqlId and selid = :selId
            union all
            select 'orderby' as cmd, orderbystmt as val,''  as name from dsselect where sqlid = :sqlId and selid = :selId
            union all
            select 'resformat' as cmd, resfmt as val,''  as name from dsselect where sqlid = :sqlId and selid = :selId
            union all
            select 'template' as cmd, filepath as val,''  as name from viewtmpl t, dsviewtmpl d where t.tmplid = d.tmplid and sqlid = :sqlId and selid = :selId and d.tmplid = :tmplId
        """
    if len(new_whquery) > 0:
        sqlstr += """ union all """ + "\n union all ".join(new_whquery)

    print sqlstr

    query = db.session.query().from_statement(
        sqlstr
        ).params(sqlId=sqlId, selId=selId, tmplId=tmplId)

    data = query_to_list_json(query)
    exeinfo = ExeQuery()

    exeinfo.sdt = sdt
    exeinfo.edt = edt
    exeinfo.limit = limit
    # print 'roundlevel----------------'
    # print roundlevel
    # print bounds

    if roundlevel:
        exeinfo.roundlevel = roundlevel
    else:
        exeinfo.roundlevel = None

    for k in data:
        # print '#######>' + json.dumps(k)
        if k['cmd'] == 'stmt':
            exeinfo.stmt = k['val']
            exeinfo.stmtname = k['name']
        elif k['cmd'] == 'select':
            exeinfo.select = k['val']
            exeinfo.selname = k['name']
        elif k['cmd'] == 'where':
            exeinfo.where = exeinfo.where + ' ' + k['val']
        elif k['cmd'] == 'groupby':
            exeinfo.groupby = k['val']
        elif k['cmd'] == 'having':
            exeinfo.having = k['val']
        elif k['cmd'] == 'orderby':
            exeinfo.orderby = k['val']
        elif k['cmd'] == 'resformat':
            exeinfo.resformat = k['val']
        elif k['cmd'] == 'template':
            exeinfo.template = k['val']

    bounds_str = ''
    # bounds = [16.539216496008894,42.75338379488741,111.8718348967285,142.1501552092285];
    if bounds:
        if 'latitude'.upper() in exeinfo.select.upper() and 'longitude'.upper() in exeinfo.select.upper():
            bounds_str = bounds_str + ' AND latitude >= ' +  str(bounds[0]) + ' AND latitude <= ' + str(bounds[2])
            bounds_str = bounds_str + ' AND longitude >= ' +  str(bounds[1]) + ' AND longitude <= ' + str(bounds[3])
        elif 'lat'.upper() in exeinfo.select.upper() and 'lng'.upper() in exeinfo.select.upper():
            bounds_str = bounds_str + ' AND lat >= ' +  str(bounds[0]) + ' AND lat <= ' + str(bounds[2])
            bounds_str = bounds_str + ' AND lng >= ' +  str(bounds[1]) + ' AND lng <= ' + str(bounds[3])

    exeinfo.where = exeinfo.where + ' ' + bounds_str
    exeinfo.outerlatlng = None
    exeinfo.groupbylatlng = None

    groupbyLatLng(exeinfo)
    return exeinfo

def groupbyLatLng(exeinfo):
    refselli = []
    i = 0
    if exeinfo.roundlevel:
        selectlist = exeinfo.select.split(',')
        for item in selectlist:
            # item = item.upper()
            i = i + 1 
            if ' AS ' in item:
                refselli.append({'index':i, 'column':item.split(' AS ')[0].strip(), 'alias':item.split(' AS ')[1].strip()})
            elif ' as ' in item:
                refselli.append({'index':i, 'column':item.split(' as ')[0].strip(), 'alias':item.split(' as ')[1].strip()})
            else:
                refselli.append({'index':i, 'column':item.strip(), 'alias':item.strip()})

        ablatlng = False
        for item in refselli:
            print item
            if item['alias'].upper() == 'LAT' or item['alias'].upper() == 'LATITUDE' or item['alias'].upper() =='LNG' or item['alias'].upper() == 'LONGITUDE':
                item['column'] = 'TRUNCATE(' + item['column'] + ',' + str(exeinfo.roundlevel) + ')'
                ablatlng = True
            elif ablatlng:
                if exeinfo.template == 'google-label-map':
                    item['column'] = 'min(' + item['alias'] + ')'
                else:
                    item['column'] = 'avg(' + item['alias'] + ')'
                # item['column'] = 'sum(' + item['alias'] + ')'

        print refselli

        exeinfo.outerlatlng = ','.join([item['column'] + ' AS ' + item['alias'] for item in refselli])
        exeinfo.groupbylatlng = ','.join([item['column'] for item in refselli if item['alias'].upper() == 'LAT' or item['alias'].upper() == 'LATITUDE' or item['alias'].upper() == 'LNG' or item['alias'].upper() == 'LONGITUDE']) 

def compileQuery(exeinfo):

    # print '[exeinfo]=>' + str(exeinfo)
    if exeinfo.where is None:
        exeinfo.stmt = exeinfo.stmt.replace('#where#', '')
    else:        
        exeinfo.stmt = exeinfo.stmt.replace('#where#', exeinfo.where)

    exeinfo.stmt = exeinfo.stmt.replace("#sdt#", exeinfo.sdt)
    if exeinfo.edt is None or exeinfo.edt == '' or exeinfo.edt == 'null':
        exeinfo.edt = '20371231' 
    exeinfo.stmt = exeinfo.stmt.replace("#edt#", exeinfo.edt)


    # print '***'+exeinfo.groupby+'***'
    # print str(exeinfo.groupby is not None)
    # print str(not exeinfo.groupby )
    # print str(len(exeinfo.groupby) > 0)

    query_arr = []
    if exeinfo.outerlatlng:
        query_arr.append('select ' + exeinfo.outerlatlng + ' from ( ')

    query_arr.append("select " + exeinfo.select + " from (" + exeinfo.stmt + ") a")

    if exeinfo.groupby is not None and len(exeinfo.groupby) > 0:
        query_arr.append(" group by " + exeinfo.groupby)
    if exeinfo.having is not None and len(exeinfo.having) > 0:
        query_arr.append(" having " + exeinfo.having)
    if exeinfo.orderby is not None and len(exeinfo.orderby) > 0:
        query_arr.append(" order by " + exeinfo.orderby)
    if exeinfo.limit is not None and len(exeinfo.limit) > 0:
        query_arr.append(" limit " + exeinfo.limit)


    if exeinfo.groupbylatlng:
        query_arr.append(' ) g group by ' + exeinfo.groupbylatlng)

    if exeinfo.limit is not None and exeinfo.limit.isdigt():
        query_arr.append(' limit ' + exeinfo.limit)

    # print ''.join(query_arr)
    return ''.join(query_arr)

def executeQuery(exeinfo):

    query_str = compileQuery(exeinfo)    
    query = db.session.query().from_statement(query_str)

    new_dict = {}
    new_dict['restitle'] = exeinfo.selname + ' of ' + exeinfo.stmtname
    new_dict['resformat'] = 'json'
    new_dict['resvalue'] = query_to_list_json(query)
    new_dict['query'] = query_str
    new_dict['template'] = exeinfo.template
    # print new_dict['resvalue']
    return new_dict

    
class ExeQuery(object):
    def __init__(self, stmt='', select='', where='', groupby='', having='', orderby='', limit='', resformat='', template='', sdt='', edt='', stmtname='', selname=''):
        self.stmt = stmt
        self.select = select
        self.where = where
        self.groupby = groupby
        self.orderby = orderby
        self.having = having
        self.limit = limit
        self.resformat = resformat
        self.template = template
        self.sdt = sdt
        self.edt = edt
        self.stmtname = stmtname
        self.selname = selname

    def __repr__(self):
        return "ExeQuery {0}, {1}, {2}, {3}, {4}, {5}, {6}, {7}".format(str(self.stmt), str(self.select), str(self.where), str(self.groupby), str(self.orderby), str(self.limit), str(self.resformat), str(self.template))


