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


from datetime import datetime as dt

from flask.ext.wtf import Form
from wtforms import fields
from wtforms.validators import Required
from wtforms.ext.sqlalchemy.fields import QuerySelectField

from server.chartmaker.models import *
from server.chartviewer.models import *


class DsQueryForm(Form):
	sqlid = fields.IntegerField()
	sqlnm = fields.StringField(validators = [Required()])
	sqldesc = fields.StringField(validators = [Required()])
	sqlstmt = fields.TextAreaField(validators = [Required()])
	dbtype = fields.StringField()
	useyn = fields.StringField()

class DsSelectForm(Form):
	sqlid = fields.IntegerField()
	selid = fields.IntegerField()
	selnm = fields.StringField(validators = [Required()])
	selcols = fields.StringField(validators = [Required()])
	seldesc = fields.StringField(validators = [Required()])
	grpbystmt = fields.StringField()
	havingstmt = fields.StringField()
	orderbystmt = fields.StringField()
	restype = fields.StringField()
	resfmt = fields.StringField()


class DsWhColumnForm(Form):
    sqlid = fields.IntegerField()
    whid = fields.IntegerField()
    colstr = fields.StringField()
    colnm = fields.StringField()
    operand = fields.StringField()
    coltype = fields.StringField()
    filtertype = fields.StringField()

class DsWhValueForm(Form):
	sqlid = fields.IntegerField()
	whid = fields.IntegerField()
	valid = fields.IntegerField()
	valstr = fields.StringField()
	valnm = fields.StringField()
	# operand = fields.StringField()


class WaveMenuForm(Form):
	menuid = fields.IntegerField()
	parentid = fields.IntegerField()
	dspnm = fields.StringField()
	leafyn = fields.StringField()
	sqlid = fields.IntegerField()
	dstbltype = fields.StringField()
	dstblid = fields.IntegerField()
	multiselectyn = fields.StringField()



	