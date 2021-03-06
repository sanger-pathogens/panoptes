from collections import OrderedDict
import sqlparse
import os
from responders.importer.BasePlugin import BasePlugin
    
class SQLloader(BasePlugin):
    

        
    def getSettings(self):
        settingsDef = OrderedDict((('plugin', {
                                               'type': 'Text',
                                               'required': True,
                                               'description': "The name of the plugin class to run",
                                               'values':  { 'SQLloader': { 'description' : 'The name of the plugin class'} }
                                               }),
                                   ('dataFile', {
                                                 'type': 'Text',
                                                 'required': False,
                                                 'default': 'data.sql'
                                                 })))
        return settingsDef

        
    def run(self):
        
        sqlFile = os.path.join(self._dirPath, self._plugin_settings["dataFile"])
        self._log("Loading SQL file:" + sqlFile)
        sql = open(sqlFile).read()
        sql_parts = sqlparse.split( sql )
        
        with self._dao.getDBCursor() as cur:
            
            for sql_part in sql_parts:
                if sql_part.strip() ==  '':
                    continue 
                self._log('SQLQuery:' + (self._datasetId or 'no dataset') + ';' + sql_part)
                cur.execute(sql_part)
