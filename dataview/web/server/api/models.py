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


__author__ = 'airplug'
import server
import os
from flask.ext.login import UserMixin
from sqlalchemy.ext.hybrid import hybrid_property
from passlib.apps import custom_app_context as pwd_context
from server.data import CRUDMixin, db
from itsdangerous import TimedJSONWebSignatureSerializer as Serializer, BadSignature, SignatureExpired
from sqlalchemy.sql import text, exists, and_, or_, not_, func, operators, literal_column, union_all, distinct
from sqlalchemy.sql import tuple_
from sqlalchemy import cast, select, String
from server.data import db, compile_query, query_to_list_json, group_concat



class Dspkg(CRUDMixin, db.Model):
    __tablename__ = 'dspkg'

    id = db.Column(db.Integer, primary_key=True)
    pkgnm = db.Column(db.String)
    apppkgnm = db.Column(db.String)
    updt = db.Column(db.DateTime)

    def __repr__(self):
        return '<dspkg {0} {1} {2} {3} >'.format(self.id, self.pkgnm, self.apppkgnm, self.updt)


class Dsavailkey(CRUDMixin, db.Model):
    __tablename__ = 'dsavailkey'

    dspkg_id = db.Column(db.Integer, primary_key=True)
    api_key = db.Column(db.String, primary_key=True)
    updt = db.Column(db.DateTime)

    def __repr__(self):
        return '<dsavailkey {0} {1} {2}>'.format(self.dspkg_id, self.api_key, self.updt)


def _list_api_info():
    db.session.execute('SET group_concat_max_len = 1000000')
    query  = db.session.query().from_statement(
        text(
            """
            select concat('{"sqlid":',sqlid,',"sqlnm":"', sqlnm,'","sqldesc":"', sqldesc,'","metrics":', metrics,', "filters":', ifnull(filters,'[]'), '}') as ss from (
            select
            q.sqlid, q.sqlnm, q.sqldesc,
            concat('[', group_concat( concat('{"selid":', selid,',"selnm":"' ,selnm, '","seldesc":"' , seldesc,'"}')), ']') as metrics
            , c.filters
            from dsquery q left join dsselect s on q.sqlid = s.sqlid
            left join  (
            select sqlid, concat('[',group_concat(vals),']') as filters from (
            select
            c.sqlid, concat('{"whid":',c.whid,',"colnm":"',colnm,'","values":[', group_concat(concat('{"valid":',valid, ',"valnm":"',valnm, '"}') separator ',' ), ']}') as vals
            from dswhcolumn c, dswhvalue v
            where c.sqlid = v.sqlid
            and c.whid = v.whid
            group by c.sqlid, c.whid
            ) a group by a.sqlid
            ) c on q.sqlid = c.sqlid
            where useyn='y'
            group by q.sqlid
            ) x
            """
            ))
    return query_to_list_json(query)