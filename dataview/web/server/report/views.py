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
from server.report.forms import *
from server.report.models import *
from server.chartviewer.models import *
from server.util import *
from server.users.views import auth
from sqlalchemy import desc
import simplejson as json
import server
import time
import urllib
import datetime

report = Blueprint("report", __name__)

################################################################################################################
# about Report REST url
################################################################################################################
@report.route("/list", methods=['GET','POST','OPTIONS']) # remove 'ds'
@crossdomain(origin=server.app.config['CROSSDOMAIN_ORIGIN'], credentials=True, headers='Authorization')
@auth.login_required
def list_report():
    userid = g.user.id
    query = Report.query.filter_by(adminid=userid)
    data = query_to_list_json(query)
    return json.dumps(data)

@report.route("/view/<int:report_id>", methods=['GET','POST','OPTIONS']) # remove 'ds'
@crossdomain(origin=server.app.config['CROSSDOMAIN_ORIGIN'], credentials=True, headers='Authorization')
@auth.login_required
def view_report(report_id):
    print 'def view_report(report_id): =================='
    userid = g.user.id
    query = Report.query.filter_by(id=report_id)
    data = query_to_list_json(query)
    return json.dumps(data)

@report.route("/add", methods=['GET','POST','OPTIONS']) # remove 'ds'
@crossdomain(origin=server.app.config['CROSSDOMAIN_ORIGIN'], credentials=True, headers='Authorization')
@auth.login_required
def add_report():
    userid = g.user.id
    print 'add_report called '
    print 'request.form in all is '  + str(request.form)

    form = ReportForm(csrf_enabled=False)
    if request.method == 'POST' and form.validate():
        form.adminid.data = userid
        print 'form.data is ' + str(form.data)
        instance = Report.create(**form.data)

    print form.errors
    query = Report.query.filter_by(adminid=userid)
    data = query_to_list_json(query)
    print data
    print '-------- add data return value end ----------'
    return json.dumps(data)

@report.route("/edit/<int:report_id>", methods=['GET','POST','OPTIONS'])
@crossdomain(origin=server.app.config['CROSSDOMAIN_ORIGIN'], credentials=True, headers='Authorization')
@auth.login_required
def edit_report(report_id):
    userid = g.user.id
    print 'edit_report called '
    print 'request.form in all is '  + str(request.form)

    form = ReportForm(csrf_enabled=False)
    print 'form.data is ' + str(form.data)
    instance = Report.get_or_404(report_id)
    if instance and request.method == 'POST' and form.validate():
        instance.update(**form.data)
    query = Report.query.filter_by(adminid=userid)
    data = query_to_list_json(query)
    return json.dumps(data)

@report.route("/delete/<int:report_id>", methods=['GET','POST','OPTIONS'])
@crossdomain(origin=server.app.config['CROSSDOMAIN_ORIGIN'], credentials=True, headers='Authorization')
@auth.login_required
def delete_report(report_id):
    userid = g.user.opid
    print '----- delete_report ------'
    items = query_to_list_json(ReportItem.query.filter_by(report_id=report_id))
    for item in items:
        inst = ReportItem.get(item['id'])
        if inst:
            inst.delete()

    form = ReportForm(csrf_enabled=False)
    print 'form.data:' + str(form)
    instance = Report.get(report_id)
    if instance:
        instance.delete()

    query = Report.query.filter_by(adminid=userid)
    data = query_to_list_json(query)
    return json.dumps(data)


################################################################################################################
# about Report Item REST url
################################################################################################################
@report.route("/item/exe/<int:report_id>", methods=['GET','POST','OPTIONS']) # remove 'ds'
@crossdomain(origin=server.app.config['CROSSDOMAIN_ORIGIN'], credentials=True, headers='Authorization')
@auth.login_required
def exe_report_item(report_id):
    if report_id < 1:
        print 'exe_report_item request.args.get in all is '  + str(request.args.get('uri'))
        # print 'exe_report_item request.form in all is '  + str(request.form)
        uri = str(request.args.get('uri'))
        data = get_reportItem_for_exe(report_id, uri)
        # query = ReportItem.query.filter(Report.id==ReportItem.report_id).filter(Report.uri==uri).order_by(ReportItem.ordr)
        # data = query_to_list_json(query)
    else:
        data = get_reportItem_for_exe(report_id, None)
        # query = ReportItem.query.filter_by(report_id=report_id).order_by(ReportItem.ordr)
        # data = query_to_list_json(query)
    print data

    userid = g.user.opid
    strparam = request.args.get('whvalid')
    strparam = urllib.unquote(strparam) if strparam is not None else '[]'
    whvalid = json.loads(strparam)

    # sdt = str(time.strftime('%Y%m%d')) if request.args.get('sdt') is None else request.args.get('sdt')
    # edt = str(time.strftime('%Y%m%d')) if request.args.get('edt') is None else request.args.get('edt')

    if whvalid is None:
        whvalid = []
    elif whvalid == '[]':
        whvalid = []

    limit = request.args.get('limit')
    bounds = request.args.get('bounds')
    roundlevel = request.args.get('roundlevel')
    if bounds:
        bounds = bounds.split(',')

    retvalue = []
    for d in data:
        print 'period_range : ' + str(d['period_range']);
        sdt = datetime.datetime.strftime((datetime.date.today() - datetime.timedelta(d['period_range']*365/12)),'%Y%m%d') if request.args.get('sdt') == 'undefined' else request.args.get('sdt')
        edt = datetime.datetime.strftime(datetime.date.today(),'%Y%m%d') if request.args.get('edt') == 'undefined' else request.args.get('edt')
        selection = executeQuery(getExeQuery(d['sqlid'], d['selid'], whvalid, d['tmplid'], userid, sdt, edt, limit, bounds, roundlevel))
        selection['size'] = d['size']
        selection['id'] = d['id']
        selection['order'] = d['ordr']
        selection['sdt'] = sdt
        selection['edt'] = edt
        retvalue.append(selection)
    print  json.dumps(retvalue, use_decimal=True)
    return json.dumps(retvalue, use_decimal=True)


