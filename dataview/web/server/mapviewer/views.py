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


# views.py

from flask import abort, Blueprint, flash, redirect, render_template, request, url_for, g, jsonify
import urllib
from sqlalchemy.exc import IntegrityError
from server.chartviewer.models import *
from server.mapviewer.models import *
# from server.mapviewer.models import _query_by_str
from server.mapviewer.forms import *
from server.util import *
from server.users.views import auth
import simplejson as json
import server

mapviewer = Blueprint("mapviewer", __name__)


@mapviewer.route("/list", methods=['GET', 'POST', 'OPTIONS'])
@crossdomain(origin=server.app.config['CROSSDOMAIN_ORIGIN'], credentials=True, headers='Authorization')
@auth.login_required
def dataset():
    userid = g.user.opid
    selection = list_query_for_map(userid)  # after add userid parameter
    return json.dumps(selection)


@mapviewer.route("/menus/sqlid/<string:sqlid>", methods=['GET', 'POST', 'OPTIONS'])
@crossdomain(origin=server.app.config['CROSSDOMAIN_ORIGIN'], credentials=True, headers='Authorization')
@auth.login_required
def menusBysqlid(sqlid):
    userid = g.user.opid
    selection = listMenus(sqlid, userid)
    return json.dumps(selection)


@mapviewer.route("/menus/where/sqlid/<string:sqlid>", methods=['GET', 'POST', 'OPTIONS'])
@crossdomain(origin=server.app.config['CROSSDOMAIN_ORIGIN'], credentials=True, headers='Authorization')
@auth.login_required
def whereMenusBysqlid(sqlid):
    selection = list_where_menus(sqlid)
    return json.dumps(selection)

@mapviewer.route("/menus/select/sqlid/<string:sqlid>", methods=['GET', 'POST', 'OPTIONS'])
@crossdomain(origin=server.app.config['CROSSDOMAIN_ORIGIN'], credentials=True, headers='Authorization')
@auth.login_required
def selectMenusBysqlid1(sqlid):
    selection = list_select_menus(sqlid)
    return json.dumps(selection)


@mapviewer.route("/templates/sqlid/<string:sqlid>/selid/<string:selid>", methods=['GET', 'POST', 'OPTIONS'])
@crossdomain(origin=server.app.config['CROSSDOMAIN_ORIGIN'], credentials=True, headers='Authorization')
@auth.login_required
def tmplsBysqlidByselid(sqlid, selid):
    userid = g.user.opid
    selection = listTmpl(sqlid, selid, userid)
    return json.dumps(selection)


@mapviewer.route("/execute/sqlid/<string:sqlid>/selid/<string:selid>/tmplid/<string:tmplid>", methods=['GET', 'POST', 'OPTIONS'])
@crossdomain(origin=server.app.config['CROSSDOMAIN_ORIGIN'], credentials=True, headers='Authorization')
@auth.login_required
def execute(sqlid, selid, tmplid):
    userid = g.user.opid
    strparam = request.args.get('whvalid')
    strparam = urllib.unquote(strparam)
    whvalid = json.loads(strparam)

    sdt = request.args.get('sdt')
    edt = request.args.get('edt')
    limit = request.args.get('limit')
    bounds = request.args.get('bounds')
    roundlevel = request.args.get('roundlevel')

    if whvalid is None:
        whvalid = []
    elif whvalid == '[]':
        whvalid = []

    if bounds:
        print '--- bounds is ??? '
        print bounds
        bounds = bounds.split(',')

    print roundlevel

    selection = executeQuery(getExeQuery(sqlid, selid, whvalid, tmplid, userid, sdt, edt, limit, bounds, roundlevel))
    print json.dumps(selection, use_decimal=True)
    return json.dumps(selection, use_decimal=True)


@mapviewer.route("/description/sqlid/<string:sqlid>", methods=['GET', 'POST', 'OPTIONS'])
@crossdomain(origin=server.app.config['CROSSDOMAIN_ORIGIN'], credentials=True, headers='Authorization')
@auth.login_required
def descriptionById(sqlid):
    userid = g.user.opid
    selection = descriptions(sqlid, userid)
    return json.dumps(selection)


