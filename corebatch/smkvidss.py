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


"""

"""
__author__ = 'jaylee'

import os
import sys
import time

os.environ['SPARK_HOME']="$SPARK_HOME"
os.environ['HADOOP_USER_NAME']='hadoopuser'
sys.path.append("$SPARK_HOME/python/")
sys.path.append("$SPARK_HOME/python/build")

from pyspark import SparkConf, SparkContext
from pyspark.sql import HiveContext, Row, DataFrame, DataFrameWriter
from pyspark.sql.types import *
import json

aatLogFld = ['log_time', 'abrMode', 'agentAatOnOff',
'agentLogEndTime', 'agentLogStartTime', 'agentLogType', 'bbCount',
'bbList', 'brand', 'confOperator', 'deviceID', 'liveCurrentTSBitrate', 'model', 'netActiveNetwork', 'netCellState',
'netCID', 'netLAC', 'numTotalHits', 'osVer', 'pkgName', 'playAccBufferingTime',
'playAppPackageName', 'playContentId', 'playHost',
'playOrigin', 'playPlayingTime', 'playPreparingTime',
'playServiceMode', 'playSessionId', 'playTitle', 'requestBR', 'sID',
'trafficAgentMoAveBW', 'trafficAgentMoBytes', 'trafficAgentWFAveBW', 'trafficAgentWFBytes', 'trafficSystemMoRxBytes',
'trafficSystemWFRxBytes', 'playEndState', 'tTM', 'verCode', 'vID']


def loadData(data):
	try:
		data = json.loads(data)
		if 'pdata' in data:
			obj = json.loads(data.pop('pdata'))
			data.update(obj)
		elif 'pcell' in data.get('__validityReport', {}):
			obj = data['__validityReport']['pcell'][0][0]
			if isinstance(obj, (str, unicode)):
				obj = json.loads(obj)
			data.update(obj)

			if 'pwf' in data.get('__validityReport', {}):
				obj = data['__validityReport']['pwf'][0][0]
				if isinstance(obj, (str, unicode)):
					obj = json.loads(obj)
				data.update(obj)
		elif 'pdata' in data.get('__validityReport', {}):
			obj = data['__validityReport']['pdata'][0][0]
			if isinstance(obj, (str, unicode)):
				obj = json.loads(obj)
			data.update(obj)
	except Exception, e:
		print "loadData Error :%s" % e

	return data

def getPairKey(data):
	try:
		logData = {}

		for k in aatLogFld:
			if data.get(k) != None:
				logData.update({k:data[k]})

	except Exception, e:
		print "getPairKey Error:%s" % e

	return ((data['playSessionId'], data['tTM']), logData)