@report.route("/item/list/<int:report_id>", methods=['GET','POST','OPTIONS']) # remove 'ds'
@crossdomain(origin=server.app.config['CROSSDOMAIN_ORIGIN'], credentials=True, headers='Authorization')
@auth.login_required
def list_report_item(report_id):
    userid = g.user.id
    query = ReportItem.query.filter_by(report_id=report_id)
    data = query_to_list_json(query)
    print data
    return json.dumps(data)

@report.route("/item/view/<int:report_id>/<int:item_id>", methods=['GET','POST','OPTIONS']) # remove 'ds'
@crossdomain(origin=server.app.config['CROSSDOMAIN_ORIGIN'], credentials=True, headers='Authorization')
@auth.login_required
def view_report_item(report_id,item_id):
    # userid = g.user.id
    query = ReportItem.query.filter_by(report_id=report_id).filter_by(id=item_id)
    data = query_to_list_json(query)
    return json.dumps(data)

@report.route("/item/add/<int:report_id>", methods=['GET','POST','OPTIONS']) # remove 'ds'
@crossdomain(origin=server.app.config['CROSSDOMAIN_ORIGIN'], credentials=True, headers='Authorization')
@auth.login_required
def add_report_item(report_id):
    # userid = g.user.id
    print 'add_report_item called '
    print 'request.form in all is '  + str(request.form)
    # print 'request.form.get in sqlid is '  + str(request.form.get('sqlid',None))
    form = ReportItemForm(csrf_enabled=False)
    if request.method == 'POST' and form.validate():
        print 'form.data is ' + str(form.data)
        instance = ReportItem.create(**form.data)
        return jsonify({'status':'200'})
    print form.errors
    return jsonify({'status':'500'})
    # query = ReportItem.query.filter_by(report_id=report_id)
    # data = query_to_list_json(query)
    # print '-------- add data return value end ----------'
    # print data
    # return json.dumps(data)

@report.route("/item/edit/<int:report_id>/<int:item_id>", methods=['GET','POST','OPTIONS'])
@crossdomain(origin=server.app.config['CROSSDOMAIN_ORIGIN'], credentials=True, headers='Authorization')
@auth.login_required
def edit_report_item(report_id, item_id):
    # userid = g.user.id
    print 'edit_report_item called  request.form in all is '  + str(request.form)
    form = ReportItemForm(csrf_enabled=False)
    print 'form.data is ' + str(form.data)
    instance = ReportItem.get_or_404(item_id)
    if instance and request.method == 'POST' and form.validate():
        instance.update(**form.data)
        return jsonify({'status':'200'})
    return jsonify({'status':'500'})
    # query = ReportItem.query.filter(ReportItem.report_id == report_id).filter(ReportItem.id == item_id)
    # data = query_to_list_json(query)
    # return json.dumps(data)

@report.route("/item/delete/<int:report_id>/<int:item_id>", methods=['GET','POST','OPTIONS'])
@crossdomain(origin=server.app.config['CROSSDOMAIN_ORIGIN'], credentials=True, headers='Authorization')
@auth.login_required
def delete_report_item(report_id, item_id):
    # userid = g.user.opid
    print '----- delete_report_item ------'
    form = ReportItemForm(csrf_enabled=False)
    # print 'form.data:' + str(form)
    # print 'report_item_id is %s'%(item_id)
    instance = ReportItem.get_or_404(item_id)
    print str(instance)
    if instance:
        instance.delete()
        return jsonify({'status':'200'})
    return jsonify({'status':'500'})
    # query = ReportItem.query.filter_by(report_id=report_id)
    # data = query_to_list_json(query)
    # print '-------- add data return value end ----------'
    # print data
    # return json.dumps(data)



@report.route("/item/order/<int:report_id>/<int:item_id>/<int:order>", methods=['GET','POST','OPTIONS'])
@crossdomain(origin=server.app.config['CROSSDOMAIN_ORIGIN'], credentials=True, headers='Authorization')
@auth.login_required
def save_order_report_item(report_id, item_id, order):
    # userid = g.user.opid
    print '----- delete_report_item ------'
    instance = ReportItem.get_or_404(item_id)
    # form = ReportItemForm(csrf_enabled=False)
    print str(instance)
    form = {}
    if instance:
        # form['report_id'] = report_id
        form['id'] = item_id
        form['ordr'] = order
        instance.update(**form)
        return jsonify({'status':'200'})
    return jsonify({'status':'500'})
    # query = ReportItem.query.filter_by(report_id=report_id)
    # data = query_to_list_json(query)
    # print '-------- add data return value end ----------'
    # print data
    # return json.dumps(data)

