/*-------------------------------------------------------------------------------*/
/* Copyright (C) 2013-2014                                                       */
/*                                                                               */
/* This file is part of ezilla.                                                  */
/*                                                                               */
/* This program is free software: you can redistribute it and/or modify it       */
/* under the terms of the GNU General Public License as published by             */
/* the Free Software Foundation, either version 3 of the License, or             */
/* (at your option) any later version.                                           */
/*                                                                               */
/* This program is distributed in the hope that it will be useful, but WITHOUT   */
/* ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS */
/* FOR A PARTICULAR PURPOSE. See the GNU General Public License                  */
/* for more details.                                                             */
/*                                                                               */
/* You should have received a copy of the GNU General Public License along with  */
/* this program. If not, see <http://www.gnu.org/licenses/>                      */
/*                                                                               */
/* Author: Chang-Hsing Wu <hsing _at_ nchc narl org tw>                          */
/*         Serena Yi-Lun Pan <serenapan _at_ nchc narl org tw>                   */
/*         Hsi-En Yu <yun _at_  nchc narl org tw>                                */
/*         Hui-Shan Chen  <chwhs _at_ nchc narl org tw>                          */
/*         Kuo-Yang Cheng  <kycheng _at_ nchc narl org tw>                       */
/*         CHI-MING Chen <jonchen _at_ nchc narl org tw>                         */
/*-------------------------------------------------------------------------------*/

var dashboard_tab_content = '<div>\
  <div id="one_per_row">\
  </div>\
  <div id="three_per_row" class="row">\
  </div>\
  <div id="two_per_row" class="row">\
  </div>\
  <div id="one_footer">\
  </div>\
</div>\
';

