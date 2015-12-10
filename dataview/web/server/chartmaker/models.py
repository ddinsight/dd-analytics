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
from sqlalchemy import Column, Integer, String, Date
from server.data import db, CRUDMixin
import datetime
import sys, re
import simplejson as json
from flask import jsonify
from server.chartviewer.models import *
from server.data import db, compile_query, query_to_list_json, group_concat
from server.users.models import User, WaveMenuAdmin
from sqlalchemy.sql import text, exists, and_, or_, not_, func, operators, literal_column, union_all, distinct
from sqlalchemy.sql import tuple_
from sqlalchemy import cast, select, String
import sqlparse

class Menus(CRUDMixin, db.Model):
    __tablename__ = 'menus'

    id = db.Column(db.Integer, primary_key=True)
    parent_id = db.Column(db.Integer)
    name = db.Column(db.String)
    url = db.Column(db.String)
    svcname = db.Column(db.String)

    def __repr__(self):
        return '<Menus {0} {1} {2} {3} {4}>'.format(self.id, self.parent_id, self.name, self.url, self.svcname)

class MenusUsers(CRUDMixin, db.Model):
    __tablename__ = 'menus_users'

    menuid = db.Column(db.Integer, primary_key=True)
    userid = db.Column(db.Integer)
    crtdt = db.Column(db.Date)
    crtid = db.Column(db.String)

    def __repr__(self):
        return '<Menus {0} {1} {2} {3} {4}>'.format(self.menuid, self.userid, self.crtdt, self.crdid)


def __list_menus(userId):
    query = db.session.query().from_statement(
            text(
                """
                select concat(id,'-',name,'-',url) as parent, GetFamilyTree(id,'"""+userId+"""') as childs  
                from menus where parent_id = 0 and svcname = 'wave'
                """
            ))

    a = []
    for row in db.session.execute(query):
        if len(row.childs) != 0:
            c = []
            for child in row.childs.split(','):
                cc = child.split('-')
                c.append({'id':cc[0], 'name':cc[1], 'url':cc[2], 'count':cc[3]})
            aa = row.parent.split('-')
            a.append({'id':aa[0], 'name':aa[1], 'url':aa[2], 'subs':c})
    print a
    return a

def __list_dswhcolumn(sqlid):
    query  = db.session.query().from_statement(
        text(
            """
            select whid, sqlid, colstr, colnm, operand, coltype, filtertype from dswhcolumn where sqlid = :sqlid
            """
            )).params(sqlid=sqlid)
    return query_to_list_json(query)


def __view_dswhcolumn(sqlid):
    query  = db.session.query().from_statement(
        text(
            """
            select whid, sqlid, colstr, colnm, operand, coltype, filtertype from dswhcolumn where sqlid = :sqlid and whid = :whid
            """
            )).params(sqlid=sqlid).params(whid=whid)
    return query_to_list_json(query)


def __list_dsselect(sqlid,selid):
    selidstmt = ""
    if selid > 0:
        selidstmt = """ and d.selid = """ + str(selid)

    query  = db.session.query().from_statement(
        text(
            """
                select 
                    d.sqlid, d.selid, d.selnm, d.seldesc, d.selcols, d.grpbystmt, d.havingstmt, d.orderbystmt, if(a.cnt is NULL, 0, a.cnt) as templates
                from dsselect d left join (select sqlid, selid, count(*) cnt from viewtmpl v, dsviewtmpl m where v.tmplid = m.tmplid group by sqlid, selid) a on a.sqlid = d.sqlid and a.selid = d.selid 
                where 1=1
                and d.sqlid = :sqlid

            """ + selidstmt
            )).params(sqlid=sqlid)
    return query_to_list_json(query)

def __list_viewtmpl_sample():
    query = db.session.query().from_statement(text(
            """ select group_concat(concat(tmplnm,'->',sample) SEPARATOR '</br> *') as sample FROM viewtmpl """
        ))
    return query_to_list_json(query)

def __list_viewtmpl(sqlid, selid):
    selstmt = ""
    if selid > 0:
        selstmt = """ and selid = """  + str(selid)
    query  = db.session.query().from_statement(
        text(
            """
                select v.tmplid, v.tmplnm, v.tmpldesc, v.filepath, d.sqlid, d.selid
                from viewtmpl v left join dsviewtmpl d  on v.tmplid = d.tmplid and d.sqlid = :sqlid and selid = :selid                
            """
            )).params(sqlid=sqlid).params(selid=selid)
    return query_to_list_json(query)


