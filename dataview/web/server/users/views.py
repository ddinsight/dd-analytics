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


from flask import abort, Blueprint, flash, redirect, render_template, request, url_for, g
from flask.ext.login import login_required, login_user, logout_user,current_user
from flask import jsonify
from flask.ext.httpauth import HTTPBasicAuth
from flask.ext.login import AnonymousUserMixin, LoginManager

from .models import User
from server.util import *
import server

users = Blueprint("users", __name__, template_folder='templates')
auth = HTTPBasicAuth()
EXPIRES_IN_TWO_HOURS = 7200

@users.route("/login/", methods=["GET","POST"])
@crossdomain(origin=server.app.config['CROSSDOMAIN_ORIGIN'], credentials=True, headers='Authorization')
@jsonp
def login():
    email = request.json.get('email')
    password = request.json.get('password')
    user = User.query.filter_by(opid = email).first()
    if user.verify_password(password):
        login_user(user)
    return jsonify({'username':user.opnm}), 201, {'Location':url_for('get_user', opid = user.opid, _external=True)}


@auth.verify_password
def verfiy_password(email_or_token, password):
    user = User.verify_auth_token(email_or_token)
    if not user:
        user = User.query.filter_by(email = email_or_token).first()
        if not user or not user.verify_password(password):
            return False
    g.user = user
    login_user(user)
    return True

@users.route("/register", methods=['POST','GET','OPTIONS'])
@crossdomain(origin=server.app.config['CROSSDOMAIN_ORIGIN'], credentials=True, headers='Authorization')
# @jsonp
def register():
    username = request.form['username']
    password = request.form['password']
    email = request.form['email']
    print username + ':' + password  + ':' + email
    if username is None or password is None or email is None:
        abort(400)
    if User.query.filter_by(opid = email).first() is not None:
        abort(400)

    user = User.create(**dict(zip(('opid','opnm','email','password'),(email, username, email, password))))

    return jsonify({'email':user.email, 'username':user.opnm})

@users.route('/email/<string:opid>', methods=['GET','POST'])
@jsonp
def get_user(opid):
    user = User.query.filter_by(opid=opid).first()
    if not user:
        abort(400)
    print user
    return jsonify({ 'username': user.opnm })

@users.route('/token', methods=['GET','POST','OPTIONS'])
@crossdomain(origin=server.app.config['CROSSDOMAIN_ORIGIN'], credentials=True, headers='Authorization')
@auth.login_required
def get_auth_token():
    token = g.user.generate_auth_token(EXPIRES_IN_TWO_HOURS)
    return jsonify({ 'token': token.decode('ascii'), 'duration': EXPIRES_IN_TWO_HOURS })


@users.route('/test/resource')
@crossdomain(origin=server.app.config['CROSSDOMAIN_ORIGIN'], credentials=True, headers='Authorization')
@auth.login_required
def get_resource():
    print g.user
    return jsonify({'data':'Hello, %s' % g.user.opid})


# @users.route('/chartviewer/resource')
# @jsonp
# @auth.login_required
# def dataset():
# 	print g.user
# 	userid = g.user.opid
# 	selection = listDataSet() # after add userid parameter 
# 	return json.dumps(selection)