var widgets = {
  "storage" : '<fieldset>\
        <legend class="span-dashboard"><i class="fa fa-fw fa-lg fa-upload"></i> '+tr("Storage")+'</legend>\
        <div class="row totals-info">\
            <div class="small-6 large-6 columns text-right">\
              <h4 class="subheader">\
              <span class="total_images subheader"/><br>\
              <span class="size_images subheader"/>\
              </h4>\
            </div>\
            <div class="small-6 large-6 columns text-left">\
              <h4 class="subheader">\
              <small>'+tr("IMAGES")+'</small><br>\
              <small>'+tr("USED")+'</small>\
              </h4>\
            </div>\
        </div>\
      </fieldset>',
  "users" : '<fieldset>\
        <legend class="span-dashboard"><i class="fa fa-fw fa-lg fa-user"></i> '+tr("Users")+'</legend>\
        <div class="row totals-info">\
            <div class="small-6 large-6 columns text-right">\
              <h4 class="subheader">\
              <span class="subheader total_users">-</span><br>\
              <span class="subheader total_groups">-</span>\
              </h4>\
            </div>\
            <div class="small-6 large-6 columns text-left">\
              <h4 class="subheader">\
              <small>'+tr("USERS")+'</small><br>\
              <small>'+tr("GROUPS")+'</small>\
              </h4>\
            </div>\
        </div>\
      </fieldset>',
  "network" : '<fieldset>\
        <legend class="span-dashboard"><i class="fa fa-fw fa-lg fa-sitemap"></i> '+tr("Network")+'</legend>\
        <div class="row totals-info">\
            <div class="small-6 large-6 columns text-right">\
              <h4 class="subheader">\
              <span class="total_vnets subheader"/><br>\
              <span class="addresses_vnets subheader"/>\
              </h4>\
            </div>\
            <div class="small-6 large-6 columns text-left">\
              <h4 class="subheader">\
              <small>'+tr("VNETS")+'</small><br>\
              <small>'+tr("USED IPs")+'</small>\
              </h4>\
            </div>\
        </div>\
      </fieldset>',
  "hosts" : '<fieldset class="dashboard-panel">\
        <legend class="span-dashboard"><i class="fa fa-fw fa-lg fa-hdd-o"></i> '+tr("Hosts")+'</legend>\
        <div class="row  totals-info">\
          <div class="small-3 large-3 columns centered">\
            <div class="small-6 large-6 columns text-right">\
              <h4 class="subheader">\
                <span class="total_hosts subheader"/><br>\
                <span class="on_hosts subheader success-color"/><br>\
                <span class="off_hosts subheader"/><br>\
                <span class="error_hosts subheader alert-color"/><br>\
              </h4>\
            </div>\
            <div class="small-6 large-6 columns text-left">\
              <h4 class="subheader">\
                <small>'+tr("TOTAL")+'</small><br>\
                <small class="success-color">'+tr("ON")+'</small><br>\
                <small>'+tr("OFF")+'</small><br>\
                <small class="alert-color">'+tr("ERROR")+'</small><br>\
              </h4>\
            </div>\
          </div>\
          <div class="small-9 large-9 columns">\
            <div class="row">\
              <div class="small-6 large-6 columns">\
                <div class="row graph_legend text-center">\
                  <div class="small-6 large-6 columns">\
                    <h4 class="subheader"><small>'+tr("CPU")+'</small></h4>\
                  </div>\
                </div>\
                <div class="row">\
                  <h4 class="subheader">\
                    <small class="subheader small-4 large-4 columns right">'+tr("Allocated")+
                    '</small>\
                  </h4>\
                  <div class="small-8 large-8 columns" id="dash_host_allocated_cpu" >\
                  </div>\
                </div>\
                <div class="row">\
                  <h4 class="subheader">\
                    <small class="subheader small-4 large-4 columns right">'+tr("Real")+
                    '</small>\
                  </h4>\
                  <div class="small-8 large-8 columns" id="dash_host_real_cpu" >\
                  </div>\
                </div>\
              </div>\
              <div class="small-6 large-6 columns">\
                <div class="row graph_legend text-center">\
                  <div class="small-6 large-6 columns">\
                    <h4 class="subheader"><small>'+tr("MEMORY")+'</small></h4>\
                  </div>\
                </div>\
                <div class="row">\
                  <h4 class="subheader">\
                    <small class="subheader small-4 large-4 columns right">'+tr("Allocated")+
                    '</small>\
                  </h4>\
                  <div class="small-8 large-8 columns" id="dash_host_allocated_mem" >\
                  </div>\
                </div>\
                <div class="row">\
                  <h4 class="subheader">\
                    <small class="subheader small-4 large-4 columns right">'+tr("Real")+
                    '</small>\
                  </h4>\
                  <div class="small-8 large-8 columns" id="dash_host_real_mem" >\
                  </div>\
                </div>\
              </div>\
            </div>\
          </div>\
          <div class="small-1 large-1 columns">\
          </div>\
        </div>\
      </fieldset>',
  "vms" : '<fieldset class="dashboard-panel">\
        <legend class="span-dashboard"><i class="fa fa-fw fa-lg fa-cloud"></i> '+tr("Virtual Machines")+'</legend>\
        <div class="row totals-info">\
          <div class="small-3 large-3 columns">\
            <div class="small-6 large-6 columns text-right">\
              <h4 class="subheader">\
              <span class="subheader total_vms"/><br>\
              <span class="subheader active_vms success-color"/><br>\
              <span class="subheader pending_vms"/><br>\
              <span class="subheader failed_vms alert-color"/>\
              </h4>\
            </div>\
            <div class="small-6 large-6 columns text-left">\
              <h4 class="subheader">\
              <small>'+tr("TOTAL")+'</small><br>\
              <small class="success-color">'+tr("ACTIVE")+'</small><br>\
              <small>'+tr("PENDING")+'</small><br>\
              <small class="alert-color">'+tr("FAILED")+'</small>\
              </h4>\
            </div>\
          </div>\
          <div class="small-9 large-9 columns">\
            <div class="row graph_legend text-center">\
              <div class="small-6 large-6 columns">\
                <h4 class="subheader"><small>'+tr("REAL CAPACITY USAGE")+'</small></h4>\
              </div>\
            </div>\
            <div class="row">\
              <h4 class="subheader">\
                <small class="subheader small-2 large-2 columns right">'+tr("CPU")+
                '</small>\
              </h4>\
              <div class="small-10 large-10 columns" id="dash_vm_real_cpu" >\
              </div>\
            </div>\
            <div class="row">\
              <h4 class="subheader">\
                <small class="subheader small-2 large-2 columns right">'+tr("Memory")+
                '</small>\
              </h4>\
              <div class="small-10 large-10 columns" id="dash_vm_real_mem" >\
              </div>\
            </div>\
          </div>\
        </div>\
      </fieldset>',
  "user_quotas" : '<fieldset>\
      <legend class="span-dashboard"><i class="fa fa-fw fa-lg fa-align-left"></i> '+tr("User Quotas")+'</legend>\
      <div class="row" id="quotas_tab_user">\
        <div class="large-12 columns">'+
          '<div class="row">'+
            '<div class="large-8 large-centered columns">'+
              '<div class="text-center">'+
                '<span class="fa-stack fa-5x" style="color: #dfdfdf">'+
                  '<i class="fa fa-cloud fa-stack-2x"></i>'+
                  '<i class="fa fa-align-left fa-stack-1x fa-inverse"></i>'+
                '</span>'+
                '<br>'+
                '<p style="font-size: 18px; color: #999">'+
                  tr("There are no quotas defined")+
                '</p>'+
              '</div>'+
            '</div>'+
          '</div>'+
        '</div>\
      </div>\
    </fieldset>',
  "group_quotas" : '<fieldset>\
      <legend class="span-dashboard"><i class="fa fa-fw fa-lg fa-align-left"></i> '+tr("Group Quotas")+'</legend>\
        <div id="quotas_tab_group_TabBody" class="row">\
          <div class="large-12 columns">'+
            '<div class="row">'+
              '<div class="large-8 large-centered columns">'+
                '<div class="text-center">'+
                  '<span class="fa-stack fa-5x" style="color: #dfdfdf">'+
                    '<i class="fa fa-cloud fa-stack-2x"></i>'+
                    '<i class="fa fa-align-left fa-stack-1x fa-inverse"></i>'+
                  '</span>'+
                  '<br>'+
                  '<p style="font-size: 18px; color: #999">'+
                    tr("There are no quotas defined")+
                  '</p>'+
                '</div>'+
              '</div>'+
            '</div>'+
          '</div>\
        </div>\
        <div class="row">\
          <div class="large-12 columns">\
            <label>' + tr("Select group") + ':\
              <div id="quotas_tab_group_sel">\
              </div>\
            </label>\
          </div>\
        </div>\
    </fieldset>'
}

