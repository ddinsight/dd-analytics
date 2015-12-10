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

from flask import abort, Blueprint, flash, redirect, render_template, request, url_for, g, jsonify
from flask.ext.login import login_required, login_user, logout_user,current_user
from sqlalchemy.exc import IntegrityError
from bson import json_util
import urllib
from server.chartviewer.models import *
from server.chartmaker.models import *
from server.chartmaker.forms import *
from server.tools.models import *
from server.tools.models import _list_query_to_map
from server.util import *
from server.users.views import auth
import simplejson as json
import server

tools = Blueprint("tools", __name__)

################################################################################################################
# about Dashboard REST url
################################################################################################################
@tools.route("/querytomap", methods=['GET','POST','OPTIONS'])
@crossdomain(origin=server.app.config['CROSSDOMAIN_ORIGIN'], credentials=True, headers='Authorization')
@auth.login_required
def list_query_to_map():
    userid = g.user.id
    print str(request.args)
    print str(request.form)
    data = _list_query_to_map(request.form['querystr'])
    return json.dumps(data)
