# -*- coding: utf-8 -*-
from __future__ import print_function
from ImportSettings import ImportSettings
from collections import OrderedDict

class SettingsRefGenome(ImportSettings):
    
    def getSettings(self):
        refGenomeSettings = OrderedDict((
                         ('GenomeBrowserDescr', {
                              'type': 'Text',
                              'required': False,
                              'description': 'Descriptive text that will be displayed in the genome browser section of the main page'
                              }),
                         ('AnnotMaxViewPortSize', {
                                                  'type': 'Value',
                                                  'required': False,
                                                  'description': 'Maximum viewport (in bp) the genome browser can have in order to show the genome annotation track'
                                                  }),
                         ('RefSequenceSumm', {
                                                  'type': 'Boolean',
                                                  'required': False,
                                                  'description': 'If set, a summary track displaying the reference sequence with be included in the genome browser'
                                                  }),
                         ('Annotation', {
                                        'type': 'Block',
                                        'required': False,
                                        'description': 'Directives for parsing the annotation file (annotation.gff)',
                                        'children': OrderedDict((
                                                     ('Format', {
                                                                'type': 'Text',
                                                                'description': '''File format. Possible values
        GFF = Version 3 GFF file
        GTF = Version 2 GTF file

'''
                                                                }),
                                                     ('GeneFeature', {
                                                                     'type': 'Text or List',
                                                                     'description': 'Feature id(s) used to identify genes.\n  Example: [gene, pseudogene]'
                                                                     }),
                                                     ('ExonFeature', {
                                                                     'type': 'Text or List',
                                                                     'description': 'Feature id(s) used to identify exons'
                                                                     }),
                                                     ('GeneNameAttribute', {
                                                                     'type': 'Text',
                                                                     'description': 'Attribute id used to identify gene names'
                                                                     }),
                                                     ('GeneNameSetAttribute', {
                                                                     'type': 'Text or List',
                                                                     'description': 'Attribute id(s) used to identify gene name sets.\n  Example: [Name,Alias]'
                                                                     }),
                                                     ('GeneDescriptionAttribute', {
                                                                     'type': 'Text or List',
                                                                     'description': 'Attribute id(s) used to identify gene descriptions'
                                                                     })
                                                     
                                                     ))
                                        }),
                          ('ExternalGeneLinks' , {
                                   'type': 'List',
                                   'required': False,
                                   'description': '''Each item in the list specifies a link for a gene to an external url.
  These links will show up as buttons in the gene popup window''',
                                   'children': OrderedDict((
                                                ('Url', {
                                                        'type': 'Text',
                                                        'required': True,
                                                        'description': '''Url for this link.
      This may include a token ``{Id}`` to refer to the unique gene identifier.
      Example: ``https://www.google.co.uk/search?q={Id}``'''
                                                        }),
                                                ('Name', {
                                                        'type': 'Text',
                                                        'required': True,
                                                        'description': 'Display name for this external link'
                                                        })
                                                ))
                                })
                         ))
    
        return refGenomeSettings

    def _getDocHeader(self):
        return '''.. _YAML: http://www.yaml.org/about.html

.. _def-settings-refgenome:

Reference genome settings
~~~~~~~~~~~~~~~~~~~~~~~~~
This YAML_ file contains settings for the :ref:`reference genome<dataconcept_refgenome>`. See also:

- :ref:`data-import-settings`
- :ref:`data-import-addannotation`
- :ref:`data-import-addrefgenome`
- `Example file
  <https://github.com/cggh/panoptes/blob/master/sampledata/datasets/Samples_and_Variants/refgenome/settings>`_

Possible keys
.............

'''
        
    def _getDocFilename(self):
        return 'documentation/importdata/importsettings/refgenome.rst'
    