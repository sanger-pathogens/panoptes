# This file is part of Panoptes - (C) Copyright 2014, CGGH <info@cggh.org>
# This program is free software licensed under the GNU Affero General Public License.
# You can find a copy of this license in LICENSE in the top directory of the source code or at <http://opensource.org/licenses/AGPL-3.0>

import os
import shutil

from os.path import join

import errno
import simplejson
import multiprocessing
import multiprocessing.dummy


from ProcessDatabase import ProcessDatabase
from BaseImport import BaseImport
from SettingsGraph import SettingsGraph
from PanoptesConfig import PanoptesConfig
from ImportSettings import valueTypes

pool = multiprocessing.dummy.Pool(multiprocessing.cpu_count())

class ImportDataTable(BaseImport):

    #Retrieve and validate settings
    def getSettings(self, tableid):
        tableSettings = self._fetchSettings(tableid)    
        
        if tableSettings['maxTableSize'] is not None:
            self._log('WARNING: table size limited to '+str(tableSettings['maxTableSize']))
                   
        return tableSettings

    def ImportDataTable(self, tableid):
        
        with self._logHeader('Importing datatable {0}'.format(tableid)):
            tableSettings = self.getSettings(tableid)
            importer = ProcessDatabase(self._calculationObject, self._datasetId, self._importSettings)
            importer.importData(tableid, createSubsets = True)
            importer.cleanUp()
            #Disabled till implemented in monet
            # filterBanker.createTableBasedSummaryValues(tableid)
            self.importGraphs(tableid)
            self.storeDataDerivedConfig(tableid)

    def storeDataDerivedConfig(self, table_id):
        with self._logHeader('Storing data derived config'):
            config = PanoptesConfig(self._calculationObject)
            base_folder = join(config.getBaseDir(), 'config', self._datasetId, table_id)
            def getDataDerivedConfigForProp(prop_id):
                result = {}
                prop = self._settingsLoader.getProperty(prop_id)
                if 'isCategorical' not in prop and self._dao._execSqlQuery(
                        'select count(distinct "{0}") from "{1}"'.format(prop_id, table_id))[0][0] < 50:
                    result['isCategorical'] = True
                if (result.get('isCategorical', False) or prop.get('isCategorical', False)) \
                        and prop['dataType'] != 'Date':  # TODO Dates don't serialise nicely
                    result['distinctValues'] = map(lambda a: a[0], self._dao._execSqlQuery(
                        'select distinct "{0}" from "{1}" order by "{0}"'.format(prop_id, table_id)))
                if 'maxVal' not in prop and prop['dataType'] in valueTypes:
                    result['maxVal'] = \
                    self._dao._execSqlQuery('select max("{0}") from "{1}"'.format(prop_id, table_id))[0][0]
                if 'minVal' not in prop and prop['dataType'] in valueTypes:
                    result['minVal'] = \
                    self._dao._execSqlQuery('select min("{0}") from "{1}"'.format(prop_id, table_id))[0][0]
                return result
            prop_ids = self._settingsLoader.getPropertyNames()
            results = pool.map(getDataDerivedConfigForProp, prop_ids)
            data_derived_config = {}
            for prop_id, result in zip(prop_ids, results):
                data_derived_config[prop_id] = result
            try:
                os.makedirs(base_folder)
            except OSError as exception:
                if exception.errno != errno.EEXIST:
                    raise
            with open(join(base_folder, 'dataConfig.json'), 'w') as f:
                simplejson.dump(data_derived_config, f)

    def importGraphs(self, tableid):
        folder = self._datatablesFolder
        with self._logHeader('Importing graphs'):
            self._dao.deleteGraphsForTable(tableid)
            graphsfolder = os.path.join(folder, tableid, 'graphs')
            if os.path.exists(graphsfolder):
                for graphid in os.listdir(graphsfolder):
                    if os.path.isdir(os.path.join(graphsfolder, graphid)):
                        print('Importing graph ' + graphid)
                        graphfolder = os.path.join(graphsfolder, graphid)
                        
                        graphSettings = SettingsGraph(os.path.join(graphfolder, 'settings'))
                       
                        self._dao.insertGraphForTable(tableid, graphid, graphSettings)
                        destFolder = os.path.join(self._config.getBaseDir(), 'Graphs', self._datasetId, tableid)
                        if not os.path.exists(destFolder):
                            os.makedirs(destFolder)
                        shutil.copyfile(os.path.join(graphfolder, 'data'), os.path.join(destFolder, graphid))

    
    def importAllDataTables(self):
        
        datatables = self._getTables()
        
        datatables = self._getDatasetFolders(datatables)

        for datatable in datatables:
            
            self.ImportDataTable(datatable)
        
        return datatable
    
    