def mkVidLog((k, (v1, v2))):
	vlog = {}
	vlog['playSessionID'] = k[0]
	vlog['tTM'] = v1.get('tTM')
	vlog['objid'] = v1.get('log_time')
	vlog['logType'] = v1.get('agentLogType')
	vlog['logStartTime'] = int(v1.get('agentLogStartTime'))
	vlog['logEndTime'] = int(v1.get('agentLogEndTime'))
	vlog['cellid'] = str(v1.get('confOperator', '')) + '_' + str(v1.get('netCID', 0)) + '_' + str(v1.get('netLAC', '0'))
	vlog['ntype'] = '0' if 'WIFI' in v1.get('netActiveNetwork', '') else '1'
	vlog['abrMode'] = v1.get('abrMode', '')
	vlog['curBitrate'] = int(v1.get('liveCurrentTSBitrate', 0))
	vlog['reqBitrate'] = int(v1.get('requestBR', 0))
	vlog['elapsedTime'] = float(v1.get('playPreparingTime', 0))
	vlog['bbCount'] = v1.get('bbCount')
	vlog['cellSysRxBytes'] = long(v1.get('trafficSystemMoBytes', 0))
	vlog['wfSysRxBytes'] = long(v1.get('trafficSystemWFBytes', 0))
	vlog['netCellState'] = v1.get('netCellState')
	vlog['bufferState'] = v1.get('playbufferState', 0) if v1.get('playbufferState', 0) >= 0 else 0
	vlog['playEndState'] = v1.get('playEndState', '')
	vlog['ssid'] = v1.get('netActiveNetwork').split('|')[3] if 'WIFI' in v1.get('netActiveNetwork', '')  and len(v1.get('netActiveNetwork', '').split('|')) > 3 else None
	vlog['bssid'] = v1.get('netActiveNetwork').split('|')[4] if 'WIFI' in v1.get('netActiveNetwork', '')  and len(v1.get('netActiveNetwork', '').split('|')) > 4 else None
	vlog['lstuptmp'] = int(time.time())

	if v2 == None:
		vlog['playTime'] = v1.get('playPlayingTime', 0)  #lag
		vlog['pauseTime'] = v1.get('playAccBufferingTime', 0)  #lag
		vlog['cellRxBytes'] = v1.get('trafficAgentMoBytes', 0)  #lag
		vlog['wfRxBytes'] = v1.get('trafficAgentWFBytes', 0)   #lag
		vlog['cellDuration'] = int(v1.get('trafficAgentMoBytes', 0)*8.0 / (v1.get('trafficAgentMoAveBW')*1000000.0)) if v1.get('trafficAgentMoAveBW', 0) > 0 else 0
		vlog['wfDuration'] = int(v1.get('trafficAgentWFBytes', 0)*8.0 / (v1.get('trafficAgentWFAveBW')*1000000.0)) if v1.get('trafficAgentWFAveBW', 0) > 0 else 0
	else:
		vlog['playTime'] = (v1.get('playPlayingTime', 0) - v2.get('playPlayingTime', 0)) if v1.get('playPlayingTime', 0) > v2.get('playPlayingTime', 0) else 0 #lag
		vlog['pauseTime'] = (v1.get('playAccBufferingTime', 0) - v2.get('playAccBufferingTime', 0)) if v1.get('playAccBufferingTime', 0) > v2.get('playAccBufferingTime', 0) else 0 #lag
		vlog['cellRxBytes'] =  (v1.get('trafficAgentMoBytes', 0) - v2.get('trafficAgentMoBytes', 0)) if v1.get('trafficAgentMoBytes', 0) > v2.get('trafficAgentMoBytes', 0) else 0 #lag
		vlog['wfRxBytes'] =  (v1.get('trafficAgentWFBytes', 0) - v2.get('trafficAgentWFBytes', 0)) if v1.get('trafficAgentWFBytes', 0) > v2.get('trafficAgentWFBytes', 0) else 0 #lag
		cellDur = int(v1.get('trafficAgentMoBytes', 0)*8.0 / (v1.get('trafficAgentMoAveBW')*1000000.0)) if v1.get('trafficAgentMoAveBW', 0) > 0 else 0
		wfDur = int(v1.get('trafficAgentWFBytes', 0)*8.0 / (v1.get('trafficAgentWFAveBW')*1000000.0)) if v1.get('trafficAgentWFAveBW', 0) > 0 else 0
		lagCellDur = int(v2.get('trafficAgentMoBytes', 0)*8.0 / (v2.get('trafficAgentMoAveBW')*1000000.0)) if v2.get('trafficAgentMoAveBW', 0) > 0 else 0
		lagwfDur = int(v2.get('trafficAgentWFBytes', 0)*8.0 / (v2.get('trafficAgentWFAveBW')*1000000.0)) if v2.get('trafficAgentWFAveBW', 0) > 0 else 0
		vlog['cellDuration'] = (cellDur - lagCellDur) if cellDur > lagCellDur else 0
		vlog['wfDuration'] = (wfDur - lagwfDur) if wfDur > lagwfDur else 0

	return vlog

