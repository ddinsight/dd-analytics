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


from flask import  Blueprint,g
from server.chartmaker.models import __list_menus, __list_viewtmpl, __list_dsselect, __add_dsviewtmpl, __list_menus_for_admin,__list_menu_users, __add_wavemenu_admin, __test_connection_execute, _available_columns,_test_dsselect_conntection, _get_tablename_from_sqlid, __list_dsquery_users, __add_dsquery_admin, __list_viewtmpl_sample, __list_dsquery,__get_values_from_sqlid, __update__whvalue,__list_dswhcolumn
from server.dataviewer.models import _get_table_infomation,_get_columns_infomation, _get_table_and_columns_infomation
from server.chartmaker.forms import *
from server.util import *
from server.users.views import auth
import simplejson as json
import server

chartmaker = Blueprint("chartmaker", __name__)

invalid_escape = re.compile(r'\\[0-7]{1,3}')
def replace_with_byte(match):
    return chr(int(match.group(0)[1:], 8))

def repair(brokenjson):
    return invalid_escape.sub(replace_with_byte, brokenjson)

################################################################################################################
# about query rest url
################################################################################################################

@chartmaker.route("/query/users/list/<int:sqlid>", methods=['GET','POST','OPTIONS'])
@crossdomain(origin=server.app.config['CROSSDOMAIN_ORIGIN'], credentials=True, headers='Authorization')
@auth.login_required
def list_dsquery_user_for_admin(sqlid):
    userid = g.user.opid
    myorgprefix = g.user.orgprefix
    data = __list_dsquery_users(sqlid)
    # print data
    ndata = []
    for d in data:
        print d
        uu = myorgprefix.split(',')
        uuwhether = False
        for u in uu:
            if u in d['orgprefix']:
                uuwhether = True
        if uuwhether:
            ndata.append(d)

    return json.dumps(ndata)


@chartmaker.route("/query/viewtmpl/sample", methods=['GET','POST','OPTIONS']) # remove 'ds'
@crossdomain(origin=server.app.config['CROSSDOMAIN_ORIGIN'], credentials=True, headers='Authorization')
@auth.login_required
def list_viewtmpl_sample():
    userid = g.user.opid
    data = __list_viewtmpl_sample()
    return json.dumps(data)


@chartmaker.route("/query/list", methods=['GET','POST','OPTIONS']) # remove 'ds'
@crossdomain(origin=server.app.config['CROSSDOMAIN_ORIGIN'], credentials=True, headers='Authorization')
@auth.login_required
def list_dsquery():
    userid = g.user.id
    # query = DsQuery.query.filter(DsQuery.sqlid == DsQueryAdmin.sqlid).filter(DsQueryAdmin.adminid==g.user.id)
    # data = query_to_list_json(query)
    data = __list_dsquery(userid)
    return json.dumps(data)

@chartmaker.route("/query/view/<int:sqlid>", methods=['GET','POST','OPTIONS']) # remove 'ds'
@crossdomain(origin=server.app.config['CROSSDOMAIN_ORIGIN'], credentials=True, headers='Authorization')
@auth.login_required
def view_dsquery(sqlid):
    userid = g.user.opid
    query = DsQuery.query.filter(DsQuery.sqlid == sqlid)
    data = query_to_list_json(query)
    return json.dumps(data)

@chartmaker.route("/query/add", methods=['GET','POST','OPTIONS']) # remove 'ds'
@crossdomain(origin=server.app.config['CROSSDOMAIN_ORIGIN'], credentials=True, headers='Authorization')
@auth.login_required
def add_dsquery():
    print 'add_dsquery called '
    print 'request.form in all is '  + str(request.form)
    # print 'request.form.get in sqlid is '  + str(request.form.get('sqlid',None))
    form = DsQueryForm(csrf_enabled=False)
    if request.method == 'POST' and form.validate():
        print 'form.data[sqlid] is ' + str(form.data)
        instance = DsQuery.create(**form.data)
        if request.form['users']:
            __add_dsquery_admin(instance.sqlid, request.form['users'])
    print form.errors    
    query = DsQuery.query.filter(DsQuery.sqlid == DsQueryAdmin.sqlid).filter(DsQueryAdmin.adminid==g.user.id)
    data = query_to_list_json(query)
    return json.dumps(data)
    # query = DsQuery.query.order_by(DsQuery.sqlid.desc()).limit(1)
    # data = query_to_list_json(query)
    # print data
    # print '-------- add data return value end ----------'
    # return json.dumps(data)

