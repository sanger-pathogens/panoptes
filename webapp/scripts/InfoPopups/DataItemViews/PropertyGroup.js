// This file is part of Panoptes - (C) Copyright 2014, CGGH <info@cggh.org>
// This program is free software licensed under the GNU Affero General Public License. 
// You can find a copy of this license in LICENSE in the top directory of the source code or at <http://opensource.org/licenses/AGPL-3.0>
define(["require", "DQX/base64", "DQX/Application", "DQX/Framework", "DQX/Controls", "DQX/Msg", "DQX/SQL", "DQX/DocEl", "DQX/Utils", "DQX/QueryTable", "DQX/Map", "DQX/SVG",
    "DQX/Wizard", "DQX/Popup", "DQX/PopupFrame", "DQX/ChannelPlot/GenomePlotter", "DQX/ChannelPlot/ChannelYVals", "DQX/ChannelPlot/ChannelPositions", "DQX/ChannelPlot/ChannelSequence","DQX/DataFetcher/DataFetchers", "DQX/DataFetcher/DataFetcherSummary",
    "MetaData", "Utils/GetFullDataItemInfo", "Utils/MiscUtils"
],
    function (require, base64, Application, Framework, Controls, Msg, SQL, DocEl, DQX, QueryTable, Map, SVG,
              Wizard, Popup, PopupFrame, GenomePlotter, ChannelYVals, ChannelPositions, ChannelSequence, DataFetchers, DataFetcherSummary,
              MetaData, GetFullDataItemInfo, MiscUtils
        ) {

        var PropertyGroup = {};

        PropertyGroup.create = function(viewSettings, initialItemData) {
            var that = {};
            var tableInfo = MetaData.getTableInfo(initialItemData.tableid);

            that.createFrames = function(parent) {
                var name = '-Absent-';
                var groupInfo = tableInfo.propertyGroupMap[viewSettings.GroupId];
                if (groupInfo)
                    name = groupInfo.Name;
                that.frameFields = Framework.FrameFinal('', 1).setAllowScrollBars(true,true)
                    .setDisplayTitle(name);
                parent.addMemberFrame(that.frameFields);
                return that.frameFields;
            };

            that.createPanels = function() {
                that.setContent(initialItemData)
            };

            that.setContent = function (itemData) {
                that.id = DQX.getNextUniqueID();
                var content = '<div id="'+ id + '" style="padding:8px">';
                content += "<table>";
                var groupInfo = tableInfo.propertyGroupMap[viewSettings.GroupId];
                if (groupInfo) {
                    $.each(groupInfo.properties, function(idx, propInfo) {
                    content += '<tr>';
                    content += '<td style="padding-bottom:3px;padding-top:3px;white-space:nowrap" title="{hint}"><b>{name}</b></td>'.DQXformat({
                        hint: (propInfo.settings.Description)||'',
                        name: propInfo.name
                    });
                    var fieldContent = itemData.fields[propInfo.propid];
                    content += '<td style="padding-left:5px;word-wrap:break-word;">' + propInfo.toDisplayString(fieldContent) + "</td>";
                    content += "</tr>";
                    });
                }
                content += "</table>";
                content += "</div>";

                that.frameFields.setContentHtml(content);
            };

            that.update = function(newItemData) {
                $('#'+that.id).remove();
                that.setContent(newItemData);
            };


            that.onClose = function() {
            }

            return that;
        }

        return PropertyGroup;
    });



