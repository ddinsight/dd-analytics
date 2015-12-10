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


from flask import Flask, render_template,redirect,request, url_for
from .auth import login_manager
from .data import db
from werkzeug.routing import BaseConverter

class RegexConverter(BaseConverter):
    def __init__(self, url_map, *items):
        super(RegexConverter, self).__init__(url_map)
        self.regex = items[0]


app = Flask(__name__, static_folder='../static', template_folder='../static')
app.config.from_object('config.TestConfiguration')
app.url_map.converters['regex'] = RegexConverter
# # @app.route('/<regex("[abcABC0-9]{4,6}"):uid>/', methods=["GET","POST"])
# @app.route('/<regex("chartviewer\/(.*)"):uid>')
# def default(uid):
#     print 'uid is  %s' % (uid)
#     # return redirect(url_for('root'))
#     return render_template('index.html', prevlocation='/')



@app.route('/', methods=["GET","POST"])
def root():
    return render_template('index.html', prevlocation='/')


db.init_app(app)
db.create_all(app=app)
login_manager.init_app(app)


from .users.views import users
from .chartviewer.views import chartviewer
from .chartmaker.views import chartmaker
from .dashboard.views import dashboard
from .report.views import report
from .dataviewer.views import dataviewer
from .mapviewer.views import mapviewer
from .tools.views import tools
from .api.views import api

app.register_blueprint(users, url_prefix='/api/v1.0/users')
app.register_blueprint(chartviewer, url_prefix='/api/v1.0/chartviewer')
app.register_blueprint(chartmaker, url_prefix='/api/v1.0/chartmaker')
app.register_blueprint(dashboard, url_prefix='/api/v1.0/dashboard')
app.register_blueprint(report, url_prefix='/api/v1.0/report')
app.register_blueprint(dataviewer, url_prefix='/api/v1.0/dataviewer')
app.register_blueprint(mapviewer, url_prefix='/api/v1.0/mapviewer')
app.register_blueprint(tools, url_prefix='/api/v1.0/tools')
app.register_blueprint(api, url_prefix='/api/v1.0/api')

@app.before_request
def log_entry():
  context = {
      'url': request.path,
      'method': request.method,
      'ip': request.environ.get("REMOTE_ADDR")
  }
  app.logger.debug("Handling %(method)s request from %(ip)s for %(url)s", context)