@chartmaker.route("/query/edit", methods=['GET','POST','OPTIONS'])
@crossdomain(origin=server.app.config['CROSSDOMAIN_ORIGIN'], credentials=True, headers='Authorization')
@auth.login_required
def edit_query():
    print 'edit_query called '
    print 'request.form in all is '  + str(request.form)
    print 'request.form.get in sqlid is '  + str(request.form.get('sqlid',None))
    form = DsQueryForm(csrf_enabled=False)
    dsquery = DsQuery.get_or_404(form.data['sqlid'])
    if dsquery:
        dsquery = dsquery.update(**form.data)
        if request.form.get('users', None) is not None:
            __add_dsquery_admin(form.data['sqlid'], request.form['users'])
    query = DsQuery.query.filter(DsQuery.sqlid == DsQueryAdmin.sqlid).filter(DsQueryAdmin.adminid==g.user.id)
    data = query_to_list_json(query)
    return json.dumps(data)

@chartmaker.route("/query/delete", methods=['GET','POST','OPTIONS'])
@crossdomain(origin=server.app.config['CROSSDOMAIN_ORIGIN'], credentials=True, headers='Authorization')
@auth.login_required
def delete_query():
    print '----- delete_query ------'
    form = DsQueryForm(csrf_enabled=False)
    print 'form.data[sqlid]:' + str(form.data['sqlid'])
    dsquery = DsQuery.get_or_404(form.data['sqlid'])
    print str(dsquery)
    if dsquery:
        dsquery.delete()

    query = DsQuery.query.filter(DsQuery.sqlid == DsQueryAdmin.sqlid).filter(DsQueryAdmin.adminid==g.user.id)
    data = query_to_list_json(query)
    return json.dumps(data)    
        # return jsonify({'result':'success', 'sqlid':form.data['sqlid']})

    # return jsonify({'result':'error', 'sqlid':sqlid})

@chartmaker.route("/query/test", methods=['GET','POST','OPTIONS'])
@crossdomain(origin=server.app.config['CROSSDOMAIN_ORIGIN'], credentials=True, headers='Authorization')
@auth.login_required
def test_query():
    print '----- test_query ------'
    form = DsQueryForm(csrf_enabled=False)
    return __test_connection_execute(form.data['sqlstmt'])


################################################################################################################
# about menu rest url
################################################################################################################

@chartmaker.route("/menu/list", methods=['GET','POST','OPTIONS']) # remove 'ds'
@crossdomain(origin=server.app.config['CROSSDOMAIN_ORIGIN'], credentials=True, headers='Authorization')
@auth.login_required
def list_menus():
    userid = g.user.opid
    data = __list_menus(userid)
    return json.dumps(data, use_decimal=True)


################################################################################################################
# about select rest url
################################################################################################################
@chartmaker.route("/select/list/<int:sqlid>", methods=['GET','POST','OPTIONS']) # remove 'ds'
@crossdomain(origin=server.app.config['CROSSDOMAIN_ORIGIN'], credentials=True, headers='Authorization')
@auth.login_required
def list_dsselect(sqlid):
    userid = g.user.opid
    data = __list_dsselect(sqlid, 0)
    return json.dumps(data)

@chartmaker.route("/select/view/<int:sqlid>", methods=['GET','POST','OPTIONS']) # remove 'ds'
@crossdomain(origin=server.app.config['CROSSDOMAIN_ORIGIN'], credentials=True, headers='Authorization')
@auth.login_required
def view_dsselect(sqlid):
    userid = g.user.opid
    form = DsSelectForm(csrf_enabled=False)    
    query = DsSelect.query.filter(DsSelect.sqlid == sqlid).filter(DsSelect.selid == form.data['selid'])
    data = query_to_list_json(query)
    return json.dumps(data)



