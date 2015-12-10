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


def _list_query_to_map(querystr):
    # print str(querystr) + ' in _list_query_to_map!!! '
    query  = db.session.query().from_statement(text(querystr))
    return query_to_list_json(query)