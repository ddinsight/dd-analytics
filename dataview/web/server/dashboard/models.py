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


# class Dashboard(CRUDMixin, db.Model):
#     __tablename__ = 'dashboard'
#
#     id = db.Column(db.Integer, primary_key=True, autoincrement=True)
#     title = db.Column(db.String)
#     desc = db.Column(db.String)
#     adminid = db.Column(db.Integer)
#     refresh_intv = db.Column(db.Integer)
#
#     def is_check_right(self, kwargs):
#         a = db.session.query(self).filter_by(**kwargs).first()
#         if a:
#             return True
#         else:
#             return False
#
#     def __repr__(self):
#         return '<Menus {0} {1} {2} {3}>'.format(self.id, self.title, self.desc, self.adminid)
#
#
# class DashboardItem(CRUDMixin, db.Model):
#     __tablename__ = 'dashboard_item'
#
#     id = db.Column(db.Integer, primary_key=True, autoincrement=True)
#     title = db.Column(db.String)
#     url = db.Column(db.String)
#     refresh_intv = db.Column(db.Integer)
#     dashboard_id = db.Column(db.Integer)
#
#     def __repr__(self):
#         return '<Menus {0} {1} {2} {3} {4}>'.format(self.id, self.title, self.url, self.refresh_intv, self.dashboard_id)

class dbmenu(CRUDMixin, db.Model):
    __tablename__ = 'dbmenu'

    menuid = db.Column(db.Integer, primary_key=True, autoincrement=True)
    parentid = db.Column(db.Integer)
    dspnm = db.Column(db.String)
    url = db.Column(db.String)
    leafyn = db.Column(db.String)
    menutype = db.Column(db.String)
    crtdt = db.Column(db.Integer)
    crtid = db.Column(db.String)

    def __repr__(self):
        return '<dbmenu {0} {1} {2} {3} {4} {5} >'.format(self.menuid, self.parentid, self.dspnm, self.url, self.leafyn, self.menutype)

class client(CRUDMixin, db.Model):
    __tablename__ = 'client'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    orgprefix = db.Column(db.String)
    name = db.Column(db.String)
    desc = db.Column(db.String)
    crtdt = db.Column(db.Integer)
    crtid = db.Column(db.String)

    def __repr__(self):
        return '<client {0} {1} {2} {3} >'.format(self.id, self.orgprefix, self.name, self.desc)


class dbmenu_client(CRUDMixin, db.Model):
    __tablename__ = 'dbmenu_client'

    menuid =  db.Column(db.Integer, primary_key=True, autoincrement=True)
    clientid = db.Column(db.Integer, primary_key=True, autoincrement=True)
    crtdt = db.Column(db.Integer)
    crtid = db.Column(db.String)

    def __repr__(self):
        return '<dbmenu_client {0} {1}>'.format(self.menuid, self.clientid)


class dbmenu_admin(CRUDMixin, db.Model):
    __tablename__ = 'dbmenu_admin'

    menuid =  db.Column(db.Integer, primary_key=True, autoincrement=True)
    adminid = db.Column(db.Integer, primary_key=True, autoincrement=True)
    crtdt = db.Column(db.Integer)
    crtid = db.Column(db.String)


def __list_menus_for_dashboard(user_id):
	return query_to_list_json( db.session.query().from_statement( text(
			"""
			select concat('[', group_concat(a.m1), ']') as m1 from (
              select concat('{', a.m1, ', "subs":[', group_concat(if(m2 is NULL, NULL, if(m2!='', concat('{',m2,'}' ), ''))) , ']}')  as m1 from (
                select
                  if(m1.menuid is not NULL, concat('"id":"',m1.menuid,'", "name":"',m1.dspnm,'","url":"',m1.url,'","icon":"',m1.icon,'"'),'') as m1,
                  if(m2.menuid is not NULL, concat('"id":"',m2.menuid,'", "name":"',m2.dspnm,'","url":"',m2.url,'","icon":"',m2.icon,'"'),'')  as m2,
                  m1.ordr as ordr
                from dbmenu as m1
                left join dbmenu as m2 on m2.parentid = m1.menuid
                where m1.parentid = 0
              ) a group by a.m1 order by a.ordr
            ) a
			"""
			)))