@chartmaker.route("/select/add/<int:sqlid>", methods=['GET','POST','OPTIONS']) # remove 'ds'
@crossdomain(origin=server.app.config['CROSSDOMAIN_ORIGIN'], credentials=True, headers='Authorization')
@auth.login_required
def add_dsselect(sqlid):
    print 'add_dsquery called '
    print 'request.form in all is '  + str(request.form)
    # print 'request.form.get in sqlid is '  + str(request.form.get('sqlid',None))
    form = DsSelectForm(csrf_enabled=False)
    if request.method == 'POST' and form.validate():
        form.data['sqlid'] = sqlid
        print 'form.data is ' + str(form.data)
        dsselect = DsSelect.create(**form.data)
        if request.form['templates']:
            __add_dsviewtmpl(sqlid, dsselect.selid, request.form['templates'])
            
    print form.errors    
    # query = DsSelect.query.filter(DsSelect).filter().filter().order_by(DsSelect.selid.desc()).limit(1)
    data = __list_dsselect(sqlid, 0)
    print data
    print '-------- add data return value end ----------'
    return json.dumps(data)

@chartmaker.route("/select/edit/<int:sqlid>", methods=['GET','POST','OPTIONS'])
@crossdomain(origin=server.app.config['CROSSDOMAIN_ORIGIN'], credentials=True, headers='Authorization')
@auth.login_required
def edit_dsselect(sqlid):
    print 'edit_select called '
    print 'request.form in all is '  + str(request.form)

    form = DsSelectForm(csrf_enabled=False)
    print 'form.data[sqlid] is ' + str(form.data)

    dsselect = DsSelect.get_or_404(form.data['selid'])
    # print dsselect
    if request.method == 'POST' and form.validate():
        form.data['sqlid'] = sqlid
        print '>>>>>>form.data is ' + str(form.data)
        dsselect.update(**form.data)
        print 'request.form[templates] is ' + str(request.form['templates'])
        if request.form['templates']:
            __add_dsviewtmpl(sqlid, form.data['selid'], request.form['templates'])
    print form.errors    

    # query = DsSelect.query.filter(DsSelect.sqlid == sqlid).filter(DsSelect.selid==form.data['selid'])
    # data = query_to_list_json(query)
    data = __list_dsselect(sqlid, 0)
    return json.dumps(data)

@chartmaker.route("/select/delete/<int:sqlid>", methods=['GET','POST','OPTIONS'])
@crossdomain(origin=server.app.config['CROSSDOMAIN_ORIGIN'], credentials=True, headers='Authorization')
@auth.login_required
def delete_dsselect(sqlid):
    print '----- delete_select ------'
    form = DsSelectForm(csrf_enabled=False)
    print 'form.data[sqlid]:' + str(form.data['selid'])
    dsselect = DsSelect.get_or_404(form.data['selid'])
    print str(dsselect)
    if dsselect:
        dsselect.delete()
        # return jsonify({'result':'success', 'selid':form.data['selid']})

    data = __list_dsselect(sqlid, 0)
    return json.dumps(data)


@chartmaker.route("/select/template/list/<int:sqlid>/<int:selid>", methods=['GET','POST','OPTIONS']) # remove 'ds'
@crossdomain(origin=server.app.config['CROSSDOMAIN_ORIGIN'], credentials=True, headers='Authorization')
@auth.login_required
def list_dsselect_template(sqlid,selid):
    userid = g.user.opid
    data = __list_viewtmpl(sqlid, selid)
    return json.dumps(data)

@chartmaker.route("/select/available/columns/<int:sqlid>", methods=['GET','POST','OPTIONS']) # remove 'ds'
@crossdomain(origin=server.app.config['CROSSDOMAIN_ORIGIN'], credentials=True, headers='Authorization')
@auth.login_required
def list_dsselect_available_columns(sqlid):
    userid = g.user.opid
    data = _available_columns(sqlid)
    # print data
    return json.dumps(data)

@chartmaker.route("/select/test/<int:sqlid>", methods=['GET','POST','OPTIONS'])
@crossdomain(origin=server.app.config['CROSSDOMAIN_ORIGIN'], credentials=True, headers='Authorization')
@auth.login_required
def test_dsselect(sqlid):
    print '----- test_dsselect ------'
    form = DsSelectForm(csrf_enabled=False)
    return _test_dsselect_conntection(sqlid, form.data['selcols'], form.data['grpbystmt'], form.data['havingstmt'], form.data['orderbystmt'])

