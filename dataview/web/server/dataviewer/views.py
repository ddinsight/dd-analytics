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


from flask import Blueprint, g
from server.dataviewer.models import _get_table_infomation, _get_columns_infomation, _execute_query_from_fiddle

from server.util import *
from server.users.views import auth
import simplejson as json
import server

dataviewer = Blueprint("dataviewer", __name__)


################################################################################################################
# about query rest url
################################################################################################################

@dataviewer.route("/tables", methods=['GET','POST','OPTIONS']) # remove 'ds'
@crossdomain(origin=server.app.config['CROSSDOMAIN_ORIGIN'], credentials=True, headers='Authorization')
@auth.login_required
def list_tables():
	print 'list_tables...'
	userid = g.user.opid
	data = _get_table_infomation(g.user.id)
	return json.dumps(data)

@dataviewer.route("/table/columns/<string:tablename>", methods=['GET','POST','OPTIONS']) # remove 'ds'
@crossdomain(origin=server.app.config['CROSSDOMAIN_ORIGIN'], credentials=True, headers='Authorization')
@auth.login_required
def list_columns(tablename):
	print 'list_columns...'
	userid = g.user.opid
	data = _get_columns_infomation(tablename)
	return json.dumps(data)	

@dataviewer.route("/query/execute", methods=['GET','POST','OPTIONS']) # remove 'ds'
@crossdomain(origin=server.app.config['CROSSDOMAIN_ORIGIN'], credentials=True, headers='Authorization')
@auth.login_required
def get_data_from_query():
	print 'get_data_from_query...'
	userid = g.user.opid
	print 'request.form query is '
	# print str(request.form['query'])
	data = _execute_query_from_fiddle(request.form['query'])
	return json.dumps(data)

