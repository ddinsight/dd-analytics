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


from flask import Blueprint, request, g, jsonify, render_template, Response
from server.chartviewer.models import *
from server.api.models import _list_api_info
from server.util import *
import simplejson as json
import server
import urllib
from server.api.models import Dspkg, Dsavailkey

api = Blueprint("api", __name__)

@api.route("/data", methods=['GET'])
# @auth.login_required
def execute():
    # http://localhost:5002/api/v1.0/api/data?sqlid=60&selid=172&whvalid=[{"whid":76,"colvals":[332,333],"coltype":"","operand":""}]&sdt=20140924&edt=20141224&key=AIzaSyBGAqZ02fDq5-EeBJacYVKIfaT5LIsf5ew
    api_key = request.args.get('key')
    pkgkey = None
    if api_key:
        pkgkey = Dsavailkey.query.filter_by(api_key=api_key).first()
    if pkgkey is None:
        resp = make_response('UnAuthorized Access', 401)
        resp.headers['WWW-Authenticate'] = 'Fail Authorization'
        return resp

    sqlid = request.args.get('sqlid')
    selid = request.args.get('selid')
    whid = request.args.get('whvalid')
    whvalid = None
    if whid:
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
    exeinfo = getExeQuery(sqlid, selid, whvalid, 0, api_key, sdt, edt, limit, bounds, roundlevel)
    selection = executeQuery(exeinfo)
    print selection
    del selection['query']
    return json.dumps(selection, use_decimal=True)


@api.route("/info", methods=['GET'])
def infomation():
    api_key = request.args.get('key')
    pkgkey = None
    if api_key:
        pkgkey = Dsavailkey.query.filter_by(api_key=api_key).first()
    if pkgkey is None:
        resp = make_response('UnAuthorized Access', 401)
        resp.headers['WWW-Authenticate'] = 'Fail Authorization'
        return resp

    infos = _list_api_info()
    aaa = []
    for info in list(infos):
        aaa.append(info['ss'])
    ddd = "[" + ",".join(aaa) + "]"
    return Response(ddd, status=200, mimetype='application/json')

@api.route("/guide", methods=['GET'])
def guide():
    api_key = request.args.get('key')
    pkgkey = None
    if api_key:
        pkgkey = Dsavailkey.query.filter_by(api_key=api_key).first()
    if pkgkey is None:
        resp = make_response('UnAuthorized Access', 401)
        resp.headers['WWW-Authenticate'] = 'Fail Authorization'
        return resp

    infos = _list_api_info()
    aaa = []
    for info in list(infos):
        aaa.append(info['ss'])
    # ddd = "[" + ",".join(aaa) + "]"
    apis = json.loads("[" + ",".join(aaa) + "]")
    return render_template('api.html', apis=apis)

