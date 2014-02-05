define(["require", "DQX/base64", "DQX/Application", "DQX/Framework", "DQX/Controls", "DQX/Msg", "DQX/SQL", "DQX/DocEl", "DQX/Utils", "DQX/QueryTable", "DQX/Map",
    "DQX/Wizard", "DQX/Popup", "DQX/PopupFrame", "DQX/ChannelPlot/GenomePlotter", "DQX/ChannelPlot/ChannelYVals", "DQX/ChannelPlot/ChannelPositions", "DQX/ChannelPlot/ChannelSequence","DQX/DataFetcher/DataFetchers", "DQX/DataFetcher/DataFetcherSummary",
    "MetaData", "Utils/GetFullDataItemInfo", "Utils/MiscUtils"
],
    function (require, base64, Application, Framework, Controls, Msg, SQL, DocEl, DQX, QueryTable, Map,
              Wizard, Popup, PopupFrame, GenomePlotter, ChannelYVals, ChannelPositions, ChannelSequence, DataFetchers, DataFetcherSummary,
              MetaData, GetFullDataItemInfo, MiscUtils
        ) {

        var FindDataItem  = {};


        FindDataItem.execute = function(tableid) {



            var that = PopupFrame.PopupFrame('DataItemTablePopup'+tableid,
                {
                    title: 'Find ' + MetaData.mapTableCatalog[tableid].tableNameSingle,
                    blocking: false,
                    sizeX:700, sizeY:500
                }
            );

            that.tableInfo =MetaData.mapTableCatalog[tableid];

            that.eventids = [];//Add event listener id's to this list to have them removed when the popup closes
            var eventid = DQX.getNextUniqueID();that.eventids.push(eventid);
            Msg.listen(eventid, { type: 'SelectionUpdated'}, function(scope,tableid) {
                if (that.tableInfo.id==tableid) {
                    if (that.myTable)
                        that.myTable.render();
                }
            } );


            that.createFrames = function() {
                that.frameRoot.makeGroupVert();

                that.frameButtons = that.frameRoot.addMemberFrame(Framework.FrameFinal('', 0.3))
                    .setFixedSize(Framework.dimY, 40).setFrameClassClient('DQXGrayClient').setMargins(5);

                that.frameBody = that.frameRoot.addMemberFrame(Framework.FrameFinal('', 0.7));
            };

            that.updateQuery = function() {
                var st = that.ctrl_searchString.getValue();
                var queryElements = []
                $.each(MetaData.customProperties, function(idx, propInfo) {
                    if (propInfo.tableid == that.tableInfo.id) {
                        if ( propInfo.settings.Search == 'StartPattern' )
                            queryElements.push( SQL.WhereClause.CompareFixed(propInfo.propid,'STARTSWITH', st) );
                        if ( (propInfo.settings.Search == 'Pattern') || ( (propInfo.settings.Search == 'None') && (propInfo.propid == that.tableInfo.primkey))  )
                            queryElements.push( SQL.WhereClause.CompareFixed(propInfo.propid,'CONTAINS', st) );
                        if ( propInfo.settings.Search == 'Match' )
                            queryElements.push( SQL.WhereClause.CompareFixed(propInfo.propid,'=', st) );

                    }
                });
                if (queryElements.length == 0) {
                    alert('No searchable properties defined for this data table');
                }
                that.myTable.setQuery(SQL.WhereClause.OR(queryElements));
                that.myTable.reLoadTable();
            };

            that.createPanels = function() {
                that.panelTable = MiscUtils.createDataItemTable(that.frameBody, that.tableInfo, that.query, {hasSelection: false });
                that.myTable = that.panelTable.getTable();

                that.ctrl_searchString = Controls.Edit(null,{ size: 30, value: '' }).setOnChanged(DQX.debounce(that.updateQuery,200)).setHasDefaultFocus();

                that.panelButtons = Framework.Form(that.frameButtons);

                var findstr = 'in '
                $.each(MetaData.customProperties, function(idx, propInfo) {
                    if (propInfo.tableid == that.tableInfo.id) {
                        if ( (propInfo.settings.Search != 'None') || (propInfo.propid == that.tableInfo.primkey) )
                            findstr += ' ' + propInfo.name
                    }
                });

                that.panelButtons.addControl(Controls.CompoundHor([
                    Controls.Static('<b>Search for:</b>'),
                    Controls.HorizontalSeparator(7),
                    that.ctrl_searchString,
                    Controls.HorizontalSeparator(7),
                    Controls.Static(findstr)
                ]));

            };

            that.onClose = function() {
                $.each(that.eventids,function(idx,eventid) {
                    Msg.delListener(eventid);
                });
            };

            that.create();
        }

        return FindDataItem;
    });

