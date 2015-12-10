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


import server
import os
from flask.ext.login import UserMixin
from sqlalchemy.ext.hybrid import hybrid_property
from passlib.apps import custom_app_context as pwd_context
from server.data import CRUDMixin, db
from itsdangerous import TimedJSONWebSignatureSerializer as Serializer, BadSignature, SignatureExpired

class User(UserMixin, CRUDMixin, db.Model):
    __tablename__ = 'admin'
    # __table_args__ = {'schema': 'test'}

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    opid = db.Column(db.String)
    opnm = db.Column(db.String)
    pwd  = db.Column(db.String)
    email = db.Column(db.String)
    orgprefix = db.Column(db.String)
    crtdt = db.Column(db.Integer)
    crtid = db.Column(db.String)

    EXPIRES_IN_TWO_HOURS = 7200

    @hybrid_property
    def password(self):
        return self.pwd

    @password.setter
    def password(self, password):
        self.pwd = pwd_context.encrypt(password)

    def verify_password(self, password):
        print password, self.pwd
        if password is not None and self.pwd is not None and len(password) > 0 and len(self.pwd) > 0:
            print 'verify_password ===> ' + str(pwd_context.verify(password, self.pwd))
            return pwd_context.verify(password, self.pwd)

    def generate_auth_token(self, expiration = EXPIRES_IN_TWO_HOURS):
        s = Serializer(server.app.config['SECRET_KEY'], expires_in = expiration)
        return s.dumps({'id':self.id})

    @staticmethod
    def verify_auth_token(token):
        print server.app.config['SECRET_KEY']
        s = Serializer(server.app.config['SECRET_KEY'])
        try:
            print token
            data = s.loads(token)
            print str(data)
        except SignatureExpired:
            return None
        except BadSignature:
            return None
        user = User.query.filter_by(id=data['id']).first()
        return user

    def __repr__(self):
        return "<User #{0} {1} ".format(self.id, self.opid)


class WaveMenuAdmin(CRUDMixin, db.Model):
    __tablename__ = 'wavemenu_admin'

    menuid = db.Column(db.Integer, primary_key=True)
    adminid = db.Column(db.Integer, primary_key=True)
    crtdt = db.Column(db.Integer)
    crtid = db.Column(db.Integer)

    def __repr__(self):
        return '<WaveMenu {0} {1}>'.format(self.menuid, self.adminid)