################################################################################################################
# about where rest url
################################################################################################################
@chartmaker.route("/where/column/list/<int:sqlid>", methods=['GET','POST','OPTIONS']) # remove 'ds'
@crossdomain(origin=server.app.config['CROSSDOMAIN_ORIGIN'], credentials=True, headers='Authorization')
@auth.login_required
def list_dswhcolumn(sqlid):
    print '--------------------'
    userid = g.user.opid
    print str(DsWhColumn)
    # query = DsWhColumn.query.filter(DsWhColumn.sqlid == sqlid)
    # data = query_to_list_json(query)
    # return json.dumps(data)
    data = __list_dswhcolumn(sqlid)
    return json.dumps(data);

@chartmaker.route("/where/column/view/<int:sqlid>", methods=['GET','POST','OPTIONS']) # remove 'ds'
@crossdomain(origin=server.app.config['CROSSDOMAIN_ORIGIN'], credentials=True, headers='Authorization')
@auth.login_required
def view_dswhcolumn(sqlid):
    userid = g.user.opid
    form = DsWhColumnForm(csrf_enabled=False)
    # query = DsWhColumn.query.filter(DsWhColumn.sqlid == sqlid).filter(DsWhColumn.whid == form.data['whid'])
    # data = query_to_list_json(query)
    # return json.dumps(data)
    data = __view_dswhcolumn(sqlid, form.data['whid'])
    return json.dumps(data);

@chartmaker.route("/where/column/add/<int:sqlid>", methods=['GET','POST','OPTIONS']) # remove 'ds'
@crossdomain(origin=server.app.config['CROSSDOMAIN_ORIGIN'], credentials=True, headers='Authorization')
@auth.login_required
def add_dswhcolumn(sqlid):
    print 'add_dswhcolumn called '
    print 'request.form in all is '  + str(request.form)
    form = DsWhColumnForm(csrf_enabled=False)
    if request.method == 'POST' and form.validate():
        dswhcolumn = DsWhColumn.create(**form.data)
    whid = dswhcolumn.whid
    # valliststr = request.form['vallist']
    # val_list = json.loads(valliststr)
    # __update__whvalue(sqlid, dswhcolumn.whid, val_list)

    nfilter = DsWhColumn.query.filter(DsWhColumn.sqlid==sqlid).filter(DsWhColumn.whid==whid).first()

    editedItem = {}
    editedItem['whid'] = nfilter.whid
    editedItem['colnm'] = nfilter.colnm
    editedItem['colstr'] = nfilter.colstr
    editedItem['operand'] = nfilter.operand
    editedItem['filtertype'] = nfilter.filtertype
    # editedItem['data'] = query_to_list_json(DsWhValue.query.filter(DsWhValue.sqlid==sqlid).filter(DsWhValue.whid==whid))
    print editedItem
    return json.dumps(editedItem)

@chartmaker.route("/where/column/edit/<int:sqlid>", methods=['GET','POST','OPTIONS'])
@crossdomain(origin=server.app.config['CROSSDOMAIN_ORIGIN'], credentials=True, headers='Authorization')
@auth.login_required
def edit_dswhcolumn(sqlid):
    print 'edit_dswhcolumn called '
    print 'request.form in all is '  + str(request.form)
    # print request.form['vallist']
    form = DsWhColumnForm(csrf_enabled=False)
    print form
    whid = int(form.data['whid'])
    # val_list = json.loads(str(request.form['vallist']))
    print str(whid)
    dswhcolumn = DsWhColumn.get_or_404(whid)
    print dswhcolumn
    # __update__whvalue(sqlid, whid, val_list)

    if request.method == 'POST' and form.validate():
        form.data['sqlid'] = sqlid
        a = dswhcolumn.update(**form.data)

    print form.errors
    nfilter = DsWhColumn.query.filter(DsWhColumn.sqlid==sqlid).filter(DsWhColumn.whid==whid).first()
    print nfilter
    editedItem = {}
    editedItem['whid'] = nfilter.whid
    editedItem['colnm'] = nfilter.colnm
    editedItem['colstr'] = nfilter.colstr
    editedItem['operand'] = nfilter.operand
    editedItem['filtertype'] = nfilter.filtertype
    editedItem['data'] = query_to_list_json(DsWhValue.query.filter(DsWhValue.sqlid==sqlid).filter(DsWhValue.whid==whid))
    print editedItem
    return json.dumps(editedItem)