def __add_dsviewtmpl(sqlid, selid, templates):
    print '__add_dsviewtmpl start ' + str(templates)
    query  = db.session.query().from_statement(
        text(
            """
                delete from dsviewtmpl where sqlid=:sqlid and selid=:selid
            """
            )).params(sqlid=sqlid).params(selid=selid)
    db.session.execute(query)

    for t in templates.split(','):
        print t
        tmplid = t.split('_')[0]
        kwargs = {'sqlid':sqlid, 'selid':selid, 'tmplid':tmplid}
        aa = DsViewTmpl.get_or_create(**kwargs)
        print aa


def __list_menus_for_admin(sqlid,userid,m_type):
    chkquery = db.session.query().from_statement(
        text(
            """ 
            select * from wavemenu m1 where m1.parentid = 0 and m1.sqlid = :sqlid and m1.dspnm = :m_type
            """
        )).params(sqlid=sqlid).params(m_type=m_type)

    results = db.session.execute(chkquery)

    if len(list(results)) == 0:
        if m_type == 'metric':
            dstbltype = 'dsselect'
        elif m_type == 'condition':
            dstbltype = 'dswhcolumn'

        initData = {'parentid':0, 'dspnm':m_type, 'dstbltype':dstbltype, 'dstblid':0, 'sqlid':sqlid, 'leafyn':'N', 'multiselectyn':'N'}
        wavemenu = WaveMenu.create(**initData)
        print wavemenu

    query  = db.session.query().from_statement(
        text(
            """
            select concat( '{',m1,', "nodes":[', group_concat(m2), ']', '}' ) as data from (
                select m1, if(m2 is NULL, NULL, if(m2!='', concat('{',m2,',"nodes":[', group_concat(m3) ,']','}' ), '')) as m2 from (
                    select 
                        if(m1.menuid is not NULL, concat('"id":"',m1.menuid,'", "title":"',m1.dspnm,'","tbltype":"',m1.dstbltype,'","tblid":"',m1.dstblid,'", "multiselectyn":"',m1.multiselectyn,'"'),'') as m1,
                        if(m2.menuid is not NULL, concat('"id":"',m2.menuid,'", "title":"',m2.dspnm,'","tbltype":"',m2.dstbltype,'","tblid":"',m2.dstblid,'", "multiselectyn":"',m2.multiselectyn,'"'),'')  as m2,
                        if(m3.menuid is not NULL, concat('{"id":"',m3.menuid,'", "title":"',m3.dspnm,'","tbltype":"',m3.dstbltype,'","tblid":"',m3.dstblid,'", "multiselectyn":"',m3.multiselectyn,'"}'), '')  as m3
                    from wavemenu as m1
                    left join wavemenu as m2 on m2.parentid = m1.menuid
                    left join wavemenu as m3 on m3.parentid = m2.menuid 
                    where m1.parentid = 0 and m1.sqlid = :sqlid and m1.dspnm = :m_type
                ) a group by m2
            ) a
            """
            )).params(sqlid=sqlid).params(m_type=m_type)

    return query_to_list_json(query)

def __list_dsquery_users(sqlid):
    # print str(sqlid) + ' in __list_dsquery_users'
    query  = db.session.query().from_statement(
        text(
            """
            SELECT a.id, a.opnm, a.email, m.sqlid, a.orgprefix
            FROM admin a LEFT JOIN dsquery_admin m ON m.adminid = a.id AND m.sqlid = :sqlid
            where svcname = 'wave'
            """
            )).params(sqlid=sqlid)
    return query_to_list_json(query)


def __add_dsquery_admin(sqlid, users):
    print '__add_dsquery_admin start ' + str(users)
    query  = db.session.query().from_statement(
        text(
            """
                delete from dsquery_admin where sqlid = :sqlid
            """
            )).params(sqlid=sqlid)
    db.session.execute(query)

    for t in users.split(','):
        print t
        adminid = t.split('_')[0]
        kwargs = {'adminid':adminid, 'sqlid':sqlid}
        aa = DsQueryAdmin.get_or_create(**kwargs)
        print aa


def __list_menu_users(menuid):
    query  = db.session.query().from_statement(
        text(
            """
            select a.id, a.opnm, a.email, m.menuid
            from chartmaker a left join wavemenu_admin m on m.adminid = a.id  and m.menuid = :menuid    where a.svcname = 'wave'
            """
            )).params(menuid=menuid)
    return query_to_list_json(query)


