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


from server.data import db, CRUDMixin
from server.chartviewer.models import *


class Report(CRUDMixin, db.Model):
    __tablename__ = 'dsreport'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    title = db.Column(db.String)
    uri = db.Column(db.String)
    desc = db.Column(db.String)
    adminid = db.Column(db.Integer)
    refresh_intv = db.Column(db.Integer)
    period_range = db.Column(db.Integer)

    def is_check_right(self, kwargs):
        a = db.session.query(self).filter_by(**kwargs).first()
        if a:
            return True
        else:
            return False

    def __repr__(self):
        return '<Report {0} {1} {2} {3}>'.format(self.id, self.title.encode('utf-8'), self.desc.encode('utf-8'), self.uri)


class ReportItem(CRUDMixin, db.Model):
    __tablename__ = 'dsreport_item'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    sqlid = db.Column(db.Integer)
    selid = db.Column(db.Integer)
    tmplid = db.Column(db.Integer)
    size = db.Column(db.String)
    ordr = db.Column(db.Integer)
    type = db.Column(db.String)
    url = db.Column(db.String)
    report_id = db.Column(db.Integer)

    def __repr__(self):
        return '<ReportItem {0} {1} {2} {3} {4}>'.format(self.id, self.sqlid, self.selid, self.tmplid, self.report_id)



def get_reportItem_for_exe(report_id, uri):
    if report_id < 1:
        query  = db.session.query().from_statement(
        text(
            """
               select i.id, sqlid, selid,tmplid, size, ordr, type, url, report_id, period_range from dsreport_item i, dsreport r where r.id = i.report_id and r.uri = :uri
            """
            )).params(uri=uri)
        return query_to_list_json(query)
    else:
        query  = db.session.query().from_statement(
        text(
            """
               select i.id, sqlid, selid,tmplid, size, ordr, type, url, report_id ,period_range from dsreport_item i, dsreport r where r.id = i.report_id and i.report_id = :report_id
            """
            )).params(report_id=report_id)
        return query_to_list_json(query)