@mapviewer.route("/", methods=("GET", "POST"))
def index():
    return jsonify({'index': ''})

@mapviewer.route("/item/execute", methods=['GET', 'POST', 'OPTIONS'])  # remove 'ds'
@crossdomain(origin=server.app.config['CROSSDOMAIN_ORIGIN'], credentials=True, headers='Authorization')
@auth.login_required
def execute_mapboard_item_by_query():
    userid = g.user.id

    query_str = request.form['query']
    bounds = request.form['bounds']
    roundlevel = request.form['roundlevel']
    template = request.form['template']

    data = map_query_by_str(query_str, bounds, roundlevel, template)
    return json.dumps(data)




################################################################################################################
# about MapViewer REST url
################################################################################################################
@mapviewer.route("/board/query/list", methods=['GET', 'POST', 'OPTIONS'])  # remove 'ds'
@crossdomain(origin=server.app.config['CROSSDOMAIN_ORIGIN'], credentials=True, headers='Authorization')
@auth.login_required
def list_qurey_for_map():
    userid = g.user.id
    data = q_list_query_for_map(g.user.id)
    return json.dumps(data)


@mapviewer.route("/board/templates/list", methods=['GET', 'POST', 'OPTIONS'])  # remove 'ds'
@crossdomain(origin=server.app.config['CROSSDOMAIN_ORIGIN'], credentials=True, headers='Authorization')
@auth.login_required
def list_templates_for_map():
    userid = g.user.id
    data = q_list_templates_for_map()
    return json.dumps(data)


@mapviewer.route("/board/list", methods=['GET', 'POST', 'OPTIONS'])  # remove 'ds'
@crossdomain(origin=server.app.config['CROSSDOMAIN_ORIGIN'], credentials=True, headers='Authorization')
@auth.login_required
def list_mapboard():
    userid = g.user.id
    data = list_mapboard_from_model(g.user.id)
    return json.dumps(data)


@mapviewer.route("/board/view/<int:mapboard_id>", methods=['GET', 'POST', 'OPTIONS'])  # remove 'ds'
@crossdomain(origin=server.app.config['CROSSDOMAIN_ORIGIN'], credentials=True, headers='Authorization')
@auth.login_required
def view_mapboard(mapboard_id):
    userid = g.user.id
    query = Mapboard.query.filter_by(adminid=userid).filter_by(id=mapboard_id)
    data = query_to_list_json(query)
    return json.dumps(data)


@mapviewer.route("/board/add", methods=['GET', 'POST', 'OPTIONS'])  # remove 'ds'
@crossdomain(origin=server.app.config['CROSSDOMAIN_ORIGIN'], credentials=True, headers='Authorization')
@auth.login_required
def add_mapboard():
    userid = g.user.id
    print 'add_mapboard called '
    print 'request.form in all is ' + str(request.form)
    form = MapboardForm(csrf_enabled=False)
    if request.method == 'POST' and form.validate():
        form.adminid.data = userid
        print 'form.data is ' + str(form.data)
        instance = Mapboard.create(**form.data)
    print 'add result instance -------- '
    print instance
    print form.errors
    # query = Mapboard.query.order_by(Mapboard.id.desc()).filter_by(id=instance.id).filter_by(adminid=userid).limit(1)
    data = list_mapboard_from_model(g.user.id)
    return json.dumps(data)


@mapviewer.route("/board/edit/<int:mapboard_id>", methods=['GET', 'POST', 'OPTIONS'])
@crossdomain(origin=server.app.config['CROSSDOMAIN_ORIGIN'], credentials=True, headers='Authorization')
@auth.login_required
def edit_mapboard(mapboard_id):
    userid = g.user.id
    print 'edit_mapboard called '
    print 'request.form in all is ' + str(request.form)

    form = MapboardForm(csrf_enabled=False)
    print 'form.data is ' + str(form.data)
    instance = Mapboard.get_or_404(mapboard_id)
    if instance and request.method == 'POST' and form.validate():
        instance.update(**form.data)
    # query = Mapboard.query.filter(Mapboard.id == mapboard_id).filter_by(adminid=userid)
    data = list_mapboard_from_model(g.user.id)
    return json.dumps(data)