@chartmaker.route("/where/column/delete/<int:sqlid>", methods=['GET','POST','OPTIONS'])
@crossdomain(origin=server.app.config['CROSSDOMAIN_ORIGIN'], credentials=True, headers='Authorization')
@auth.login_required
def delete_dswhcolumn(sqlid):
    print '----- delete_dswhcolumn ------'
    form = DsWhColumnForm(csrf_enabled=False)
    print 'form sqlid and whid is %s and %s'%(str(sqlid) , str(form.data['whid']) )

    # value of filter delete
    values = DsWhValue.query.filter(DsWhValue.sqlid==sqlid).filter(DsWhValue.whid==form.data['whid'])
    for value in values:
        value.delete();

    # column(filter) delete
    dswhcolumn = DsWhColumn.get_or_404(form.data['whid'])
    print str(dswhcolumn)

    if dswhcolumn:
        dswhcolumn.delete()


    query = DsWhColumn.query.filter(DsWhColumn.sqlid==sqlid)
    data = query_to_list_json(query)
    return json.dumps(data)

@chartmaker.route("/where/column/available/columns/<int:sqlid>", methods=['GET','POST','OPTIONS']) # remove 'ds'
@crossdomain(origin=server.app.config['CROSSDOMAIN_ORIGIN'], credentials=True, headers='Authorization')
@auth.login_required
def list_dswhcolumn_available_columns(sqlid):
    userid = g.user.opid
    data = _get_tablename_from_sqlid(sqlid)
    return json.dumps(data)

@chartmaker.route("/where/column/available/values/<int:sqlid>/<whid>", methods=['GET','POST','OPTIONS']) # remove 'ds'
@chartmaker.route("/where/column/available/values/<int:sqlid>/", defaults={'whid':None}, methods=['GET','POST','OPTIONS']) # remove 'ds'
@crossdomain(origin=server.app.config['CROSSDOMAIN_ORIGIN'], credentials=True, headers='Authorization')
@auth.login_required
def available_valuelist_from_sqlid(sqlid, whid):
    # print '/where/column/available/values/11/11 list_valuelist_from_sqlid begin ... '
    # print str(sqlid) + ' () ' + str(whid) + ' () '
    # print str(request)
    data = __get_values_from_sqlid(sqlid,  whid, request.form['colstr'])
    # print '__get_values_from_sqlid in list_valuelist_from_sqlid result will be shown ==> '
    # print data
    return json.dumps(data)

@chartmaker.route("/where/column/customizable/values/<int:sqlid>/<int:whid>", methods=['GET','POST','OPTIONS']) # remove 'ds'
@crossdomain(origin=server.app.config['CROSSDOMAIN_ORIGIN'], credentials=True, headers='Authorization')
@auth.login_required
def get_regex_value_from_sqlid(sqlid, whid):
    userid = g.user.opid
    data = DsWhValue.query.filter(DsWhValue.sqlid==sqlid).filter(DsWhValue.whid==whid).first()
    print str({'valstr':data.valstr, 'valid':data.valid})
    return json.dumps({'valstr':data.valstr, 'valid':data.valid})

################################################################################################################
# about whvalue rest url
################################################################################################################
@chartmaker.route("/where/value/list/<int:sqlid>/<int:whid>", methods=['GET','POST','OPTIONS']) # remove 'ds'
@crossdomain(origin=server.app.config['CROSSDOMAIN_ORIGIN'], credentials=True, headers='Authorization')
@auth.login_required
def list_dswhvalue(sqlid,whid):
    userid = g.user.opid
    form = DsWhValueForm(csrf_enabled=False)    
    query = DsWhValue.query.filter(DsWhValue.sqlid == sqlid).filter(DsWhValue.whid == whid)
    data = query_to_list_json(query)
    return json.dumps(data)

@chartmaker.route("/where/value/view/<int:sqlid>/<int:whid>", methods=['GET','POST','OPTIONS']) # remove 'ds'
@crossdomain(origin=server.app.config['CROSSDOMAIN_ORIGIN'], credentials=True, headers='Authorization')
@auth.login_required
def view_dswhvalue(sqlid,whid):
    userid = g.user.opid
    form = DsWhValueForm(csrf_enabled=False)    
    query = DsWhValue.query.filter(DsWhValue.sqlid == sqlid).filter(DsWhValue.whid == whid)
    data = query_to_list_json(query)
    return json.dumps(data)