var widget_refresh = {
    "storage" : function(){
            Sunstone.runAction("Datastore.list");
        },
    "users" : function(){
            Sunstone.runAction("User.list");
        },
    "network" : function(){
            Sunstone.runAction("Network.list");
        },
    "hosts" : function(){
            Sunstone.runAction("Host.list");
        },
    "vms" : function(){
            Sunstone.runAction("VM.list");
        },
    "user_quotas" : refreshDashboardUserQuotas,
    "group_quotas" : refreshDashboardGroupQuotas
}

var dashboard_tab_actions = {
    "Dashboard.refresh" : {
        type: "custom",
        call: refreshDashboard
    },
    "dashboard-tab.refresh" : {
        type: "custom",
        call: refreshDashboard
    },
}

var quotas_tab_buttons = {
    "Dashboard.refresh" : {
        type: "action",
        layout: "refresh",
        alwaysActive: true
    },
    "Sunstone.toggle_top" : {
        type: "custom",
        layout: "top",
        alwaysActive: true
    }
}

var dashboard_tab = {
    title: '<i class="fa fa-lg fa-fw fa-tachometer"></i>&emsp;'+tr("Dashboard"),
    buttons: quotas_tab_buttons,
    content: dashboard_tab_content,
    showOnTopMenu: false,
    list_header: '<i class="fa fa-fw fa-tachometer"></i>&emsp;'+tr("Dashboard")
}

Sunstone.addActions(dashboard_tab_actions);
Sunstone.addMainTab('dashboard-tab',dashboard_tab);

var $dashboard;

// Quotas calls

function fillUserQuotasInfo(){
    OpenNebula.User.show({
        data : {
            id: '-1'
        },
        success: updateUserQuotasInfo
    });
}

var dashboard_current_gid = "-1";

function updateUserQuotasInfo(request,user_json) {
    var info = user_json.USER;

    dashboard_current_gid = user_json.USER.GID;

    var default_user_quotas = Quotas.default_quotas(info.DEFAULT_USER_QUOTAS)
    var quotas_tab_html = Quotas.vms(info, default_user_quotas);
    quotas_tab_html += Quotas.cpu(info, default_user_quotas);
    quotas_tab_html += Quotas.memory(info, default_user_quotas);
    quotas_tab_html += Quotas.volatile_size(info, default_user_quotas);
    quotas_tab_html += Quotas.image(info, default_user_quotas);
    quotas_tab_html += Quotas.network(info, default_user_quotas);
    quotas_tab_html += Quotas.datastore(info, default_user_quotas);

    if (quotas_tab_html == ""){
        quotas_tab_html = '<div class="row">'+
                    '<div class="large-8 large-centered columns">'+
                      '<div class="text-center">'+
                        '<span class="fa-stack fa-5x" style="color: #dfdfdf">'+
                          '<i class="fa fa-cloud fa-stack-2x"></i>'+
                          '<i class="fa fa-align-left fa-stack-1x fa-inverse"></i>'+
                        '</span>'+
                        '<br>'+
                        '<p style="font-size: 18px; color: #999">'+
                          tr("There are no quotas defined")+
                        '</p>'+
                      '</div>'+
                    '</div>'+
                  '</div>'
    }

    $("#quotas_tab_user", $dashboard).html(quotas_tab_html);
}

