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
from server.dashboard.models import *


class ReportForm(Form):
    id = fields.IntegerField()
    title = fields.StringField(validators = [Required()])
    uri = fields.StringField(validators = [Required()])
    desc = fields.StringField(validators = [Required()])
    adminid = fields.IntegerField()
    refresh_intv = fields.IntegerField()
    period_range = fields.IntegerField()


class ReportItemForm(Form):
    id = fields.IntegerField()
    sqlid = fields.IntegerField()
    selid = fields.IntegerField()
    tmplid = fields.IntegerField()
    size = fields.StringField()
    ordr = fields.IntegerField()
    type = fields.StringField()
    url = fields.StringField()
    report_id = fields.IntegerField(validators = [Required()])