def __add_wavemenu_admin(menuid, users):
    print '__add_wavemenu_admin start ' + str(users)
    query  = db.session.query().from_statement(
        text(
            """
                delete from wavemenu_admin where menuid = :menuid
            """
            )).params(menuid=menuid)
    db.session.execute(query)

    for t in users.split(','):
        print t
        adminid = t.split('_')[0]
        kwargs = {'adminid':adminid, 'menuid':menuid}
        aa = WaveMenuAdmin.get_or_create(**kwargs)
        print aa

def __test_connection_execute(query_str):
    query = db.session.query().from_statement(text(query_str + " limit 1 "))
    syntax_err = False

    try:
        db.session.execute(query)
    except Exception as e:
        # print e
        e_str = str(e.message)
        print '------ e_str --------'
        print e_str
        print '------ e_str end --------'
        syntax_err = True
        pass

    if syntax_err:
        return jsonify({'result':'error', 'message':e_str, 'query':query_str})
    else:    
        return jsonify({'result':'success'})


def _available_columns(sqlid):
    print '__available_columns(' + str(sqlid) + ')'

    query = DsQuery.query.filter(DsQuery.sqlid == sqlid)
    data = query_to_list_json(query)
    ret = []
    for row in data:
        query = db.session.query().from_statement(text(row['sqlstmt'] + " limit 1 "))
        try:
            result = db.session.execute(query)
            row = result.fetchone()
            # print result.keys()
            return result.keys()
        except Exception as e:
            print e
            return []
    return []


def _test_dsselect_conntection(sqlid, selcols, grpbystmt, havingstmt, orderbystmt):
    query_full_str = selcols+grpbystmt+havingstmt+orderbystmt + ' limit 1'
    query = db.session.query().from_statement(text(query_full_str))
    syntax_err = False
    print query_full_str
    try:
        result = query_to_list_json(query_full_str)
    except Exception as e:
        e_str = str(e.message)
        syntax_err = True
        pass
    if syntax_err:
        return json.dumps({'result':'error', 'message':e_str, 'query':query_full_str})
    else:
        return json.dumps({'result':'success', 'resvalue':result, 'message':'', 'query':query_full_str })

    # query = DsQuery.query.filter(DsQuery.sqlid == sqlid)
    # data = query_to_list_json(query)
    # syntax_err = False
    # ret = []
    # grpbystmt_str = ""
    # orderbystmt_str = ""
    # for row in data:
    #     if grpbystmt:
    #         grpbystmt_str = """ group by """ + grpbystmt
    #         if havingstmt:
    #              grpbystmt_str = grpbystmt_str + """ having """ + havingstmt
    #     if orderbystmt:
    #         orderbystmt_str = """ order by """ + orderbystmt
    #
    #     query_full_str =  """ select """ + selcols + """ from ( """ + row['sqlstmt'] +  """ ) a """ + grpbystmt_str +  """  """+ orderbystmt_str +  """ limit 100 """
    #
    #
    #     delta = datetime.timedelta(days=-15)
    #     sdt = (datetime.datetime.now() + delta).strftime('%Y%m%d')
    #     edt = datetime.datetime.now().strftime('%Y%m%d')
    #     if '#sdt#' in query_full_str:
    #         query_full_str = query_full_str.replace('#sdt#',sdt)
    #     if '#edt#' in query_full_str:
    #         query_full_str = query_full_str.replace('#edt#',edt)
    #     if '#where#' in query_full_str:
    #         query_full_str = query_full_str.replace('#where#','')
    #
    #     query = db.session.query().from_statement(text(query_full_str))
    #     print query_full_str
    #     try:
    #         result = query_to_list_json(query)
    #         # row = result.fetchone()
    #     except Exception as e:
    #         e_str = str(e.message)
    #         syntax_err = True
    #         pass
    #
    # # kkkk = json.dumps({'resvalue':result})
    # # print kkkk
    #
    # if syntax_err:
    #     # return jsonify({'result':'error'})
    #     return json.dumps({'result':'error', 'message':e_str, 'query':query_full_str})
    # else:
    #     return json.dumps({'result':'success', 'resvalue':result, 'message':'', 'query':query_full_str })


