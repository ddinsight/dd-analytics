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


from flask.ext.login import AnonymousUserMixin, LoginManager

from users.models import User


login_manager = LoginManager()

class AnonymousUser(AnonymousUserMixin):
    id = None

login_manager.anonymous_user = AnonymousUser
login_manager.login_view = "users.login"

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(user_id)

# from api.models import Dspkg, Dsavailkey
#
# @login_manager.request_loader
# def load_user_from_request(request):
#     userid = request.args.get('userid')
#     if userid:
#         user = User.query.get(user_id).first()
#         if user:
#             return user
#
#     api_key = request.args.get('api_key')
#     if api_key:
#         pkgkey = Dsavailkey.query.filter_by(api_key==api_key).first()
#         if pkgkey:
#             return pkgkey
#     api_key = request.headers.get('Authorization')
#     if api_key:
#         api_key = api_key.replace('Basic ','',1)
#         try:
#             api_key = base64.b64decode(api_key)
#         except TypeError:
#             pass
#         pkgkey = Dsavailkey.query.filter_by(api_key==api_key).first()
#         if pkgkey:
#             return pkgkey
#
#     return None