@chartmaker.route("/where/value/add/<int:sqlid>/<int:whid>", methods=['GET','POST','OPTIONS']) # remove 'ds'
@crossdomain(origin=server.app.config['CROSSDOMAIN_ORIGIN'], credentials=True, headers='Authorization')
@auth.login_required
def add_dswhvalue(sqlid,whid):
    print 'add_dswhvalue called '
    print 'request.form in all is '  + str(request.form)
    # print 'request.form.get in sqlid is '  + str(request.form.get('sqlid',None))
    form = DsWhValueForm(csrf_enabled=False)
    if request.method == 'POST' and form.validate():
        print 'form.data is ' + str(form.data)
        dswhvalue = DsWhValue.create(**form.data)

    print form.errors    
    # query = DsWhValue.query.filter(DsWhValue.valid==dswhvalue.valid).order_by(DsWhValue.valid.desc()).limit(1)
    # data = query_to_list_json(query)
    # print data
    # print '-------- add data return value end ----------'
    # return json.dumps(data)
    query = DsWhValue.query.filter(DsWhValue.sqlid == sqlid).filter(DsWhValue.whid == whid)
    data = query_to_list_json(query)
    return json.dumps(data)

@chartmaker.route("/where/value/edit/<int:sqlid>/<int:whid>", methods=['GET','POST','OPTIONS'])
@crossdomain(origin=server.app.config['CROSSDOMAIN_ORIGIN'], credentials=True, headers='Authorization')
@auth.login_required
def edit_dswhvalue(sqlid,whid):
    print 'edit_dswhvalue called '
    print 'request.form in all is '  + str(request.form)

    form = DsWhValueForm(csrf_enabled=False)
    print 'form.data[sqlid] is ' + str(form.data)

    dswhvalue = DsWhValue.get_or_404(form.data['valid'])

    if request.method == 'POST' and form.validate():
        form.data['sqlid'] = sqlid
        print '>>>>>>form.data is ' + str(form.data)
        dswhvalue.update(**form.data)
    print form.errors    

    # query = DsWhValue.query.filter(DsWhValue.valid==form.data['valid'])
    # data = query_to_list_json(query)
    # return json.dumps(data)
    query = DsWhValue.query.filter(DsWhValue.sqlid == sqlid).filter(DsWhValue.whid == whid)
    data = query_to_list_json(query)
    return json.dumps(data)

@chartmaker.route("/where/value/delete/<int:sqlid>/<int:whid>", methods=['GET','POST','OPTIONS'])
@crossdomain(origin=server.app.config['CROSSDOMAIN_ORIGIN'], credentials=True, headers='Authorization')
@auth.login_required
def delete_dswhvalue(sqlid,whid):
    print '----- delete_dswhvalue ------'
    # form = DsWhValueForm(csrf_enabled=False)
    valids = str(request.form['valid'])
    print 'form sqlid and whid and valid is %s and %s and %s'%(str(sqlid) , str(whid), valids )
    if ',' not in valids:
        dswhvalue = DsWhValue.get_or_404(valids)
        print str(dswhvalue)
        if dswhvalue:
            dswhvalue.delete()
    else:
        for valid in valids.split(','):
            dswhvalue = DsWhValue.get_or_404(valid)
            print str(dswhvalue)
            if dswhvalue:
                dswhvalue.delete()

    query = DsWhValue.query.filter(DsWhValue.sqlid == sqlid).filter(DsWhValue.whid == whid)
    data = query_to_list_json(query)
    return json.dumps(data)


################################################################################################################
# about menu management url
################################################################################################################
@chartmaker.route("/menu/config/list/<int:sqlid>/<string:m_type>", methods=['GET','POST','OPTIONS'])
@crossdomain(origin=server.app.config['CROSSDOMAIN_ORIGIN'], credentials=True, headers='Authorization')
@auth.login_required
def list_menus_for_admin(sqlid,m_type):
    userid = g.user.opid
    data = __list_menus_for_admin(sqlid, userid, m_type)
    return json.dumps(data)

