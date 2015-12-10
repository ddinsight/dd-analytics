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


from flask import abort, Blueprint, g
from server.dashboard.forms import *
from server.dashboard.models import __list_menus_for_dashboard
from server.util import *
from server.users.views import auth
import simplejson as json
import server

dashboard = Blueprint("dashboard", __name__)

################################################################################################################
# about Dashboard REST url
################################################################################################################
# @dashboard.route("/list", methods=['GET','POST','OPTIONS']) # remove 'ds'
# @crossdomain(origin=server.app.config['CROSSDOMAIN_ORIGIN'], credentials=True, headers='Authorization')
# @auth.login_required
# def list_dashboard():
#     userid = g.user.id
#     query = Dashboard.query.filter_by(adminid=userid)
#     data = query_to_list_json(query)
#     return json.dumps(data)
#
# @dashboard.route("/view/<int:dashboard_id>", methods=['GET','POST','OPTIONS']) # remove 'ds'
# @crossdomain(origin=server.app.config['CROSSDOMAIN_ORIGIN'], credentials=True, headers='Authorization')
# @auth.login_required
# def view_dashboard(dashboard_id):
#     print 'def view_dashboard(dashboard_id): =================='
#     userid = g.user.id
#     instance = Dashboard.get(dashboard_id)
#     print instance
#     if instance is None:
#         nextdashboard = query_to_list_json(Dashboard.query.filter(Dashboard.id>dashboard_id).filter(Dashboard.adminid==userid).limit(1))
#         prevdashboard = query_to_list_json(Dashboard.query.filter(Dashboard.id<dashboard_id).filter(Dashboard.adminid==userid).order_by(Dashboard.id.desc()).limit(1))
#         if nextdashboard:
#             newid = nextdashboard[0]['dashboard_id']
#         elif prevdashboard:
#             newid = prevdashboard[0]['dashboard_id']
#         else:
#             newid = 0
#     print 'newid is ' + str(newid)
#     query = Dashboard.query.filter_by(adminid=userid).filter_by(id=newid)
#     data = query_to_list_json(query)
#     return json.dumps(data)
#
# @dashboard.route("/add", methods=['GET','POST','OPTIONS']) # remove 'ds'
# @crossdomain(origin=server.app.config['CROSSDOMAIN_ORIGIN'], credentials=True, headers='Authorization')
# @auth.login_required
# def add_dashboard():
#     userid = g.user.id
#     print 'add_dashboard called '
#     print 'request.form in all is '  + str(request.form)
#     # print 'request.form.get in sqlid is '  + str(request.form.get('sqlid',None))
#     form = DashboardForm(csrf_enabled=False)
#     if request.method == 'POST' and form.validate():
#         form.adminid.data = userid
#         print 'form.data is ' + str(form.data)
#         instance = Dashboard.create(**form.data)
#     print form.errors
#     query = Dashboard.query.order_by(Dashboard.id.desc()).filter_by(id=instance.id).filter_by(adminid=userid).limit(1)
#     data = query_to_list_json(query)
#     print data
#     print '-------- add data return value end ----------'
#     return json.dumps(data)
#
# @dashboard.route("/edit/<int:dashboard_id>", methods=['GET','POST','OPTIONS'])
# @crossdomain(origin=server.app.config['CROSSDOMAIN_ORIGIN'], credentials=True, headers='Authorization')
# @auth.login_required
# def edit_dashboard(dashboard_id):
#     userid = g.user.id
#     print 'edit_dashboard called '
#     print 'request.form in all is '  + str(request.form)
#
#     form = DashboardForm(csrf_enabled=False)
#     print 'form.data is ' + str(form.data)
#     instance = Dashboard.get_or_404(dashboard_id)
#     if instance and request.method == 'POST' and form.validate():
#         instance.update(**form.data)
#     query = Dashboard.query.filter(Dashboard.id == dashboard_id).filter_by(adminid=userid)
#     data = query_to_list_json(query)
#     return json.dumps(data)
#
# @dashboard.route("/delete/<int:dashboard_id>", methods=['GET','POST','OPTIONS'])
# @crossdomain(origin=server.app.config['CROSSDOMAIN_ORIGIN'], credentials=True, headers='Authorization')
# @auth.login_required
# def delete_query(dashboard_id):
#     userid = g.user.opid
#     print '----- delete_query ------'
#     items = query_to_list_json(DashboardItem.query.filter_by(dashboard_id=dashboard_id))
#     for item in items:
#         inst = DashboardItem.get(item['id'])
#         if inst:
#             inst.delete()
#
#     form = DashboardForm(csrf_enabled=False)
#     print 'form.data:' + str(form)
#     instance = Dashboard.get(dashboard_id)
#     # print str(dsquery)
#     if instance:
#         nextdashboard = query_to_list_json(Dashboard.query.filter(Dashboard.id>dashboard_id).limit(1))
#         prevdashboard = query_to_list_json(Dashboard.query.filter(Dashboard.id<dashboard_id).order_by(Dashboard.id.desc()).limit(1))
#         if nextdashboard:
#             newid = nextdashboard[0]['dashboard_id']
#         elif prevdashboard:
#             newid = prevdashboard[0]['dashboard_id']
#         else:
#             newid = 0
#         instance.delete()
#         return jsonify({'result':'success', 'dashboard_id':newid})
#
#     return jsonify({'result':'error', 'dashboard_id':dashboard_id})