def _get_tablename_from_sqlid(sqlid):
    query = DsQuery.query.filter(DsQuery.sqlid == sqlid)
    datas = []
    data = query_to_list_json(query)
    for row in data:
        sql = row['sqlstmt']
        print sql.lower()
        m = re.search('from\s+(^\s)*[^\(]*\s+where', sql.lower())
        print m.group(0)
        aa = m.group(0).replace('from','').replace('where','').strip()
        if ',' in aa:
            bb = aa.split(',')
        else:
            bb = [aa]
        bb = [[ v for v in b.strip().split(' ') if ' ' in b][0] if ' ' in b else b.strip() for b in bb]    
        print bb
        for b in bb:
            query = db.session.query().from_statement(text("describe " + b))
            result = db.session.execute(query)
            for row in result:
                # datas.append(b + "->" + row['Field'])
                # print row['Field'] + '-' + row['Key']
                if row['Key'] == 'PRI':
                    datas.append({'value':row['Field'] ,'dspnm':b + '.' +row['Field'] + '[primary key]'})
                else:
                    datas.append({'value':row['Field'] ,'dspnm':b + '.' +row['Field']})
        # print '_get_tablename_from_sqlid result ---->'
        print datas
        return datas


def __list_dsquery(userid):

    query  = db.session.query().from_statement(
        text(
            """
            select
                q.*,
                ifnull((select count(*) as cnt from dsselect t where t.sqlid = q.sqlid ),0) as selcnt,
                ifnull((select count(*) as cnt from dswhcolumn t where t.sqlid = q.sqlid ),0) as colcnt,
                ifnull((select count(*) as cnt from dswhvalue t where t.sqlid = q.sqlid ),0) as valcnt
            from dsquery q , dsquery_admin qa 
            where 1
            and q.sqlid = qa.sqlid
            and qa.adminid = :userid
            """
            )).params(userid=userid)

    return query_to_list_json(query)

def __get_values_from_sqlid(sqlid, whid, valstr):
    # print '===> begin __get_values_from_sqlid... ' + sqlid + ' / ' + whid + ' / ' + valstr
    query = DsQuery.query.filter(DsQuery.sqlid == sqlid)
    datas = []
    data = query_to_list_json(query)
    if whid is None:
        wwhid = -1
    else:
        wwhid = whid
    # print data
    for row in data:
        sql = row['sqlstmt']
        print sql.lower()
        m = re.search('from\s+(^\s)*[^\(]*\s+where', sql.lower())
        # print m.group(0)
        aa = m.group(0).replace('from','').replace('where','').strip()
        print aa
        if ',' in aa:
            bb = aa.split(',')
            cc = []
            for b in bb:
                if 'left join' in b:
                    cc.append(b.split('left join')[0].split(' ')[0])
                    cc.append(b.split('left join')[1].split(' ')[0])
                else:
                    if ' ' in b:
                        cc.append(b.strip().split(' ')[0])
                    else:
                        print cc
                        print b
                        cc.append(b)
            bb = cc
        elif 'left join' in aa:
            bb = [aa.split('left join')[0].strip().split(' ')[0], aa.split('left join')[1].strip().split(' ')[0]]
        else:
            bb = [aa]
        bb = [[ v for v in b.strip().split(' ') if ' ' in b][0] if ' ' in b else b.strip() for b in bb]
        print '====> now what contains in bb '
        print bb
        for b in bb:
            query = db.session.query().from_statement(text("select a.valstr, b.valnm, if(b.valstr is NULL, 0, 1) as chk from ( select distinct "+valstr+" as valstr from "+b+" ) a left join (select * from dswhvalue where sqlid = "+str(sqlid)+" and whid= "+str(wwhid)+") b on a.valstr= b.valstr "))
            try:
                datas += query_to_list_json(query)
            except:
                print 'error'
        print datas
    return datas


def __update__whvalue(sqlid, whid, vallist):
    print '__update__whvalue start ' + str(sqlid) + ' / ' + str(whid)

    aa = DsWhValue.query.filter(DsWhValue.sqlid==sqlid).filter(DsWhValue.whid==whid).all()
    newarr = []
    print aa
    for val in vallist:
        exists = False;
        for a in aa:
            print '----- a is ----'
            print a.valstr + ' --- ' + val['valstr']
            if a.valstr == val['valstr']:
                exists = True;
        if exists is False:
            newarr.append({'valstr':val['valstr'], 'valnm':val['valnm'], 'whid':whid, 'sqlid':sqlid})

    print 'new array length is ' +  str(len(newarr))
    for arr in newarr:
        t = arr
        dsvalue = DsWhValue.create(**t)
        print str(dsvalue)
