cd ..
tar cvfz ddinsight.tar.gz --exclude='ddinsight/map'  --exclude='ddinsight/.idea' --exclude='ddinsight/.git' --exclude='ddinsight/node_modules' --exclude='ddinsight/redis-3.0.0' --exclude='ddinsight/nohup.out' --exclude='ddinsight/bower_components' --exclude='ddinsight/*.db'  ddinsight/
# tar cvfz ddinsight.tar.gz  --exclude='ddinsight/.idea' --exclude='ddinsight/node_modules' --exclude='ddinsight/redis-3.0.0' --exclude='ddinsight/nohup.out' --exclude='ddinsight/bower_components' --exclude='ddinsight/*.db'  ddinsight/
export SSHPASS=ap11040621
sshpass -e sftp -oBatchMode=no -b - apdev@netcurve.airplug.com << !
   put ddinsight.tar.gz
   bye
!

sshpass -e ssh apdev@netcurve.airplug.com << !
tar xvfz  ddinsight.tar.gz
exit
!
