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


from flask.ext.sqlalchemy import SQLAlchemy
from sqlalchemy import Column, Integer, String
from sqlalchemy.sql import expression
from sqlalchemy.ext import compiler
from sqlalchemy import desc
from sqlalchemy.orm import sessionmaker
from collections import OrderedDict
import re, os, sys
from sqlalchemy import event


db = SQLAlchemy()

# Session = sessionmaker()
# @event.listens_for(Session, 'before_flush')
# def set_group_concat_max_len(session, transaction, connection):
#     print 'set_max_heap_table_size'
#     session.execute('SET group_concat_max_len = 10240')

class CRUDMixin(object):

    @classmethod
    def create(cls, commit=True, **kwargs):
        print 'create------'
        instance = cls(**kwargs)
        # for k, v in kwargs.iteritems():
        #     print "%s = %s" % (k.encode('UTF-8'),v.encode('UTF-8'))
        return instance.save(commit=commit)

    @classmethod
    def get(cls, id):
        return cls.query.get(id)

    @classmethod
    def get_or_404(cls, id):
        return cls.query.get_or_404(id)

    @classmethod
    def get_or_create(cls, commit=True, **kwargs):
        instance = db.session.query(cls).filter_by(**kwargs).first()
        if instance:
            return instance, False
        else:
            instance = cls(**kwargs)
            # for k, v in kwargs.iteritems():
            #     print "%s = %s" % (k,v)
            return instance.save(commit=commit), True

    def update(self, commit=True, **kwargs):
        print 'update--------------'
        for attr, value in kwargs.iteritems():
            # print str(attr) + ' = ' + str(value) +'----'+ str(value is not None) + '***' + str(len(str(value)) > 0)
            if value is not None:
                setattr(self, attr, value)
        return commit and self.save() or self

    def save(self, commit=True):
        print 'save--------------' 
        db.session.add(self)
        print self
        if commit:
            db.session.commit()
        return self

    def delete(self,commit=True):
        print 'delete--------------'
        db.session.delete(self)
        return commit and db.session.commit()

def extract_tablenm(query): 
    # match = re.search(r'FROM[\n\s]+.*[\n\s]+[WHERE]*', str(query))
    match = re.search(r'FROM[\n\s]+.*[\n\s]*[WHERE]*', str(query))
    if match:                      
        # print 'found', match.group(0) ## 'found word:cat'
        m_str = match.group(0)        
        tables = m_str.replace('FROM','').replace('WHERE','').replace(' ','').rstrip().rstrip('\n').split(',')
        return tables    
    else:
        return []

def query_to_list_json(query):
    print 'query_to_list_json'

    datas = []
    results = db.session.execute(query)
    # print results.keys()
    tables = extract_tablenm(query)
    print 'query is %s and <table count is %d >' % (str(query), len(tables))
    # print tables
    for row in list(results):
        # rowdict = {}
        # print row
        rowdict = OrderedDict() 
        c = 0
        keys = results.keys()[:]
        for key in results.keys():
            c += 1
            # nKey = str(key).split('_')

            # if '_' in str(key):
            #     rowdict.update({nKey[len(nKey)-1]:row[key]})
            # else:
            #     rowdict.update({key:row[key]})

            for name in tables:
                # print 'key and table name is (%s, %s) '%(key, name)
                if name in str(key):
                    # print key[key.index(name)+len(name)+1:len(key)]
                    rowdict.update({key[key.index(name)+len(name)+1:len(key)]:row[key]})
            else:
                rowdict.update({key:row[key]})
                # print str(key) + ' is a ' + str(row[key])
        datas.append(rowdict)
        # print ','.join(rowdict)
    # print datas    
    return datas


def compile_query(query):
    from sqlalchemy.sql import compiler
    from MySQLdb.converters import conversions, escape

    dialect = query.session.bind.dialect
    statement = query.statement
    comp = compiler.SQLCompiler(dialect, statement)
    comp.compile()
    enc = dialect.encoding
    params = []
    for k in comp.positiontup:
        v = comp.params[k]
        if isinstance(v, unicode):
            v = v.encode(enc)
        params.append( escape(v, conversions) )
    return (comp.string.encode(enc) % tuple(params)).decode(enc)



class group_concat(expression.FunctionElement):
    name = "group_concat"

@compiler.compiles(group_concat, 'mysql')
def _group_concat_mysql(element, compiler, **kw):
    if len(element.clauses) == 2:
        seperator = compiler.process(element.clauses.clauses[1])
    else:
        seperator = '->'
    print compiler.process(element.clauses.clauses[0]) + "---" +compiler.process(element.clauses.clauses[1]) + "---" + seperator
    return 'GROUP_CONCAT(%s SEPARATOR %s)'.format(
        compiler.process(element.clauses.clauses[0]),
        seperator
        )