function fillGroupQuotasInfo(group_id){
      OpenNebula.Group.show({
        data : {
            id: group_id
        },
        success: updateGroupQuotasInfo
      });
}

function updateGroupQuotasInfo(request,group_json){
    var info = group_json.GROUP;

    var default_group_quotas = Quotas.default_quotas(info.DEFAULT_GROUP_QUOTAS);

    var quotas_tab_html = Quotas.vms(info, default_group_quotas);
    quotas_tab_html += Quotas.cpu(info, default_group_quotas);
    quotas_tab_html += Quotas.memory(info, default_group_quotas);
    quotas_tab_html += Quotas.volatile_size(info, default_group_quotas);
    quotas_tab_html += Quotas.image(info, default_group_quotas);
    quotas_tab_html += Quotas.network(info, default_group_quotas);
    quotas_tab_html += Quotas.datastore(info, default_group_quotas);

    if (quotas_tab_html == ""){
        quotas_tab_html = '<div class="row">'+
                    '<div class="large-8 large-centered columns">'+
                      '<div class="text-center">'+
                        '<span class="fa-stack fa-5x" style="color: #dfdfdf">'+
                          '<i class="fa fa-cloud fa-stack-2x"></i>'+
                          '<i class="fa fa-align-left fa-stack-1x fa-inverse"></i>'+
                        '</span>'+
                        '<br>'+
                        '<p style="font-size: 18px; color: #999">'+
                          tr("There are no quotas defined")+
                        '</p>'+
                      '</div>'+
                    '</div>'+
                  '</div>'
    }

    $("#quotas_tab_group_TabBody", $dashboard).html(quotas_tab_html);
}

function refreshDashboardUserQuotas(){
    fillUserQuotasInfo();
}

function refreshDashboardGroupQuotas(){
    gid = $("#quotas_tab_group_sel .resource_list_select", $dashboard).val();

    if (gid == "" || gid == undefined){
        gid = dashboard_current_gid;
    }

    fillGroupQuotasInfo(gid);

    insertSelectOptions('div#quotas_tab_group_sel', $dashboard, "Group", gid, false);
}

function refreshDashboard(){
    widget_types = ['widgets_three_per_row', 'widgets_two_per_row',
        'widgets_one_per_row', 'widgets_one_footer'];

    $.each(widget_types, function(index, widget_type){
        $.each(Config.dashboardWidgets(widget_type), function(id, widget){
            widget_refresh[widget]();
        })
    });
}

$(document).ready(function(){
    var tab_name = 'dashboard-tab';

    if (Config.isTabEnabled(tab_name)) {
        $dashboard = $('#dashboard-tab', main_tabs_context);

        $.each(Config.dashboardWidgets('widgets_three_per_row'), function(id, widget){
            var html = '<div class="small-4 large-4 columns">'+widgets[widget]+'</div>';
            $('#three_per_row', $dashboard).append(html);
        })

        $.each(Config.dashboardWidgets('widgets_two_per_row'), function(id, widget){
            var html = '<div class="small-6 large-6 columns">'+widgets[widget]+'</div>';
            $('#two_per_row', $dashboard).append(html);
        })

        $.each(Config.dashboardWidgets('widgets_one_per_row'), function(id, widget){
            var html = '<div class="row"><div class="large-12 columns">'+widgets[widget]+'</div></div>';
            $('#one_per_row', $dashboard).append(html);
        })

        $.each(Config.dashboardWidgets('widgets_one_footer'), function(id, widget){
            var html = '<div class="row"><div class="large-12 columns">'+widgets[widget]+'</div></div>';
            $('#one_footer', $dashboard).append(html);
        });

        $dashboard.off("change", "#quotas_tab_group_sel .resource_list_select");
        $dashboard.on("change", "#quotas_tab_group_sel .resource_list_select", function() {
            var value_str = $(this).val();
            if(value_str!="")
            {
                fillGroupQuotasInfo(value_str);
            }
        });

        $(document).foundation();
    }
});
