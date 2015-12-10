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


from os.path import abspath, dirname, join
import socket

class BaseConfiguration(object):
    DEBUG = False
    TESTING = False
    CROSSDOMAIN_ORIGIN = 'http://'+socket.getfqdn()+':5002'
    ADMINS = frozenset(['if@you.need'])
    SECRET_KEY = 'your-scret-key'
    SQLALCHEMY_DATABASE_URI = 'mysql://USERNAME:PASSWORD@SERVER/DATABASE'
    SQLALCHEMY_ECHO = True

class TestConfiguration(BaseConfiguration):
    DEBUG = True
    TESTING = True
    CSRF_ENABLED = True
    SQLALCHEMY_ECHO = True
