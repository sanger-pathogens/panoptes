#!/bin/bash -e

# this script executes the database creation code in build.sh
# that will have been skipped when SKIP_SQL is set
# 
# you can use it to craete a database if this was not done
# at build time

red='\e[0;31m'
green='\e[0;32m'
NC='\e[0m' # No Color
#Find out where this script is
SCRIPT_PATH="${BASH_SOURCE[0]}";
if ([ -h "${SCRIPT_PATH}" ]) then
  while([ -h "${SCRIPT_PATH}" ]) do SCRIPT_PATH=`readlink "${SCRIPT_PATH}"`; done
fi
pushd . > /dev/null
cd `dirname ${SCRIPT_PATH}` > /dev/null
#We are now at the dir of the script go one up to project
cd ..
PROJECT_ROOT=`pwd`;

if [ ! -f config.py ]
then
  echo "You must have a config.py"
  exit 1
fi

echo -e "${green}  Copying config.py${NC}"
cp $PROJECT_ROOT/config.py config.py
echo pythoncommand = \'`which python`\' >> config.py
echo mysqlcommand = \'`which mysql`\' >> config.py

echo -e "${green}  Creating skeleton DB - if needed${NC}"
   DBSRV=`python -c "import config;print config.DBSRV"`
   DBUSER=`python -c "import config;print config.DBUSER"`
   DBPASS=`python -c "import config;print config.DBPASS"`
   DB=`python -c "import config;print config.DB"`
   mysql -h$DBSRV -u$DBUSER -p$DBPASS <<- EOF
CREATE DATABASE IF NOT EXISTS ${DB};
EOF
   
mysql -h$DBSRV -u$DBUSER -p$DBPASS ${DB} < ${PROJECT_ROOT}/scripts/datasetindex.sql

popd  > /dev/null

