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


#!/usr/bin/env python
from server import app, db

if __name__ == "__main__":
    # print app
    # print app.config['SQLALCHEMY_DATABASE_URI']
    app.debug = True
    db.create_all(app=app)
    app.run(host='0.0.0.0',port=5002, debug=True)

# if __name__ == "__main__":
# 	from cherrypy import wsgiserver
#
# 	db.create_all(app=app)
# 	# app.run(host='0.0.0.0',port=5000, debug=True)
# 	d = wsgiserver.WSGIPathInfoDispatcher({'/': app})
# 	server = wsgiserver.CherryPyWSGIServer(('0.0.0.0', 5001), d)
# 	try:
# 		server.start()
# 	except KeyboardInterrupt:
# 		server.stop()