def vidCreate(v):
	vss = {}
	v1 = v[1]
	vss['playSessionID'] = v1.get('playSessionId')
	vss['androidID'] = v1.get('deviceID')
	vss['vID'] = v1.get('vID')
	vss['sID'] = v1.get('sID')
	vss['verCode'] = v1.get('verCode')
	vss['osVer'] = v1.get('osVer')
	vss['brand'] = v1.get('brand')
	vss['model'] = v1.get('model')
	vss['cellIdSt'] = str(v1.get('confOperator', '')) + '_' + str(v1.get('netCID', 0)) + '_' + str(v1.get('netLAC', '0'))
	vss['cellIdEnd'] = str(v1.get('confOperator', '')) + '_' + str(v1.get('netCID', 0)) + '_' + str(v1.get('netLAC', '0'))
	vss['bMao'] = v1.get('agentAatOnOff')
	vss['startLogType'] = v1.get('agentLogType')
	vss['endLogType'] = v1.get('agentLogType')

	vss['vidnetStartTime'] = v1.get('agentLogStartTime')
	vss['vidnetEndTime'] = v1.get('agentLogEndTime')

	#vss['vidnetDuration'] = vss.get('vidnetEndTime') - vss.get('vidnetStartTime')
	vss['playServiceMode'] = v1.get('playServiceMode')
	vss['playTime'] = v1.get('playPlayingTime')
	vss['pauseCnt'] = 1 if v1.get('agentLogType') == 6 else 0
	vss['resumeCnt'] = 1 if v1.get('agentLogType') == 7 else 0
	vss['pauseTime'] = v1.get('playAccBufferingTime', 0)
	vss['cellRxBytes'] = v1.get('trafficAgentMoBytes', 0)
	vss['cellAvgTP'] = v1.get('trafficAgentMoAveBW', 0)
	vss['cellDuration'] = int(v1.get('trafficAgentMoBytes', 0)*8.0 / (v1.get('trafficAgentMoAveBW')*1000000.0)) if v1.get('trafficAgentMoAveBW', 0) > 0 else 0
	vss['wfRxBytes'] = v1.get('trafficAgentWFBytes', 0)
	vss['wfAvgTP'] = v1.get('trafficAgentWFAveBW', 0)
	vss['wfDuration'] = int(v1.get('trafficAgentWFBytes', 0)*8.0 / (v1.get('trafficAgentWFAveBW')*1000000.0)) if v1.get('trafficAgentWFAveBW', 0) > 0 else 0
	vss['cellSysRxBytes'] = v1.get('trafficSystemMoRxBytes', 0)
	vss['wfSysRxBytes'] = v1.get('trafficSystemWFRxBytes', 0)
	vss['hostName'] = v1.get('playHost')
	vss['originName'] = v1.get('playOrigin')
	vss['contentID'] = v1.get('playContentId')
	vss['contentBitrate'] = v1.get('liveCurrentTSBitrate')
	vss['channelName'] = v1.get('playTitle')
	vss['pkgnm'] = v1.get('pkgName')
	ppkgnm = v1.get('playAppPackageName').split('/')
	if len(ppkgnm) > 0:
		vss['apppkgnm'] = ppkgnm[0]
	else:
		vss['apppkgnm'] = ""
	if len(ppkgnm) > 1:
		vss['appvercd'] = ppkgnm[1]
	else:
		vss['appvercd'] = ""
	vss['netAllowCell'] = 1 if v1.get('netCellState') == 0 else 0
	vss['bbCount'] = v1.get('bbCount', 0)
	vss['elapsedTime'] = v1.get('playPreparingTime')
	vss['idxmax']= v[0]
	vss['idxmin']= v[0]
	vss['lstuptmp'] = int(time.time())

	return vss

