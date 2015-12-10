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


from flask import Blueprint, request, g, jsonify
import urllib
from server.chartviewer.models import *
from server.util import *
from server.users.views import auth
import simplejson as json
import server



chartviewer = Blueprint("chartviewer", __name__)


@chartviewer.route("/list", methods=['GET', 'POST', 'OPTIONS'])
@crossdomain(origin=server.app.config['CROSSDOMAIN_ORIGIN'], credentials=True, headers='Authorization')
@auth.login_required
def dataset():
    userid = g.user.opid
    selection = listDataSet(userid)  # after add userid parameter
    return json.dumps(selection)


@chartviewer.route("/menus/sqlid/<string:sqlid>", methods=['GET', 'POST', 'OPTIONS'])
@crossdomain(origin=server.app.config['CROSSDOMAIN_ORIGIN'], credentials=True, headers='Authorization')
@auth.login_required
def menusBysqlid(sqlid):
    userid = g.user.opid
    selection = listMenus(sqlid, userid)
    return json.dumps(selection)


@chartviewer.route("/menus/where/sqlid/<string:sqlid>", methods=['GET', 'POST', 'OPTIONS'])
@crossdomain(origin=server.app.config['CROSSDOMAIN_ORIGIN'], credentials=True, headers='Authorization')
@auth.login_required
def whereMenusBysqlid(sqlid):
    selection = list_where_menus(sqlid)
    return json.dumps(selection)

@chartviewer.route("/menus/select/sqlid/<string:sqlid>", methods=['GET', 'POST', 'OPTIONS'])
@crossdomain(origin=server.app.config['CROSSDOMAIN_ORIGIN'], credentials=True, headers='Authorization')
@auth.login_required
def selectMenusBysqlid1(sqlid):
    selection = list_select_menus(sqlid)
    return json.dumps(selection)


@chartviewer.route("/templates/sqlid/<string:sqlid>/selid/<string:selid>", methods=['GET', 'POST', 'OPTIONS'])
@crossdomain(origin=server.app.config['CROSSDOMAIN_ORIGIN'], credentials=True, headers='Authorization')
@auth.login_required
def tmplsBysqlidByselid(sqlid, selid):
    userid = g.user.opid
    selection = listTmpl(sqlid, selid, userid)
    return json.dumps(selection)


@chartviewer.route("/execute/sqlid/<string:sqlid>/selid/<string:selid>/tmplid/<string:tmplid>", methods=['GET', 'POST', 'OPTIONS'])
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
        bounds = bounds.split(',')

    print roundlevel

    selection = executeQuery(getExeQuery(sqlid, selid, whvalid, tmplid, userid, sdt, edt, limit, bounds, roundlevel))
    print json.dumps(selection, use_decimal=True)
    return json.dumps(selection, use_decimal=True)


@chartviewer.route("/description/sqlid/<string:sqlid>", methods=['GET', 'POST', 'OPTIONS'])
@crossdomain(origin=server.app.config['CROSSDOMAIN_ORIGIN'], credentials=True, headers='Authorization')
@auth.login_required
def descriptionById(sqlid):
    userid = g.user.opid
    selection = descriptions(sqlid, userid)
    return json.dumps(selection)


@chartviewer.route("/", methods=("GET", "POST"))
def index():
    return jsonify({'index': ''})