################################################################################################################
# about Dashboard Item REST url
################################################################################################################
# @dashboard.route("/item/list/<int:dashboard_id>", methods=['GET','POST','OPTIONS']) # remove 'ds'
# @crossdomain(origin=server.app.config['CROSSDOMAIN_ORIGIN'], credentials=True, headers='Authorization')
# @auth.login_required
# def list_dashboard_item(dashboard_id):
#     userid = g.user.id
#     query = DashboardItem.query.filter_by(dashboard_id=dashboard_id)
#     data = query_to_list_json(query)
#     print data
#     return json.dumps(data)
#
# @dashboard.route("/item/view/<int:dashboard_id>/<int:item_id>", methods=['GET','POST','OPTIONS']) # remove 'ds'
# @crossdomain(origin=server.app.config['CROSSDOMAIN_ORIGIN'], credentials=True, headers='Authorization')
# @auth.login_required
# def view_dashboard_item(dashboard_id,item_id):
#     # userid = g.user.id
#     query = DashboardItem.query.filter_by(dashboard_id=dashboard_id).filter_by(id=item_id)
#     data = query_to_list_json(query)
#     return json.dumps(data)
#
# @dashboard.route("/item/add/<int:dashboard_id>", methods=['GET','POST','OPTIONS']) # remove 'ds'
# @crossdomain(origin=server.app.config['CROSSDOMAIN_ORIGIN'], credentials=True, headers='Authorization')
# @auth.login_required
# def add_dashboard_item(dashboard_id):
#     # userid = g.user.id
#     print 'add_dashboard_item called '
#     print 'request.form in all is '  + str(request.form)
#     # print 'request.form.get in sqlid is '  + str(request.form.get('sqlid',None))
#     form = DashboardItemForm(csrf_enabled=False)
#     if request.method == 'POST' and form.validate():
#         print 'form.data is ' + str(form.data)
#         instance = DashboardItem.create(**form.data)
#     print form.errors
#     query = DashboardItem.query.filter_by(dashboard_id=dashboard_id).order_by(DashboardItem.id.desc()).limit(1)
#     data = query_to_list_json(query)
#     print '-------- add data return value end ----------'
#     print data
#     return json.dumps(data)
#
# @dashboard.route("/item/edit/<int:dashboard_id>/<int:item_id>", methods=['GET','POST','OPTIONS'])
# @crossdomain(origin=server.app.config['CROSSDOMAIN_ORIGIN'], credentials=True, headers='Authorization')
# @auth.login_required
# def edit_dashboard_item(dashboard_id, item_id):
#     # userid = g.user.id
#     print 'edit_dashboard_item called  request.form in all is '  + str(request.form)
#     form = DashboardItemForm(csrf_enabled=False)
#     print 'form.data is ' + str(form.data)
#     instance = DashboardItem.get_or_404(item_id)
#     if instance and request.method == 'POST' and form.validate():
#         instance.update(**form.data)
#     query = DashboardItem.query.filter(DashboardItem.dashboard_id == dashboard_id).filter(DashboardItem.id == item_id)
#     data = query_to_list_json(query)
#     return json.dumps(data)
#
# @dashboard.route("/item/delete/<int:dashboard_id>/<int:item_id>", methods=['GET','POST','OPTIONS'])
# @crossdomain(origin=server.app.config['CROSSDOMAIN_ORIGIN'], credentials=True, headers='Authorization')
# @auth.login_required
# def delete_dashboard_item(dashboard_id, item_id):
#     # userid = g.user.opid
#     print '----- delete_dashboard_item ------'
#     form = DashboardItemForm(csrf_enabled=False)
#     print 'form.data:' + str(form)
#     print 'dashboard_item_id is %s'%(item_id)
#     instance = DashboardItem.get_or_404(item_id)
#     print str(instance)
#     if instance:
#         instance.delete()
#         return jsonify({'result':'success', 'item_id':item_id})
#     return jsonify({'result':'error', 'item_id':item_id})


@dashboard.route("/menus", methods=['GET','POST','OPTIONS'])
@crossdomain(origin=server.app.config['CROSSDOMAIN_ORIGIN'], credentials=True, headers='Authorization')
@auth.login_required
def list_dashboard_menu():
    print '----- list_dashboard_menu ------'
    data = __list_menus_for_dashboard(g.user.opid)
    print data
    return json.dumps(data)