def vidMerge(vss, v):
	v1 = v[1]
	if vss['playSessionID'] == None: vss['playSessionID'] = v1.get('playSessionId')
	if vss['androidID'] == None: vss['androidID'] = v1.get('deviceID')
	if vss['vID'] == None: vss['vID'] = v1.get('vID')
	if vss['sID'] == None: vss['sID'] = v1.get('sID')
	if vss['verCode'] == None: vss['verCode'] = v1.get('verCode')
	if vss['osVer'] == None: vss['osVer'] = v1.get('osVer')
	if vss['brand'] == None: vss['brand'] = v1.get('brand')
	if vss['model'] == None: vss['model'] = v1.get('model')
	if vss['bMao'] == None: vss['bMao'] = v1.get('agentAatOnOff')
	if vss['playServiceMode'] == None: vss['playServiceMode'] = v1.get('playServiceMode')
	if vss['hostName'] == None: vss['hostName'] = v1.get('playHost')
	if vss['originName'] == None: vss['originName'] = v1.get('playOrigin')
	if vss['contentID'] == None: vss['contentID'] = v1.get('playContentId')
	if vss['contentBitrate'] == None: vss['contentBitrate'] = v1.get('liveCurrentTSBitrate')
	if vss['channelName'] == None: vss['channelName'] = v1.get('playTitle')
	if vss['pkgnm'] == None: vss['pkgnm'] = v1.get('pkgName')
	if vss['apppkgnm'] == None:
		ppkgnm = v1.get('playAppPackageName').split('/')
		if len(ppkgnm) > 0:
			vss['apppkgnm'] = ppkgnm[0]
		else:
			vss['apppkgnm'] = ""
		if len(ppkgnm) > 1:
			vss['appvercd'] = ppkgnm[1]
		else:
			vss['appvercd'] = ""
	if vss['netAllowCell'] == None: vss['netAllowCell'] = 1 if v1.get('netCellState') == 0 else 0

	if vss['idxmin'] > v[0]:
		vss['cellIdSt'] = str(v1.get('confOperator', '')) + '_' + str(v1.get('netCID', 0)) + '_' + str(v1.get('netLAC', '0'))
		vss['startLogType'] = v1.get('agentLogType')
		vss['vidnetStartTime'] = v1.get('agentLogStartTime')
		vss['idxmin'] = v[0]

	if vss['idxmax'] < v[0]:
		vss['cellIdEnd'] = str(v1.get('confOperator', '')) + '_' + str(v1.get('netCID', 0)) + '_' + str(v1.get('netLAC', '0'))
		vss['endLogType'] = v1.get('agentLogType')
		vss['vidnetEndTime'] = v1.get('agentLogEndTime')
		vss['playTime'] = v1.get('playPlayingTime')
		vss['cellRxBytes'] = v1.get('trafficAgentMoBytes', 0)
		vss['cellAvgTP'] = v1.get('trafficAgentMoAveBW', 0)
		vss['cellDuration'] = int(v1.get('trafficAgentMoBytes', 0)*8.0 / (v1.get('trafficAgentMoAveBW')*1000000.0)) if v1.get('trafficAgentMoAveBW', 0) > 0 else 0
		vss['wfRxBytes'] = v1.get('trafficAgentWFBytes', 0)
		vss['wfAvgTP'] = v1.get('trafficAgentWFAveBW', 0)
		vss['wfDuration'] = int(v1.get('trafficAgentWFBytes', 0)*8.0 / (v1.get('trafficAgentWFAveBW')*1000000.0)) if v1.get('trafficAgentWFAveBW', 0) > 0 else 0
		vss['elapsedTime'] = v1.get('playPreparingTime')
		vss['pauseTime'] = v1.get('playAccBufferingTime', 0)
		vss['idxmax'] = v[0]

	vss['bbCount'] += v1.get('bbCount', 0)
	if v1.get('agentLogType') == 6: vss['pauseCnt'] += 1
	if v1.get('agentLogType') == 7: vss['resumeCnt'] += 1
	vss['cellSysRxBytes'] += v1.get('trafficSystemMoRxBytes', 0)
	vss['wfSysRxBytes'] += v1.get('trafficSystemWFRxBytes', 0)
	if v1.get('netCellState') == 0  and vss['netAllowCell'] == 0:
		vss['netAllowCell'] = 2
	elif v1.get('netCellState') <> 0  and vss['netAllowCell'] == 1:
		vss['netAllowCell'] = 2

	vss['lstuptmp'] = int(time.time())

	return vss

