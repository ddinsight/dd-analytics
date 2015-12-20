
dd-analytcis
====

3 sub-projects comprise dd-analytics.
The CoreBatch sub-project processes raw data to construct basic data set about network information for network anaysis. The Netview sub-project enables you to perform map-based analysis and represent the results in various ways. The Dataview sub-project can select relevant portion from the data that are sent from devices and use the data to create flexible charts according to requirements of analysts and observers.  

---

## CoreBatch

The heart of the CoreBatch sub-project is the batch-based logical component performs big data processing which includes processing and refining of data collected through dd-collector so that they can be used in Netview and Dataview


**Features**
> - An implementation example of big data processing for network quality analytics 
> - Scalable and massive processing logics based on Hadoop & Spark framework
> - Includes ETL tool which relates to RDB (Postgre SQL) for Data Mart

**Getting Started**
> - Construct Hadoop file system (HDFS) and Spark clusters on your server farm
> - Install Apache Spark on your local computer
> - Download the codes from the sub-project in ['corebatch']() directory
> - Run


----------


## Netview

The main component of the Netview sub-project is an analysis tool optimized for network quality analysis. It can perform additional analysis on results from basic analysis by CoreBatch so that analysis of Cellular and Wi-Fi network quality from various aspects is possible.  

**Features**
> **Cell Deployment Comparison:**	
> For each location, you can view where cell towers are and how many of them are. 

> **Cell Quality and Traffic Analysis:**	
> Using this tool, you can simultaneously observe cell tower qualities and traffic amount for each operator. On the left pane, you can see cell quality quantifier (Badness) which is indexed by colors. On the right pane, you can see a map that shows traffic amount for each cell that is indexed by colors. You can click on spots with low quality index and then click CellID to check detailed information. You can also view daily traffic statistics, traffic-quality correlation chart (indicated on the chart as Traffic-Correlation Indicator (TCI)), and other examples of representation of various KPI indicators.

>**Cell Quality Comparison:**	
> If you select two operators, each hexagon will be marked by the color corresponding to the operator of better cell quality at the location and you can easily compare qualities of two operators using this hexabin map. You can double-click on the hexagonal cell location that indicates the winner or loser at the location in terms of network quality and check on the detailed map which cell has the most problems. Green color indicates the cell has good quality in terms of the selected KPI metric and colors closer to red indicate worse quality. That is, the closer the color is to red, the worse the quality is. On the charts on the lower part of the window, you can also view various statistical data on the selected location. 

>**Action-Required Cell Review:**	
> This tool enables you to compare cell qualities of selected two operators. The quality of each cell is graded in 4 levels (Good, Fair, Poor, and Very Poor) and shown in four colors (Green, Light Green, Orange, and Red, respectively). You can also see the list of ten worst-performing cells among those included in the map, the distribution of quality indexes over time-of-day of those cells, and distribution of relative KPI values among device models.

>**Monitor for Cell and Wi-Fi:** 
> This tool enables you  to view quality indicators of both cellular and Wi-Fi networks simultaneously. If there are more hexabins in red than those in other colors, it indicates that the cell tower performances are bad. On the other hand, if there are more hexabins in blue, it indicates that the Wi-Fi performance is bad at the location. By clicking on the hexabin, you can view cell-towers and Wi-Fi APs with low quality indicators simultaneously on the detailed map. White color indicates good quality and deeper reds and deeper blues indicate worse quality metric of cell-towers and Wi-Fi APs respectively. You can also view the list of ten cell-towers or ten Wi-Fi APs with lowest quality, the distribution of quality indexes over Time-of-Day and among device models.

> **Wi-Fi Monitor:** 	
> This is the tool that shows the result of map-based analysis of statuses of Wi-Fi APs. It also shows required Actions for problematic APs. It can be expanded to include Carrier Wi-Fi distributions, current quality monitoring and Action management as Actionable BIs. On the map, overloaded APs are indicated so that you can see where additional APs should be deployed and APs with frequent failures are also indicated so that you can check whether the APs are up for repair or replacement. If for some reason, APs are not accessed at all and can be deleted or moved, those are also indicated. You can also view the list of 10 AP vendors of top quality indicators and the list of top 10 APs in each Action item. Wi-Fi traffic change over time is shown month-by-month and connection error rate and the number of unused APs for each month is also shown. 
> ***# Note #***
> Calculations for data represented in the pages of Netview are based on models made for demonstration to show you analysis and statistics items and doesn't represent the actual network performances. More refined and realistic calculations and logics for analysis can be obtained from real-life experiences and insights of DD Insight users. 

### 

**Getting Started**
> 1. Git clone (Download source code)
> 2. install package
> ```
> npm install -d
> ```
> 3. create batch script
> ```
> psql -h localhost -U admindw test -f batch/create.sql
> ```
> 4. start node web server
> ```
> ./restart.sh
> ```
> 5. if you change code, you should restart below command.
> ```
> ./dev.sh
> ```

> 6. You can see analytics UI on http://server-url:3333/, default ID and password is demo@airplug.com/demo"

----------


## Dataview

This is a general purpose tool or BI that enables extensible programming of feature of data selection, map- and chart-based representation and automatic report generation. The programming will enable you to use the app-based data generated from the framework such as DD Insight not only for network but also for various other analyses encompassing services and contents.

**Features**
> **Custom Report Generator:**	
> This is a tool you can use to add the generated charts as widgets and construct window modules.
> **Chart Generator: **
>This is a tool you can use to visualize the data on DataMart as charts using fragmented SQL queries
> **Chart Viewer:**	
> This is a tool for visualizations of data fragments from Chat Generator by merging them and represent them as various charts.
> **Map Board:**	
> This is a tool for visualization of various data fragments that are shown on the Map Viewer by mashing them up on the map
> **Data Viewer:**	
> This can be used to query Raw data on DataMart directly using SQL queries

**Getting Started**
> 1. Git clone 
> 2. install mysql and python
> 3. install mysql-python with pip or a package installer on your os
> 4. execute ./wave++/web/setup.bat
> 5. create a database and a user
> * execute *create.sql* on the created user account
> * set *SQLALCHEMY_DATABASE_URI* within  *web/config.py* to the created connection info for mysql (URL, port, username, password)
> 6. start server
> ```
> python run.py
> ```


----------

----------

### 
#### **Authors & Contributors**
> - Kwangju Lee (Batch)
> - Ethan Lee (Netview, Dataview)
> - Aram Seo : special contribution to Dataview in visualization
> - [See contributors on Github](http://)

### 
#### **License**
> dd-analytics is released under [Apache v2 License](http://)

---
### 
Copyright 2015 AirPlug Inc.
