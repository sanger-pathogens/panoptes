define(["require", "DQX/base64", "DQX/Application", "DQX/Framework", "DQX/Controls", "DQX/Msg", "DQX/SQL", "DQX/DocEl", "DQX/Utils", "DQX/Wizard", "DQX/Popup", "DQX/ChannelPlot/GenomePlotter", "DQX/ChannelPlot/ChannelYVals", "DQX/ChannelPlot/ChannelPositions", "DQX/ChannelPlot/ChannelSequence","DQX/DataFetcher/DataFetchers", "DQX/DataFetcher/DataFetcherSummary", "MetaData"],
    function (require, base64, Application, Framework, Controls, Msg, SQL, DocEl, DQX, Wizard, Popup, GenomePlotter, ChannelYVals, ChannelPositions, ChannelSequence, DataFetchers, DataFetcherSummary, MetaData) {

        var PromptDataSet = {};

        PromptDataSet.init = function() {
        }

        PromptDataSet.execute = function(proceedFunction) {
            PromptDataSet.proceedFunction = proceedFunction;
            var getter = DataFetchers.ServerDataGetter();//Instantiate the fetcher object
            getter.addTable('datasetindex',['id','name'],'id');
            getter.execute(MetaData.serverUrl,'datasetindex',
                function() {
                    PromptDataSet.datasets = getter.getTableRecords('datasetindex');
                    if (DQX.getUrlSearchString('dataset')) {
                        MetaData.database = DQX.getUrlSearchString('dataset');
                        PromptDataSet.proceedFunction();
                    }
                    else
                        PromptDataSet.execute2();
                }
            );

        }

        PromptDataSet.execute2 = function() {
            var wiz=Wizard.Create('SelectDataSet', {title:'Select Data set', sizeX:450, sizeY: 400, canCancel: false});

            PromptDataSet.ctrl_datasetlist = Controls.List(null,{width:400, height:210 })
            var items=[];
            $.each(PromptDataSet.datasets,function(id,dataset) {
                items.push({id: dataset.id, content:dataset.name});
            });
            PromptDataSet.ctrl_datasetlist.setItems(items, (items.length>0)?(items[0].id):(null));
            PromptDataSet.ctrl_datasetlist.setOnDoubleClick(function() {
                wiz.performFinish();
            });

            var ctrl_admin = Controls.Hyperlink(null, {content:'Admin tool...'}).setOnChanged(function() {
                var hostname=window.location.hostname;
                var pathname=window.location.pathname;
                var protocol=window.location.protocol;
                var url='{protocol}//{hostname}{pathname}'.DQXformat({
                    protocol:protocol,
                    hostname:hostname,
                    pathname:pathname
                });
                window.open('admin.html');
            });

            var controls = Controls.CompoundVert([
                PromptDataSet.ctrl_datasetlist,
                ctrl_admin
            ]);

            wiz.addPage({
                id: 'page1',
                form: controls,
                reportValidationError: function() {
                    if (!PromptDataSet.ctrl_datasetlist.getValue())
                        return 'Please select a data set';
                }
            });

            wiz.run(function() {
                MetaData.database = wiz.getResultValue(PromptDataSet.ctrl_datasetlist.getID());
                PromptDataSet.proceedFunction();
            });
        }



        return PromptDataSet;
    });