def vidMerge2(vss, v1):

	if vss['idxmin'] > v1['idxmin']:
		vss['cellIdSt'] = v1['cellIdSt']
		vss['startLogType'] = v1['startLogType']
		vss['vidnetStartTime'] = v1['vidnetStartTime']
		vss['idxmin'] = v1['idxmin']

	if vss['idxmax'] < v1['idxmax']:
		vss['cellIdEnd'] = v1['cellIdEnd']
		vss['endLogType'] = v1['endLogType']
		vss['vidnetEndTime'] = v1['vidnetEndTime']
		vss['playTime'] = v1['playTime']
		vss['cellRxBytes'] = v1['cellRxBytes']
		vss['cellAvgTP'] = v1['cellAvgTP']
		vss['cellDuration'] = v1['cellDuration']
		vss['wfRxBytes'] = v1['wfRxBytes']
		vss['wfAvgTP'] = v1['wfAvgTP']
		vss['wfDuration'] = v1['wfDuration']
		vss['elapsedTime'] = v1['elapsedTime']
		vss['idxmax'] = v1['idxmax']
		vss['pauseTime'] = v1['pauseTime']

	vss['bbCount'] += v1['bbCount']
	vss['pauseCnt'] += v1['pauseCnt']
	vss['resumeCnt'] += v1['resumeCnt']
	vss['cellSysRxBytes'] += v1['cellSysRxBytes']
	vss['wfSysRxBytes'] += v1['wfSysRxBytes']

	if v1['netAllowCell'] <> vss['netAllowCell']:
		vss['netAllowCell'] = 2

	vss['lstuptmp'] = int(time.time())

	return vss

if __name__ == '__main__':

	try:
		conf = SparkConf().setMaster('spark://spark.master.com:7077').setAppName("mytest").set('spark.executer.memory', '1g')
		sc = SparkContext(conf=conf)

		#read raw logs
		logSet = sc.textFile("hdfs://hdfs.hadoop.yourdomain.com:9000/hdfs/aatlogstore/YYYY/MM/*").map(loadData)

		aatlog = logSet.map(getPairKey)

		#make vidsession_log & vidsession data
		aatlogSet = aatlog.reduceByKey(lambda x, y: x)
		vidlogSet = aatlogSet.sortByKey().zipWithIndex().map(lambda x: ((x[0][0][0], x[1]), x[0][1]))
		vidlogSet.persist()
		vidlogLag = vidlogSet.map(lambda x:((x[0][0], x[0][1]+1), x[1]))
		vidLogRST = vidlogSet.leftOuterJoin(vidlogLag).map(mkVidLog)

		vidSet = vidlogSet.map(lambda x: (x[0][0], (x[0][1], x[1])))
		vidProcSet = vidSet.combineByKey(vidCreate, vidMerge, vidMerge2)

		print "filter processing done "
		#save RDD to HIVE Tables
		hx = HiveContext(sc)

		vidTable = hx.createDataFrame(vidProcSet.map(lambda x:x[1]))
		vidLogTable = hx.createDataFrame(vidLogRST, samplingRatio=0.5)

		print "Dataframe Done"
		vidLogTable.saveAsTable('vidsession_log', mode='append')
		vidTable.saveAsTable('vidsession', mode='append')

		print "AATLOG Process Done"

	except Exception, e:
		print "MAIN Error %s" % e

