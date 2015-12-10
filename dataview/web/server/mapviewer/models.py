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


#models.py

from flask.ext.sqlalchemy import SQLAlchemy
from sqlalchemy import Column, Integer, String, Date
from server.data import db, CRUDMixin
import sys
import simplejson as json
from server.chartviewer.models import *
from server.data import db, compile_query, query_to_list_json, group_concat
from server.users.models import User, WaveMenuAdmin
from sqlalchemy.sql import text, exists, and_, or_, not_, func, operators, literal_column, union_all, distinct
from sqlalchemy.sql import tuple_
from sqlalchemy import cast, select, String
#
class Mapboard(CRUDMixin, db.Model):
    __tablename__ = 'mapboard'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    title = db.Column(db.String)
    desc = db.Column(db.String)
    adminid = db.Column(db.Integer)

    def is_check_right(self, kwargs):
        a = db.session.query(self).filter_by(**kwargs).first()
        if a:
            return True
        else:
            return False

    def __repr__(self):
        return '<Mapboard {0} {1} {2}>'.format(self.id, self.title, self.adminid)

class MapboardItem(CRUDMixin, db.Model):
    __tablename__ = 'mapboard_item'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    url = db.Column(db.String)
    mapboard_id = db.Column(db.Integer)
    title = db.Column(db.String)
    desc = db.Column(db.String)
    colors = db.Column(db.String)

    def __repr__(self):
        # return '<Menus {0} {1} {2} {3} {4}>'.format(self.id, self.url, self.mapboard_id, self.map_type, self.map_color)
        return '<MapboardItem {0} {1} {2} {3} {4}>'.format(self.id, self.url, self.mapboard_id, self.title, self.desc)

def list_query_for_map(userid):
    query  = db.session.query().from_statement(
        text(
            """
            select q.sqlid, sqlnm, sqldesc
                    from dsquery q, dsquery_admin qa , admin a
                    where 1=1
                    and q.sqlid = qa.sqlid
                    and qa.adminid = a.id
                    and a.opid = :userid
                    and q.sqlid in (select sqlid from dsselect s where s.selcols LIKE UPPER('%lat%lng%') )
                    and q.useyn = 'y'
                    and lower(sqlnm) like '%map%'
            """
            )).params(userid=userid)
    return query_to_list_json(query)

def list_templates_for_map():
    query  = db.session.query().from_statement(
        text(
            """
                SELECT * FROM viewtmpl v WHERE UPPER(v.filepath) LIKE UPPER('%google%map%')
            """
            ))
    return query_to_list_json(query)
#
def list_mapboard_from_model(userid):
    query  = db.session.query().from_statement(
        text(
            """
                select
                m.id, m.title, m.desc, m.adminid, ifnull(group_concat(i.title),'') as items
                from mapboard m left join mapboard_item i  on m.id = i.mapboard_id
                where 1=1
                and   m.adminid = :userid
                group by m.id, m.title, m.desc, m.adminid
            """
            )).params(userid=userid)
    return query_to_list_json(query)
#
def list_mapboard_items_from_model(mapboard_id):
    query  = db.session.query().from_statement(
        text(
            """
                select
                i.*
                from mapboard_item i
                where i.mapboard_id = :mapboard_id
            """
            )).params(mapboard_id=mapboard_id)
    return query_to_list_json(query)

def map_query_by_str(query_str, bounds, roundlevel, template):
    # print '------- map_query_by_str ------'
    bounds = bounds.split(',')
    # print query_str
    # print bounds
    # print roundlevel
    # print template

    import re
    query_str = re.sub(r'AND lat >= [\-]*(\d)+.(\d)+',r'AND lat >= '+str(bounds[0]),query_str)
    query_str = re.sub(r'AND latitude >= [\-]*(\d)+.(\d)+',r'AND latitude >= '+str(bounds[0]),query_str)
    query_str = re.sub(r'AND lat <= [\-]*(\d)+.(\d)+',r'AND lat <= '+str(bounds[2]),query_str)
    query_str = re.sub(r'AND latitude <= [\-]*(\d)+.(\d)+',r'AND latitude <= '+str(bounds[2]),query_str)

    query_str = re.sub(r'AND lng >= [\-]*(\d)+.(\d)+',r'AND lng >= '+str(bounds[1]),query_str)
    query_str = re.sub(r'AND longitude >= [\-]*(\d)+.(\d)+',r'AND longitude >= '+str(bounds[1]),query_str)
    query_str = re.sub(r'AND lng <= [\-]*(\d)+.(\d)+',r'AND lng <= '+str(bounds[3]),query_str)
    query_str = re.sub(r'AND longitude <= [\-]*(\d)+.(\d)+',r'AND longitude <= '+str(bounds[3]),query_str)

    query_str = re.sub(r'TRUNCATE\((\s)*lat,(\s)*(\d)+(\.)*(\d)*(\s)*\)',r'TRUNCATE(lat,'+str(roundlevel)+')',query_str)
    query_str = re.sub(r'TRUNCATE\((\s)*latitude,(\s)*(\d)+(\.)*(\d)*(\s)*\)',r'TRUNCATE(latitude,'+str(roundlevel)+')',query_str)
    query_str = re.sub(r'TRUNCATE\((\s)*lng,(\s)*(\d)+(\.)*(\d)*(\s)*\)',r'TRUNCATE(lng,'+str(roundlevel)+')',query_str)
    query_str = re.sub(r'TRUNCATE\((\s)*longitude,(\s)*(\d)+(\.)*(\d)*(\s)*\)',r'TRUNCATE(longitude,'+str(roundlevel)+')',query_str)

    # print 'query_str is ----------> '
    # print query_str
    new_dict = {}
    new_dict['resformat'] = 'json'
    new_dict['resvalue'] = query_to_list_json(db.session.query().from_statement(text(query_str)))
    # print '***** resvalue length is *****'
    # print len(new_dict['resvalue'])
    new_dict['query'] = query_str
    new_dict['template'] = template

    return new_dict






def q_list_query_for_map(userid):
    query  = db.session.query().from_statement(
        text(
            """
--				SELECT DISTINCT q.* FROM dsquery q, dsselect s WHERE q.sqlid = s.sqlid AND UPPER(s.selcols) LIKE UPPER('%lat%lng%')
                SELECT DISTINCT q.* FROM dsquery q, dsquery_admin a, dsselect s WHERE q.sqlid = s.sqlid AND UPPER(s.selcols) LIKE UPPER('%lat%lng%') AND q.sqlid = a.sqlid AND a.adminid = :userid
            """
            )).params(userid=userid)
    return query_to_list_json(query)

def q_list_templates_for_map():
    query  = db.session.query().from_statement(
        text(
            """
                SELECT * FROM viewtmpl v WHERE UPPER(v.filepath) LIKE UPPER('%google%map%')
            """
            ))
    return query_to_list_json(query)




