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


from flask.ext.sqlalchemy import SQLAlchemy
from sqlalchemy import Column, Integer, String, Date
from server.data import db, CRUDMixin

import sys, re
import simplejson as json
from flask import jsonify
from server.chartviewer.models import *
from server.data import db, compile_query, query_to_list_json, group_concat
from server.users.models import User, WaveMenuAdmin
from sqlalchemy.sql import text, exists, and_, or_, not_, func, operators, literal_column, union_all, distinct
from sqlalchemy.sql import tuple_
from sqlalchemy import cast, select, String
import sqlparse
from sqlalchemy.exc import SQLAlchemyError


def _get_columns_infomation(table_name):
	query  = db.session.query().from_statement(
		text(
			"""
			SELECT column_name, data_type FROM INFORMATION_SCHEMA.COLUMNS  WHERE TABLE_SCHEMA='test'  AND TABLE_NAME='"""+table_name+"""';
			"""
			))
	data = query_to_list_json(query)
	return data


def _get_table_infomation(userid):
	data = db.session.execute(
		db.session.query().from_statement(text(""" select orgprefix from admin where id = :userid """)).params(userid=userid))
	ooo = []
	for d in data:
		print d
		orgs = d.orgprefix.split(',')
		for o in orgs:
			ooo.append('t.table_name like \''+o+'\_%\'')

	sqlstr =  """
			SELECT t.table_name ,  concat(ROUND(DATA_LENGTH/1024/1024,2),'MB') AS data_length
			FROM INFORMATION_SCHEMA.TABLES  t
			WHERE t.TABLE_SCHEMA='test' 
			and 
			""" + " or ".join(ooo)
	print sqlstr		
	query  = db.session.query().from_statement( text(sqlstr) ).params(userid=userid)

	data = query_to_list_json(query)
	return data

	# query  = db.session.query().from_statement(
	# 	text(
	# 		"""
	# 		SELECT t.table_name , ROUND(DATA_LENGTH/1024/1024,0) AS data_length 
	# 		FROM INFORMATION_SCHEMA.TABLES  t, chartmaker a
	# 		WHERE t.TABLE_SCHEMA='test' 
	# 		AND a.id = :userid
	# 		AND t.table_name LIKE concat(a.orgprefix, '\_%') 
	# 		"""
	# 		)).params(userid=userid)
	# data = query_to_list_json(query)
	# return data


def _get_table_and_columns_infomation(userid):
	query  = db.session.query().from_statement(
		text(
			"""
			SELECT 
				t.table_name, c.column_name, c.data_type 
			FROM information_schema.tables t,information_schema.columns c , admin a
			WHERE 1=1
			AND	t.table_schema = 'test'  AND t.table_schema = c.table_schema 
			AND t.table_name = c.table_name
			AND a.id = :userid 
			AND t.table_name LIKE concat(a.orgprefix, '\_%')

			ORDER BY 1
			"""
			)).params(userid=userid)
	data = query_to_list_json(query)
	new_dict = [{'table_name':k, 'columns':[d for d in data if d.get('table_name') == k]} for k in set(d.get('table_name') for d in data)]
	return new_dict


def _execute_query_from_fiddle(query_str):
	query  = db.session.query().from_statement(text(query_str + " limit 100" ))
	result = {}
	try:
		data = query_to_list_json(query)
		result['data'] = data
		result['status'] = 'success'
	except SQLAlchemyError as e:
		result['status'] = 'error'
		print e
		result['data'] = str(e)


	return result