@chartmaker.route("/menu/config/add/<int:sqlid>/<string:m_type>", methods=['GET','POST','OPTIONS']) # remove 'ds'
@crossdomain(origin=server.app.config['CROSSDOMAIN_ORIGIN'], credentials=True, headers='Authorization')
@auth.login_required
def add_menus_for_admin(sqlid,m_type):
    userid = g.user.opid
    print 'add_menus_for_admin called '
    print 'request.form in all is '  + str(request.form)
    # print 'request.form.get in sqlid is '  + str(request.form.get('sqlid',None))
    form = WaveMenuForm(csrf_enabled=False)
    if request.method == 'POST' and form.validate():
        print 'form.data is ' + str(form.data)
        wavemenu = WaveMenu.create(**form.data)
        if request.form['users']:
            __add_wavemenu_admin(wavemenu.menuid, request.form['users'])
    print form.errors    
    data = __list_menus_for_admin(sqlid, userid, m_type)
    return json.dumps(data)

@chartmaker.route("/menu/config/edit/<int:sqlid>/<string:m_type>", methods=['GET','POST','OPTIONS'])
@crossdomain(origin=server.app.config['CROSSDOMAIN_ORIGIN'], credentials=True, headers='Authorization')
@auth.login_required
def edit_menus_for_admin(sqlid,m_type):
    userid = g.user.opid
    print 'edit_menus_for_admin called '
    print 'request.form in all is '  + str(request.form)

    form = WaveMenuForm(csrf_enabled=False)
    print 'form.data[sqlid] is ' + str(form.data)

    wavemenu = WaveMenu.get_or_404(form.data['menuid'])

    if request.method == 'POST' and form.validate():
        form.data['sqlid'] = sqlid
        print '>>>>>>form.data is ' + str(form.data)
        wavemenu.update(**form.data)
        if request.form['users']:
            __add_wavemenu_admin(form.data['menuid'], request.form['users'])
    print form.errors    

    data = __list_menus_for_admin(sqlid, userid, m_type)
    return json.dumps(data)

@chartmaker.route("/menu/config/delete/<int:sqlid>/<string:m_type>", methods=['GET','POST','OPTIONS'])
@crossdomain(origin=server.app.config['CROSSDOMAIN_ORIGIN'], credentials=True, headers='Authorization')
@auth.login_required
def delete_menus_for_admin(sqlid,m_type):
    userid = g.user.opid
    print '----- delete_menus_for_admin ------'
    form = WaveMenuForm(csrf_enabled=False)
    print 'form sqlid and menuid is %s and %s '%(str(sqlid), str(form.data['menuid']) )
    wavemenu = WaveMenu.get_or_404(form.data['menuid'])
    print str(wavemenu)

    if wavemenu:
        wavemenu.delete()
    data = __list_menus_for_admin(sqlid, userid, m_type)
    return json.dumps(data)


################################################################################################################
# table information related about statistics 
################################################################################################################
@chartmaker.route("/info/table", methods=['GET','POST','OPTIONS'])
@crossdomain(origin=server.app.config['CROSSDOMAIN_ORIGIN'], credentials=True, headers='Authorization')
@auth.login_required
def list_table_information():
    userid = g.user.opid
    data = _get_table_infomation()
    return json.dumps(data)

@chartmaker.route("/info/columns/<string:table_name>", methods=['GET','POST','OPTIONS'])
@crossdomain(origin=server.app.config['CROSSDOMAIN_ORIGIN'], credentials=True, headers='Authorization')
@auth.login_required
def list_columns_information(table_name):
    userid = g.user.opid
    data = _get_columns_infomation(table_name)
    return json.dumps(data)

@chartmaker.route("/info/table/columns", methods=['GET','POST','OPTIONS'])
@crossdomain(origin=server.app.config['CROSSDOMAIN_ORIGIN'], credentials=True, headers='Authorization')
@auth.login_required
def list_table_and_column_information():
    userid = g.user.opid
    print '---- start /info/table/columns ---- '
    data = _get_table_and_columns_infomation(g.user.id)
    print '---------- /info/table/columns --------'
    print data
    return json.dumps(data)

################################################################################################################
# about menu and user management url
################################################################################################################
@chartmaker.route("/menu/config/users/list/<int:menuid>", methods=['GET','POST','OPTIONS'])
@crossdomain(origin=server.app.config['CROSSDOMAIN_ORIGIN'], credentials=True, headers='Authorization')
@auth.login_required
def list_menu_user_for_admin(menuid):
    userid = g.user.opid
    data = __list_menu_users(menuid)
    return json.dumps(data)