@mapviewer.route("/board/delete/<int:mapboard_id>", methods=['GET', 'POST', 'OPTIONS'])
@crossdomain(origin=server.app.config['CROSSDOMAIN_ORIGIN'], credentials=True, headers='Authorization')
@auth.login_required
def delete_mapboard(mapboard_id):
    userid = g.user.opid
    print '----- delete_mapboard ------'
    form = MapboardForm(csrf_enabled=False)
    print 'form.data:' + str(form)

    items = query_to_list_json(MapboardItem.query.filter_by(mapboard_id=mapboard_id))
    for item in items:
        inst = MapboardItem.get(item['id'])
        if inst:
            inst.delete()

    instance = Mapboard.get_or_404(mapboard_id)
    # print str(dsquery)
    if instance:
        instance.delete()
    data = list_mapboard_from_model(g.user.id)
    return json.dumps(data)



# ################################################################################################################
# # about Dashboard Item REST url
# ################################################################################################################
@mapviewer.route("/board/item/list/<int:mapboard_id>", methods=['GET', 'POST', 'OPTIONS'])  # remove 'ds'
@crossdomain(origin=server.app.config['CROSSDOMAIN_ORIGIN'], credentials=True, headers='Authorization')
@auth.login_required
def list_mapboard_item(mapboard_id):
    userid = g.user.id
    query = MapboardItem.query.filter_by(mapboard_id=mapboard_id)
    # data = q_list_mapboard_items(mapboard_id)
    data = query_to_list_json(query)
    # print data
    return json.dumps(data)


@mapviewer.route("/board/item/view/<int:mapboard_id>/<int:item_id>", methods=['GET', 'POST', 'OPTIONS'])  # remove 'ds'
@crossdomain(origin=server.app.config['CROSSDOMAIN_ORIGIN'], credentials=True, headers='Authorization')
@auth.login_required
def view_mapboard_item(mapboard_id):
    userid = g.user.id
    query = MapboardItem.query.filter_by(mapboard_id=mapboard_id).filter_by(id=item_id)
    data = query_to_list_json(query)
    return json.dumps(data)


@mapviewer.route("/board/item/add/<int:mapboard_id>", methods=['GET', 'POST', 'OPTIONS'])  # remove 'ds'
@crossdomain(origin=server.app.config['CROSSDOMAIN_ORIGIN'], credentials=True, headers='Authorization')
@auth.login_required
def add_mapboard_item(mapboard_id):
    userid = g.user.id
    print 'add_mapboard_item called '
    print 'request.form in all is ' + str(request.form)
    # print 'request.form.get in sqlid is '  + str(request.form.get('sqlid',None))
    form = MapboardItemForm(csrf_enabled=False)
    if request.method == 'POST' and form.validate():
        print 'form.data is ' + str(form.data)
        instance = MapboardItem.create(**form.data)
        urlstr = request.form['url']
        asqlid = re.search(r'\/sqlid\/(\d)*', urlstr, flags=0).group()[len('/sqlid/'):]
        aselid = re.search(r'\/selid\/(\d)*', urlstr, flags=0).group()[len('/selid/'):]
        atmplid = re.search(r'\/tmplid\/(\d)*', urlstr, flags=0).group()[len('/tmplid/'):]
        args = {'sqlid': int(asqlid), 'selid': int(aselid), 'tmplid': int(atmplid)}
        try:
            DsViewTmpl.get_or_create(**args)
        except (RuntimeError, TypeError, NameError, IntegrityError) as e:
            print e
            pass

    print form.errors
    query = MapboardItem.query.filter_by(mapboard_id=mapboard_id).order_by(MapboardItem.id.desc()).limit(1)
    data = query_to_list_json(query)
    print '-------- add data return value end ----------'
    print data
    return json.dumps(data)


