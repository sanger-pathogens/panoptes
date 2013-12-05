import DQXDbTools
import uuid
import os
import config
import VTTable
import time
import asyncresponder
import sys

print(sys.path)
import importer.ImportFiles


def ResponseExecute(data, calculationObject):
    datasetid = data['datasetid']
    importSettings = {}
    importer.ImportFiles.ImportDataSet(
        calculationObject,
        config.SOURCEDATADIR + '/datasets',
        datasetid,
        importSettings
    )

def response(returndata):
    retval = asyncresponder.RespondAsync(
        ResponseExecute,
        returndata,
        "Load dataset {0}".format(returndata['datasetid'])
    )
    return retval