@mapviewer.route("/board/item/edit/<int:mapboard_id>/<int:item_id>", methods=['GET', 'POST', 'OPTIONS'])
@crossdomain(origin=server.app.config['CROSSDOMAIN_ORIGIN'], credentials=True, headers='Authorization')
@auth.login_required
def edit_mapboard_item(mapboard_id, item_id):
    userid = g.user.id
    print 'edit_mapboard_item called  request.form in all is ' + str(request.form)
    form = MapboardItemForm(csrf_enabled=False)
    print 'form.data is ' + str(form.data)
    instance = MapboardItem.get_or_404(item_id)
    if instance and request.method == 'POST' and form.validate():
        instance.update(**form.data)
    query = MapboardItem.query.filter(MapboardItem.mapboard_id == mapboard_id).filter(MapboardItem.id == item_id)
    data = query_to_list_json(query)
    return json.dumps(data)


@mapviewer.route("/board/item/delete/<int:mapboard_id>/<int:item_id>", methods=['GET', 'POST', 'OPTIONS'])
@crossdomain(origin=server.app.config['CROSSDOMAIN_ORIGIN'], credentials=True, headers='Authorization')
@auth.login_required
def delete_mapboard_item(mapboard_id, item_id):
    userid = g.user.opid
    print '----- delete_mapboard_item ------'
    form = MapboardItemForm(csrf_enabled=False)
    print 'form.data:' + str(form)
    print 'delete_mapboard_item is %s' % (item_id)
    instance = MapboardItem.get_or_404(item_id)
    print str(instance)
    if instance:
        instance.delete()
        return jsonify({'result': 'success', 'item_id': item_id})
    return jsonify({'result': 'error', 'item_id': item_id})


@mapviewer.route("/board/item/execute/<int:mapboard_id>/<int:item_id>", methods=['GET', 'POST', 'OPTIONS'])  # remove 'ds'
@crossdomain(origin=server.app.config['CROSSDOMAIN_ORIGIN'], credentials=True, headers='Authorization')
@auth.login_required
def execute_mapboard_item_by_query2(mapboard_id, item_id):
    # userid = g.user.id
    #
    # query_str = request.form['query']
    # bounds = request.form['bounds']
    # roundlevel = request.form['roundlevel']
    # template = request.form['template']
    #
    # data = _query_by_str(query_str, bounds, roundlevel, template)
    # return json.dumps(data)
    # userid = g.user.id

    query_str = request.form['query']
    bounds = request.form['bounds']
    roundlevel = request.form['roundlevel']
    template = request.form['template']

    data = map_query_by_str(query_str, bounds, roundlevel, template)
    return json.dumps(data)

# @mapviewer.route("/execute/sqlid/<string:sqlid>/selid/<string:selid>/tmplid/<string:tmplid>", methods=['GET', 'POST', 'OPTIONS'])
# @crossdomain(origin=server.app.config['CROSSDOMAIN_ORIGIN'], credentials=True, headers='Authorization')
# @auth.login_required
# def execute(sqlid, selid, tmplid):
#     userid = g.user.opid
#     strparam = request.args.get('whvalid')
#     strparam = urllib.unquote(strparam)
#     whvalid = json.loads(strparam)
#
#     sdt = request.args.get('sdt')
#     edt = request.args.get('edt')
#     limit = request.args.get('limit')
#     bounds = request.args.get('bounds')
#     roundlevel = request.args.get('roundlevel')
#
#     if whvalid is None:
#         whvalid = []
#     elif whvalid == '[]':
#         whvalid = []
#
#     if bounds:
#         print '--- bounds is ??? '
#         print bounds
#         bounds = bounds.split(',')
#
#     print roundlevel
#
#     selection = executeQuery(getExeQuery(sqlid, selid, whvalid, tmplid, userid, sdt, edt, limit, bounds, roundlevel))
#     print json.dumps(selection, use_decimal=True)
#     return json.dumps(selection, use_decimal=True)

