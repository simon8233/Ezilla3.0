/* -------------------------------------------------------------------------- */
/* Copyright 2002-2014, OpenNebula Project (OpenNebula.org), C12G Labs        */
/*                                                                            */
/* Licensed under the Apache License, Version 2.0 (the "License"); you may    */
/* not use this file except in compliance with the License. You may obtain    */
/* a copy of the License at                                                   */
/*                                                                            */
/* http://www.apache.org/licenses/LICENSE-2.0                                 */
/*                                                                            */
/* Unless required by applicable law or agreed to in writing, software        */
/* distributed under the License is distributed on an "AS IS" BASIS,          */
/* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.   */
/* See the License for the specific language governing permissions and        */
/* limitations under the License.                                             */
/* -------------------------------------------------------------------------- */

/*Virtual Machines tab plugin*/
var INCLUDE_URI = "vendor/noVNC/";
var VM_HISTORY_LENGTH = 40;

//Ezilla vnc passwd generater - Start
function generatepass(p_length){
    var keylist="abcdefghijklmnopqrstuvwxyz123456789"
    var temp=''
    temp=''
    for (i=0;i<p_length;i++)
        temp+=keylist.charAt(Math.floor(Math.random()*keylist.length))
    return temp
}
//Ezilla vnc passwd generater - End

function loadVNC(){
    var script = '<script src="vendor/noVNC/vnc.js"></script>';
    document.write(script);
}
loadVNC();

var VNCstates=[
  tr("RUNNING"),
  tr("SHUTDOWN"),
  tr("SHUTDOWN_POWEROFF"),
  tr("UNKNOWN"),
  tr("HOTPLUG"),
  tr("CANCEL"),
  tr("MIGRATE"),
  tr("HOTPLUG_SNAPSHOT"),
  tr("HOTPLUG_NIC"),
  tr("HOTPLUG_SAVEAS"),
  tr("HOTPLUG_SAVEAS_POWEROFF"),
  tr("HOTPLUG_SAVEAS_SUSPENDED"),
  tr("SHUTDOWN_UNDEPLOY")];

//Permanent storage for last value of aggregated network usage
//Used to calculate bandwidth
var netUsage = {
    time : new Date().getTime(),
    up : 0,
    down : 0
}

var create_vm_tmpl ='\
<div class="row">\
  <div class="large-12 columns">\
    <h3 id="create_vnet_header" class="subheader">'+tr("Create Virtual Machine")+'</h3>\
  </div>\
</div>\
<div class="reveal-body">\
  <form id="create_vm_form" action="">\
    <fieldset>\
      <legend>'+tr("Step 1: Specify a name and the number of instances")+'</legend>\
      <div class="row">\
        <div class="large-6 columns">\
            <label for="vm_name">'+tr("VM Name")+'\
              <span class="tip">'+tr("Defaults to template name when emtpy. You can use the wildcard &#37;i. When creating several VMs, &#37;i will be replaced with a different number starting from 0 in each of them")+'.</span>\
            </label>\
            <input type="text" name="vm_name" id="vm_name" />\
        </div>\
        <div class="large-6 columns">\
            <label for="vm_n_times">'+tr("Number of instances")+':\
              <span class="tip">'+tr("Number of Virtual Machines that will be created using this template")+'.</span>\
            </label>\
            <input type="text" name="vm_n_times" id="vm_n_times" value="1">\
        </div>\
      </div>\
<!--- Ezilla - Passwd - Start -->\
  <div class="row">\
     <div class="large-12 large-centered columns graphics">\
        <fieldset>\
          <legend>'+tr("Graphics")+'</legend>\
          <div class="row">\
            <div class="large-12 columns text-center">\
                <input type="radio" name="graphics_type" ID="radioVncType" value="VNC" checked><label for="radioVncType"> VNC  </label>\
                <input type="radio" name="graphics_type" ID="radioSpiceType" value="SPICE"><label for="radioSpiceType"> SPICE </label>\
            </div>\
          </div>\
        </fieldset>\
     </div>\
  </div>\
    <div class="show_hide" id="advanced_passwd">\
       <h4><small><i class=" fa fa-caret-down"/> '+tr("Password options")+'<a id="add_os_boot_opts" class="icon_left" href="#"></a></small></h4>\
    </div>\
    <div class="row">\
        <div class="advanced_passwd">\
             <div class="large-6 columns">\
                <label for="user_passwd">'+tr("User Password")+':\
                   <span class="tip">'+tr("Account will be created using this password in Virtual Machines")+'.</span>\
                </label>\
                <input type="password" name="user_passwd" id="user_passwd" />\
             </div>\
             <div class="large-6 columns">\
                <label for="user_passwd_confirm">'+tr("Confirm Password")+':\
                   <span class="tip">'+tr("Account will be created using this password in Virtual Machines")+'.</span>\
                </label>\
                <input type="password" name="user_passwd_confirm" id="user_passwd_confirm" />\
             </div>\
         </div>\
    </div>\
<!--- Ezilla - Passwd - End -->\
    </fieldset>\
    <fieldset>\
      <legend>'+tr("Step 2: Select a template")+'</legend>\
      <div class="row">\
        <div class="large-8 columns">\
           <button id="refresh_template_templates_table_button_class" type="button" class="button small radius secondary"><i class="fa fa-refresh" /></button>\
        </div>\
        <div class="large-4 columns">\
          <input id="template_templates_table_search" class="search" type="text" placeholder="'+tr("Search")+'"/>\
        </div>\
      </div>\
      <div class="row">\
        <div class="large-12 columns">\
          <table id="template_templates_table" class="datatable twelve">\
            <thead>\
              <tr>\
                <th></th>\
                <th>'+tr("ID")+'</th>\
                <th>'+tr("Owner")+'</th>\
                <th>'+tr("Group")+'</th>\
                <th>'+tr("Name")+'</th>\
                <th>'+tr("Registration time")+'</th>\
              </tr>\
            </thead>\
            <tbody id="tbodytemplates">\
            </tbody>\
          </table>\
        </div>\
      </div>\
      <div class="row hidden">\
        <div class="large-12 columns">\
          <label class="right inline" for="TEMPLATE_ID">'+tr("TEMPLATE_ID")+':</label>\
          <input type="text" id="TEMPLATE_ID" name="TEMPLATE_ID"/>\
        </div>\
      </div>\
      <div id="selected_template" class="vm_param row">\
        <div class="large-12 columns">\
          <span id="select_template" class="radius secondary label">'+tr("Please select a template from the list")+'</span>\
          <span id="template_selected" class="radius secondary label hidden">'+tr("You selected the following template:")+'</span>\
          <span class="radius label" type="text" id="TEMPLATE_NAME" name="template"></span>\
        </div>\
      </div>\
    </fieldset>\
    <div id="select_image_step">\
      <fieldset>\
        <legend>'+tr("Step 3: Select an operating system")+'</legend>\
        <div class="row collapse">\
          <div class="large-8 columns">\
             <button id="refresh_template_images_table_button_class" type="button" class="button small radius secondary"><i class="fa fa-refresh" /></button>\
          </div>\
          <div class="large-4 columns">\
            <input id="template_images_table_search" class="search" type="text" placeholder="'+tr("Search")+'"/>\
          </div>\
        </div>\
        <div class="row">\
          <div class="large-12 columns">\
            <table id="template_images_table" class="datatable twelve">\
              <thead>\
                <tr>\
                  <th></th>\
                  <th>'+tr("ID")+'</th>\
                  <th>'+tr("Owner")+'</th>\
                  <th>'+tr("Group")+'</th>\
                  <th>'+tr("Name")+'</th>\
                  <th>'+tr("Datastore")+'</th>\
                  <th>'+tr("Size")+'</th>\
                  <th>'+tr("Type")+'</th>\
                  <th>'+tr("Registration time")+'</th>\
                  <th>'+tr("Persistent")+'</th>\
                  <th>'+tr("Status")+'</th>\
                  <th>'+tr("#VMS")+'</th>\
                  <th>'+tr("Target")+'</th>\
                </tr>\
              </thead>\
              <tbody id="tbodyimages">\
              </tbody>\
            </table>\
          </div>\
        </div>\
        <div class="row hidden">\
          <div class="large-12 columns">\
            <label class="right inline" for="IMAGE_ID">'+tr("IMAGE_ID")+':</label>\
            <input type="text" id="IMAGE_ID" name="IMAGE_ID"/>\
          </div>\
        </div>\
        <div id="selected_image" class="vm_param row">\
          <div class="large-12 columns">\
            <span id="select_image" class="radius secondary label">'+tr("Please select an image from the list")+'</span>\
            <span id="image_selected" class="radius secondary label hidden">'+tr("You selected the following image:")+'</span>\
            <span class="radius label" type="text" id="IMAGE_NAME" name="image"></span>\
          </div>\
        </div>\
      </div>\
    </fieldset>\
    <div class="form_buttons reveal-footer">\
      <div class="form_buttons">\
         <button class="button radius right success" id="instantiate_vm_tenplate_proceed" value="Template.instantiate_vms">'+tr("Create")+'</button>\
      </div>\
    </div>\
    <a class="close-reveal-modal">&#215;</a>\
  </form>\
</div>';

var deploy_vm_tmpl ='\
<div class="row">\
  <div class="large-12 columns">\
    <h3 id="deploy_vm_header" class="subheader">'+tr("Deploy Virtual Machine")+'</h3>\
  </div>\
</div>\
<div class="reveal-body">\
  <form id="deploy_vm_form" action="">\
    <div class="row">\
      <fieldset>\
        <legend>'+tr("Select a Host")+'</legend>\
        <div class="row collapse">\
          <div class="large-8 columns">\
             <button id="refresh_deploy_hosts_table_button_class" type="button" class="button small radius secondary"><i class="fa fa-refresh" /></button>\
          </div>\
          <div class="large-4 columns">\
            <input id="deploy_hosts_table_search" type="text" class="search" placeholder="'+tr("Search")+'"/>\
          </div>\
        </div>\
        <div class="row collapse">\
          <div class="large-12 columns">\
            <table id="deploy_datatable_hosts" class="datatable twelve">\
              <thead>\
                <tr>\
                  <th></th>\
                  <th>' + tr("ID") + '</th>\
                  <th>' + tr("Name") + '</th>\
                  <th>' + tr("Cluster") + '</th>\
                  <th>' + tr("RVMs") + '</th>\
                  <th>' + tr("Real CPU") + '</th>\
                  <th>' + tr("Allocated CPU") + '</th>\
                  <th>' + tr("Real MEM") + '</th>\
                  <th>' + tr("Allocated MEM") + '</th>\
                  <th>' + tr("Status") + '</th>\
                  <th>' + tr("IM MAD") + '</th>\
                  <th>' + tr("VM MAD") + '</th>\
                  <th>' + tr("Last monitored on") + '</th>\
                </tr>\
              </thead>\
              <tbody id="tbodyhosts">\
              </tbody>\
            </table>\
          </div>\
        </div>\
        <div class="row hidden">\
          <div class="large-12 columns">\
            <label class="right inline" for="HOST_ID">'+tr("HOST_ID")+':</label>\
            <input type="text" id="HOST_ID" name="HOST_ID"/>\
          </div>\
        </div>\
        <br>\
        <div id="selected_host" class="vm_param row">\
          <div class="large-12 columns">\
            <span id="select_host" class="radius secondary label">'+tr("Please select a Host from the list")+'</span>\
            <span id="host_selected" class="radius secondary label hidden">'+tr("You selected the following Host:")+'</span>\
            <span class="radius label" type="text" id="HOST_NAME" name="host"></span>\
          </div>\
        </div>\
      </fieldset>\
    </div>\
    <dl class="accordion" id="advanced_toggle" data-accordion>\
         <dd><a href="#advanced_deploy"> '+tr("Advanced options")+'</a></dd>\
    </dl>\
         <div id="advanced_deploy" class="row content">\
            <div class="row">\
                <div class="large-6 columns">\
                    <input type="checkbox" name="enforce" id="enforce"/>\
                    <label for="enforce">'+tr("Enforce")+'\
                      <span class="tip">' + tr("If it is set to true, the host capacity will be checked. This will only affect oneadmin requests, regular users resize requests will always be enforced") +'</span>\
                    </label>\
                </div>\
            </div>\
            <br>\
            <fieldset>\
              <legend>'+tr("Select a datastore")+'</legend>\
              <div class="row collapse">\
                <div class="large-9 columns">\
                   <button id="refresh_deploy_datastores_table_button_class" type="button" class="button small radius secondary"><i class="fa fa-refresh" /></button>\
                </div>\
                <div class="large-3 columns">\
                  <input id="deploy_datastores_table_search" type="text" class="search" placeholder="'+tr("Search")+'"/>\
                </div>\
              </div>\
              <table id="deploy_datatable_datastores" class="datatable twelve">\
                <thead>\
                  <tr>\
                    <th></th>\
                    <th>'+tr("ID")+'</th>\
                    <th>'+tr("Owner")+'</th>\
                    <th>'+tr("Group")+'</th>\
                    <th>'+tr("Name")+'</th>\
                    <th>'+tr("Capacity")+'</th>\
                    <th>'+tr("Cluster")+'</th>\
                    <th>'+tr("Basepath")+'</th>\
                    <th>'+tr("TM MAD")+'</th>\
                    <th>'+tr("DS MAD")+'</th>\
                    <th>'+tr("Type")+'</th>\
                  </tr>\
                </thead>\
                <tbody id="tbodydatastores">\
                </tbody>\
              </table>\
              <div class="row hidden">\
                <div class="large-4 columns">\
                  <label class="right inline" for="DATASTORE_ID">'+tr("DATASTORE_ID")+':</label>\
                </div>\
                <div class="large-6 columns">\
                  <input type="text" id="DATASTORE_ID" name="DATASTORE_ID"/>\
                </div>\
                <div class="large-2 columns">\
                  <div class="tip">\
                  </div>\
                </div>\
              </div>\
              <br>\
              <div id="selected_datastore" class="vm_param kvm_opt xen_opt vmware_opt">\
                <span id="select_datastore" class="radius secondary label">'+tr("Please select a datastore from the list")+'</span>\
                <span id="datastore_selected" class="radius secondary label hidden">'+tr("You selected the following datastore:")+'</span>\
                <span class="radius label" type="text" id="DATASTORE_NAME" name="datastore"></span>\
              </div>\
            </fieldset>\
          </div>\
    <div class="form_buttons reveal-footer">\
      <div class="form_buttons">\
         <button class="button radius right success" id="deploy_vm_proceed" value="VM.deploy">'+tr("Deploy")+'</button>\
      </div>\
    </div>\
    <a class="close-reveal-modal">&#215;</a>\
  </form>\
</div>';

var migrate_vm_tmpl ='\
<div class="row">\
  <div class="large-12 columns">\
    <h3 id="migrate_vm_header" class="subheader">'+tr("Migrate Virtual Machine")+'</h3>\
  </div>\
</div>\
<div class="reveal-body">\
  <form id="migrate_vm_form" action="">\
    <div id="current_hosts_of_vms" class="row">\
    </div>\
    <br><br>\
    <div class="row">\
      <fieldset>\
        <legend>'+tr("Select a Host")+'</legend>\
        <div class="row collapse">\
          <div class="large-9 columns">\
             <button id="refresh_migrate_hosts_table_button_class" type="button" class="button small radius secondary"><i class="fa fa-refresh" /></button>\
          </div>\
          <div class="large-3 columns">\
            <input id="migrate_hosts_table_search" class="search" type="text" placeholder="'+tr("Search")+'"/>\
          </div>\
        </div>\
        <table id="migrate_datatable_hosts" class="datatable twelve">\
          <thead>\
            <tr>\
              <th></th>\
              <th>' + tr("ID") + '</th>\
              <th>' + tr("Name") + '</th>\
              <th>' + tr("Cluster") + '</th>\
              <th>' + tr("RVMs") + '</th>\
              <th>' + tr("Real CPU") + '</th>\
              <th>' + tr("Allocated CPU") + '</th>\
              <th>' + tr("Real MEM") + '</th>\
              <th>' + tr("Allocated MEM") + '</th>\
              <th>' + tr("Status") + '</th>\
              <th>' + tr("IM MAD") + '</th>\
              <th>' + tr("VM MAD") + '</th>\
              <th>' + tr("Last monitored on") + '</th>\
            </tr>\
          </thead>\
          <tbody id="tbodyhosts">\
          </tbody>\
        </table>\
        <div class="row hidden">\
          <div class="large-4 columns">\
            <label class="right inline" for="HOST_ID">'+tr("HOST_ID")+':</label>\
          </div>\
          <div class="large-6 columns">\
            <input type="text" id="HOST_ID" name="HOST_ID"/>\
          </div>\
          <div class="large-2 columns">\
            <div class="tip">\
            </div>\
          </div>\
        </div>\
        <br>\
        <div id="selected_host" class="vm_param kvm_opt xen_opt vmware_opt">\
          <span id="select_host" class="radius secondary label">'+tr("Please select a Host from the list")+'</span>\
          <span id="host_selected" class="radius secondary label hidden">'+tr("You selected the following Host:")+'</span>\
          <span class="radius label" type="text" id="HOST_NAME" name="host"></span>\
        </div>\
      </fieldset>\
    </div>\
    <br>\
    <br>\
    <dl class="accordion" id="advanced_migrate_toggle" data-accordion>\
         <dd><a href="#advanced_migrate"> '+tr("Advanced options")+'</a></dd>\
    </dl>\
    <div id="advanced_migrate" class="content">\
        <div class="row">\
            <div class="large-6 columns">\
                <input type="checkbox" name="enforce" id="enforce"/>\
                <label for="vm_id">'+tr("Enforce")+'\
                  <span class="tip">' + tr("If it is set to true, the host capacity will be checked. This will only affect oneadmin requests, regular users resize requests will always be enforced") +'</span>\
                </label>\
            </div>\
        </div>\
    </div>\
    <div class="form_buttons reveal-footer">\
      <div class="form_buttons">\
         <button class="button radius right success" id="migrate_vm_proceed" value="VM.migrate">'+tr("Migrate")+'</button>\
      </div>\
    </div>\
    <a class="close-reveal-modal">&#215;</a>\
  </form>\
</div>';

var vmachine_list_json = {};
var dataTable_vMachines;
var $create_vm_dialog;
var $deploy_vm_dialog;
var $migrate_vm_dialog;
var $vnc_dialog;
//Ezilla redir - Start
var $redir_dialog;
//Ezilla redir - End
var rfb;

var vm_actions = {
//Ezilla - Action - Start
    "VM.create_raw" : {
        type: "create",
        call: OpenNebula.VM.create,
        callback: function (params,extra_param){
                Sunstone.runAction("VM.list");
        },
        error: onError,
    },

    "VM.Template_submit" : {
        type: "single",
        call: OpenNebula.Template.show,
        callback:function (request,template) {
                var template_info = template.VMTEMPLATE;
                var tmp_template = template_info.TEMPLATE;
                var vm_name = $('#vm_name',$create_vm_dialog).val();
                var graphics_type = $("input[name='graphics_type']:checked" , $create_vm_dialog).val();
                var user_passwd = $('#user_passwd',$create_vm_dialog).val();
        var n_times = $('#vm_n_times',$create_vm_dialog).val();
        var n_times_int=1;
            var password_length = 8;
        var username_array=username.split('%');
        var image_id = $("#IMAGE_ID",$create_vm_dialog).val();
        if ( $.isNumeric(image_id) ){
            ostype = $("#IMAGE_OSTYPE",$create_vm_dialog).val();
            // fill image_id to template.
            tmp_template["DISK"]= {"IMAGE_ID" : image_id , "IMAGE_OSTYPE" : ostype };
            // fill image_ostype to template.
            tmp_template.CONTEXT["OSTYPE"] = ostype;
        }
        if (!$('#user_passwd',$create_vm_dialog).is(":hidden")){ // inloop vm need password initialization.
                tmp_template.CONTEXT["USERNAME"] = username_array[0];
                tmp_template.CONTEXT["USER_PASSWD"] = user_passwd;
                tmp_template.CONTEXT["ROOT_PASSWD"] = user_passwd;
        }
        if (typeof(tmp_template.CONTEXT.OSTYPE) != "undefined"){ // inloop select vm specific OS initialization 
            if (tmp_template.CONTEXT["OSTYPE"] == "WINDOWS") {
                tmp_template.CONTEXT["FILES"]="/usr/share/one/script/init.ps1";
            }
            else{
                tmp_template.CONTEXT["FILES"]="/usr/share/one/script/init.sh";
            }
        }
                tmp_template.GRAPHICS["PASSWD"]= generatepass(password_length);
                tmp_template.GRAPHICS["TYPE"]= graphics_type;

                if (n_times.length){
                        n_times_int=parseInt(n_times,10);
                };

                if (!vm_name.length){ //empty name use OpenNebula core default
                        var submit_template=convert_template_to_string(tmp_template).replace(/^[\r\n]+$/g, "");
                        var vm_temp = { "vm_raw" : submit_template };
                        var vm_json = { "vm" : vm_temp };
                        for (var i=0; i< n_times_int; i++){
                                Sunstone.runAction("VM.create_raw",vm_json);
                        };
                }else{
                        if (vm_name.indexOf("%i") == -1){ //no wildcard
                                tmp_template.NAME = vm_name;
                                var submit_template=convert_template_to_string(tmp_template).replace(/^[\r\n]+$/g, "");
                                var vm_temp = { "vm_raw" : submit_template };
                                var vm_json = { "vm" : vm_temp };
                                for (var i=0; i< n_times_int; i++){
                                        Sunstone.runAction("VM.create_raw",vm_json);
                                };
                        } else { //wildcard present: replace wildcard
                                var name = "";
                                for (var i=0; i< n_times_int; i++){
                                        name = vm_name.replace(/%i/gi,i);
                                        tmp_template.NAME = name;
                                        var vm_temp ="";
                                        var vm_json ="";
                                        var submit_template="";
                                        submit_template=convert_template_to_string(tmp_template).replace(/^[\r\n]+$/g, "");
                                        vm_temp = { "vm_raw" : submit_template };
                                        vm_json = { "vm" : vm_temp };
                                        Sunstone.runAction("VM.create_raw",vm_json);
                                };
                        };
                }
        },
        error: onError
    },

//Ezilla - Action - End 
    "VM.create" : {
        type: "custom",
        call: function(id,name) {
            Sunstone.runAction("Template.instantiate",[id],name);
            Sunstone.runAction("VM.list");
        },
        callback: addVMachineElement,
        error: onError
    },

    "VM.create_dialog" : {
        type: "custom",
        call: function(){
          popUpCreateVMDialog(false);
        }
    },

    "VM.easy_provision" : {
        type: "custom",
        call: function(){
          popUpCreateVMDialog(true);
        }
    },

    "VM.list" : {
        type: "list",
        call: OpenNebula.VM.list,
        callback: updateVMachinesView,
        error: onError
    },

    "VM.show" : {
        type: "single",
        call: OpenNebula.VM.show,
        callback: function(request, response){
            var tab = dataTable_vMachines.parents(".tab");

            if (Sunstone.rightInfoVisible(tab)) {
                // individual view
                updateVMInfo(request, response);
            }

            // datatable row
            updateVMachineElement(request, response);
        },
        error: onError
    },

    "VM.refresh" : {
        type: "custom",
        call : function (){
          var tab = dataTable_vMachines.parents(".tab");
          if (Sunstone.rightInfoVisible(tab)) {
            Sunstone.runAction("VM.show", Sunstone.rightInfoResourceId(tab))
          } else {
            waitingNodes(dataTable_vMachines);
            Sunstone.runAction("VM.list", {force: true});
          }
        }
    },

    "VM.deploy" : {
        type: "custom",
        call: function(){
          popUpDeployVMDialog();
        }
    },

    "VM.deploy_action" : {
        type: "single",
        call: OpenNebula.VM.deploy,
        callback: vmShow,
        error: onError,
        notify: true
    },

    "VM.migrate" : {
        type: "custom",
        call: function(){
          popUpMigrateVMDialog(false);
        }
    },

    "VM.migrate_action" : {
        type: "single",
        call: OpenNebula.VM.migrate,
        callback: vmShow,
        error: onError,
        notify: true
    },

    "VM.migrate_live" : {
        type: "custom",
        call: function(){
          popUpMigrateVMDialog(true);
        }
    },

    "VM.migrate_live_action" : {
        type: "single",
        call: OpenNebula.VM.livemigrate,
        callback: vmShow,
        error: onError,
        notify: true
    },

    "VM.hold" : {
        type: "multiple",
        call: OpenNebula.VM.hold,
        callback: vmShow,
        elements: vmElements,
        error: onError,
        notify: true
    },

    "VM.release" : {
        type: "multiple",
        call: OpenNebula.VM.release,
        callback: vmShow,
        elements: vmElements,
        error: onError,
        notify: true
    },

    "VM.suspend" : {
        type: "multiple",
        call: OpenNebula.VM.suspend,
        callback: vmShow,
        elements: vmElements,
        error: onError,
        notify: true
    },

    "VM.resume" : {
        type: "multiple",
        call: OpenNebula.VM.resume,
        callback: vmShow,
        elements: vmElements,
        error: onError,
        notify: true
    },

    "VM.stop" : {
        type: "multiple",
        call: OpenNebula.VM.stop,
        callback: vmShow,
        elements: vmElements,
        error: onError,
        notify: true
    },

    "VM.boot" : {
        type: "multiple",
        call: OpenNebula.VM.restart,
        callback: vmShow,
        elements: vmElements,
        error: onError,
        notify: true
    },

    "VM.reboot_hard" : {
        type: "multiple",
        call: OpenNebula.VM.reset,
        callback: vmShow,
        elements: vmElements,
        error: onError,
        notify: true
    },

    "VM.delete_recreate" : {
        type: "multiple",
        call: OpenNebula.VM.resubmit,
        callback: vmShow,
        elements: vmElements,
        error: onError,
        notify: true
    },

    "VM.reboot" : {
        type: "multiple",
        call: OpenNebula.VM.reboot,
        callback: vmShow,
        elements: vmElements,
        error: onError,
        notify: true
    },

    "VM.poweroff" : {
        type: "multiple",
        call: OpenNebula.VM.poweroff,
        callback: vmShow,
        elements: vmElements,
        error: onError,
        notify: true
    },

    "VM.poweroff_hard" : {
        type: "multiple",
        call: OpenNebula.VM.poweroff_hard,
        callback: vmShow,
        elements: vmElements,
        error: onError,
        notify: true
    },

    "VM.undeploy" : {
        type: "multiple",
        call: OpenNebula.VM.undeploy,
        callback: vmShow,
        elements: vmElements,
        error: onError,
        notify: true
    },

    "VM.undeploy_hard" : {
        type: "multiple",
        call: OpenNebula.VM.undeploy_hard,
        callback: vmShow,
        elements: vmElements,
        error: onError,
        notify: true
    },

    "VM.saveas" : {
        type: "single",
        call: OpenNebula.VM.saveas,
        callback: function(request) {
            Sunstone.runAction("VM.show", request.request.data[0]);
            OpenNebula.Helper.clear_cache("IMAGE");
        },
        error:onError,
        notify: true
    },

    "VM.snapshot_create" : {
        type: "single",
        call: OpenNebula.VM.snapshot_create,
        callback: function(request) {
            Sunstone.runAction("VM.show", request.request.data[0]);
        },
        error:onError,
        notify: true
    },
    "VM.snapshot_revert" : {
        type: "single",
        call: OpenNebula.VM.snapshot_revert,
        callback: function(request) {
            Sunstone.runAction("VM.show", request.request.data[0]);
        },
        error:onError,
        notify: true
    },
    "VM.snapshot_delete" : {
        type: "single",
        call: OpenNebula.VM.snapshot_delete,
        callback: function(request) {
            Sunstone.runAction("VM.show", request.request.data[0]);
        },
        error:onError,
        notify: true
    },

    "VM.shutdown" : {
        type: "multiple",
        call: OpenNebula.VM.shutdown,
        callback: vmShow,
        elements: vmElements,
        error: onError,
        notify: true
    },

    "VM.shutdown_hard" : {
        type: "multiple",
        call: OpenNebula.VM.cancel,
        callback: vmShow,
        elements: vmElements,
        error: onError,
        notify: true
    },

    "VM.delete" : {
        type: "multiple",
        call: OpenNebula.VM.del,
        callback: deleteVMachineElement,
        elements: vmElements,
        error: onError,
        notify: true
    },

    "VM.recover" : {
        type: "multiple",
        call: OpenNebula.VM.recover,
        callback: vmShow,
        elements: vmElements,
        error: onError,
        notify: true
    },

    "VM.resched" : {
        type: "multiple",
        call: OpenNebula.VM.resched,
        callback: vmShow,
        elements: vmElements,
        error: onError,
        notify: true
    },

    "VM.unresched" : {
        type: "multiple",
        call: OpenNebula.VM.unresched,
        callback: vmShow,
        elements: vmElements,
        error: onError,
        notify: true
    },

    "VM.log" : {
        type: "single",
        call: OpenNebula.VM.log,
        callback: function(req,res) {
            //after calling VM.log we process the answer
            //update the tab and pop it up again
            res = res['vm_log'];
            var log_lines = res.split("\n");
            var colored_log = '';
            for (var i = 0; i < log_lines.length;i++){
                var line = log_lines[i];
                if (line.match(/\[E\]/)){
                    line = '<span class="vm_log_error">'+line+'</span>';
                }
                colored_log += line + "<br>";
            }

            $('#vm_log_tab').html('<div class="row"><div class="large-11 small-centered columns log-tab">'+colored_log+'</div></div>')
        },
        error: function(request,error_json){
            $("#vm_log pre").html('');
            onError(request,error_json);
        }
    },

    "VM.startvnc" : {
        type: "custom",
        call: function(){
          popUpVnc();
        }
    },

    "VM.startvnc_action" : {
        type: "single",
        call: OpenNebula.VM.startvnc,
        callback: vncCallback,
        error: onError,
        notify: true
    },
//Ezilla redirect start
    "VM.redirect" : {
        type: "single",
        call : OpenNebula.VM.redirect,
        callback: RedirectPortCallback,
        error: onError,
        notify: true
    },
    "VM.redirspice" : {
        type: "single",
        call : OpenNebula.VM.redirspice,
        callback: RedirectPortCallback,
        error: onError,
        notify: true
    },
//Ezilla redirect End

    "VM.monitor" : {
        type: "monitor",
        call : OpenNebula.VM.monitor,
        callback: function(req,response) {
            var vm_graphs = [
                {
                    monitor_resources : "CPU",
                    labels : "Real CPU",
                    humanize_figures : false,
                    div_graph : $(".vm_cpu_graph")
                },
                {
                    monitor_resources : "MEMORY",
                    labels : "Real MEM",
                    humanize_figures : true,
                    div_graph : $(".vm_memory_graph")
                },
                { labels : "Network reception",
                  monitor_resources : "NET_RX",
                  humanize_figures : true,
                  convert_from_bytes : true,
                  div_graph : $("#vm_net_rx_graph")
                },
                { labels : "Network transmission",
                  monitor_resources : "NET_TX",
                  humanize_figures : true,
                  convert_from_bytes : true,
                  div_graph : $("#vm_net_tx_graph")
                },
                { labels : "Network reception speed",
                  monitor_resources : "NET_RX",
                  humanize_figures : true,
                  convert_from_bytes : true,
                  y_sufix : "B/s",
                  derivative : true,
                  div_graph : $("#vm_net_rx_speed_graph")
                },
                { labels : "Network transmission speed",
                  monitor_resources : "NET_TX",
                  humanize_figures : true,
                  convert_from_bytes : true,
                  y_sufix : "B/s",
                  derivative : true,
                  div_graph : $("#vm_net_tx_speed_graph")
                }
            ];

            // The network speed graphs require the derivative of the data,
            // and this process is done in place. They must be the last
            // graphs to be processed

            for(var i=0; i<vm_graphs.length; i++) {
                plot_graph(
                    response,
                    vm_graphs[i]
                );
            }
        },
        error: vmMonitorError
    },

    "VM.chown" : {
        type: "multiple",
        call: OpenNebula.VM.chown,
        callback: function(request) {
            Sunstone.runAction('VM.show',request.request.data[0]);
        },
        elements: vmElements,
        error: onError,
        notify: true
    },
    "VM.chgrp" : {
        type: "multiple",
        call: OpenNebula.VM.chgrp,
        callback: function(request) {
            Sunstone.runAction("VM.show",request.request.data[0]);
        },
        elements: vmElements,
        error: onError,
        notify: true
    },

    "VM.chmod" : {
        type: "single",
        call: OpenNebula.VM.chmod,
        error: onError,
        notify: true
    },
    "VM.attachdisk" : {
        type: "single",
        call: OpenNebula.VM.attachdisk,
        callback: function(request) {
            Sunstone.runAction("VM.show", request.request.data[0][0]);
        },
        error: onError,
        notify: true
    },
    "VM.detachdisk" : {
        type: "single",
        call: OpenNebula.VM.detachdisk,
        callback: function(request) {
            Sunstone.runAction("VM.show", request.request.data[0][0]);
        },
        error: onError,
        notify: true
    },
    "VM.attachnic" : {
        type: "single",
        call: OpenNebula.VM.attachnic,
        callback: function(request) {
            Sunstone.runAction("VM.show", request.request.data[0]);
        },
        error: onError,
        notify: true
    },
    "VM.resize" : {
        type: "single",
        call: OpenNebula.VM.resize,
        callback: function(request) {
            Sunstone.runAction("VM.show", request.request.data[0]);
        },
        error: onError,
        notify: true
    },
    "VM.detachnic" : {
        type: "single",
        call: OpenNebula.VM.detachnic,
        callback: function(request) {
            Sunstone.runAction("VM.show", request.request.data[0]);
        },
        error: onError,
        notify: true
    },
    "VM.help" : {
        type: "custom",
        call: function() {
            hideDialog();
            $('div#vms_tab div.legend_div').slideToggle();
        }
    },

    "VM.rename" : {
        type: "single",
        call: OpenNebula.VM.rename,
        callback: function(request) {
            notifyMessage(tr("VirtualMachine renamed correctly"));
            Sunstone.runAction('VM.show',request.request.data[0]);
        },
        error: onError,
        notify: true
    },

    "VM.update_template" : {  // Update template
        type: "single",
        call: OpenNebula.VM.update,
        callback: function(request,response){
           notifyMessage(tr("VirtualMachine updated correctly"));
           Sunstone.runAction('VM.show',request.request.data[0]);
        },
        error: onError
    },

    "VM.update_actions" : {  // Update template
        type: "single",
        call: OpenNebula.VM.update,
        callback: function(request,response){
           notifyMessage(tr("VirtualMachine updated correctly"));
           Sunstone.runAction("VM.show", request.request.data[0]);
        },
        error: onError
    },
};



var vm_buttons = {
    "VM.refresh" : {
        type: "action",
        layout: "refresh",
        alwaysActive: true
    },
//    "Sunstone.toggle_top" : {
//        type: "custom",
//        layout: "top",
//        alwaysActive: true
//    },
    "VM.create_dialog" : {
        type: "action",
        layout: "create",
        alwaysActive: true
    },
    "VM.easy_provision" : {
        type: "action",
        layout: "create",
        text: tr("Launch"),
        alwaysActive: true
    },
    "VM.chown" : {
        type: "confirm_with_select",
        text: tr("Change owner"),
        select: "User",
        layout: "user_select",
        tip: tr("Select the new owner")+":",
        condition: mustBeAdmin
    },

    "VM.chgrp" : {
        type: "confirm_with_select",
        text: tr("Change group"),
        select: "Group",
        layout: "user_select",
        tip: tr("Select the new group")+":",
        condition: mustBeAdmin
    },
    "VM.deploy" : {
        type: "action",
        text: tr("Deploy"),
        tip: tr("This will deploy the selected VMs on the chosen host"),
        layout: "vmsplanification_buttons",
        condition: mustBeAdmin
    },
    "VM.migrate" : {
        type: "action",
        text: tr("Migrate"),
        tip: tr("This will migrate the selected VMs to the chosen host"),
        layout: "vmsplanification_buttons",
        condition: mustBeAdmin

    },
    "VM.migrate_live" : {
        type: "action",
        text: tr("Migrate") + ' <span class="label secondary radius">live</span>',
        tip: tr("This will live-migrate the selected VMs to the chosen host"),
        layout: "vmsplanification_buttons",
        condition: mustBeAdmin
    },
    "VM.hold" : {
        type: "action",
        text: tr("Hold"),
        tip: tr("This will hold selected pending VMs from being deployed"),
        layout: "vmsplanification_buttons",
    },
    "VM.release" : {
        type: "action",
        text: tr("Release"),
        layout: "vmsplanification_buttons",
        tip: tr("This will release held machines")
    },
    "VM.suspend" : {
        type: "action",
        text: tr("Suspend"),
        layout: "vmspause_buttons",
        tip: tr("This will suspend selected machines")
    },
    "VM.resume" : {
        type: "action",
        text: '<i class="fa fa-play"/>',
        layout: "vmsplay_buttons",
        tip: tr("This will resume selected VMs")
    },
    "VM.stop" : {
        type: "action",
        text: tr("Stop"),
        layout: "vmsstop_buttons",
        tip: tr("This will stop selected VMs")
    },
    "VM.boot" : {
        type: "action",
        text: tr("Boot"),
        layout: "vmsplanification_buttons",
        tip: tr("This will force the hypervisor boot action of VMs stuck in UNKNOWN or BOOT state")
    },
    "VM.reboot" : {
        type: "action",
        text: tr("Reboot"),
        layout: "vmsrepeat_buttons",
        tip: tr("This will send a reboot action to running VMs")
    },
    "VM.reboot_hard" : {
        type: "action",
        text: tr("Reboot") + ' <span class="label secondary radius">hard</span>',
        layout: "vmsrepeat_buttons",
        tip: tr("This will perform a hard reboot on selected VMs")
    },
    "VM.poweroff" : {
        type: "action",
        text: tr("Power Off"),
        layout: "vmspause_buttons",
        tip: tr("This will send a power off signal to running VMs. They can be resumed later.")
    },
    "VM.poweroff_hard" : {
        type: "action",
        text: tr("Power Off") + ' <span class="label secondary radius">hard</span>',
        layout: "vmspause_buttons",
        tip: tr("This will send a forced power off signal to running VMs. They can be resumed later.")
    },
    "VM.undeploy" : {
        type: "action",
        text: tr("Undeploy"),
        layout: "vmsstop_buttons",
        tip: tr("Shuts down the given VM. The VM is saved in the system Datastore.")
    },
    "VM.undeploy_hard" : {
        type: "action",
        text: tr("Undeploy") + ' <span class="label secondary radius">hard</span>',
        layout: "vmsstop_buttons",
        tip: tr("Shuts down the given VM. The VM is saved in the system Datastore.")
    },
    "VM.shutdown" : {
        type: "confirm",
        text: tr("Shutdown"),
        layout: "vmsdelete_buttons",
        tip: tr("This will initiate the shutdown process in the selected VMs")
    },
    "VM.shutdown_hard" : {
        type: "confirm",
        text: tr("Shutdown") + ' <span class="label secondary radius">hard</span>',
        layout: "vmsdelete_buttons",
        tip: tr("This will initiate the shutdown-hard (forced) process in the selected VMs")
    },

    "VM.delete" : {
        type: "confirm",
        text: tr("Delete"),
        layout: "vmsdelete_buttons",
        tip: tr("This will delete the selected VMs from the database")
    },
    "VM.delete_recreate" : {
        type: "confirm",
        text: tr("Delete") + ' <span class="label secondary radius">recreate</span>',
        layout: "vmsrepeat_buttons",
        tip: tr("This will delete and recreate VMs to PENDING state")
    },
    "VM.resched" : {
        type: "action",
        text: tr("Reschedule"),
        layout: "vmsplanification_buttons",
        tip: tr("This will reschedule selected VMs")
    },
    "VM.unresched" : {
        type: "action",
        text: tr("Un-Reschedule"),
        layout: "vmsplanification_buttons",
        tip: tr("This will cancel the rescheduling for the selected VMs")
    },
    "VM.recover" : {
        type: "confirm_with_select",
        text: tr("Recover"),
        layout: "vmsplanification_buttons",
        custom_select: '<select class="resource_list_select"><option value="success">' + tr("success") + '</option>\
                 <option value="failure">' + tr("failure") + '</option></select>',
        tip: tr("Recovers a stuck VM that is waiting for a driver operation. \
                The recovery may be done by failing or succeeding the pending operation. \
                YOU NEED TO MANUALLY CHECK THE VM STATUS ON THE HOST, to decide if the operation \
                was successful or not.")
    },
    "VM.startvnc" : {
        type: "action",
        text: '<i class="fa fa-desktop" style="color: rgb(111, 111, 111)"/> '+tr("VNC"),
        custom_classes: "only-right-info vnc-right-info",
        tip: tr("VNC")
    }
}

var vm_info_panel = {

};

var vms_tab = {
    title: tr("Virtual Machines"),
    resource: 'VM',
    buttons: vm_buttons,
    tabClass: 'subTab',
    parentTab: 'vresources-tab',
    search_input: '<input id="vms_search" type="text" placeholder="'+tr("Search")+'" />',
    list_header: '<i class="fa fa-fw fa-cloud"></i>&emsp;'+tr("Virtual Machines"),
    info_header: '<i class="fa fa-fw fa-cloud"></i>&emsp;'+tr("Virtual Machine"),
    subheader: '<span class="total_vms"/> <small>'+tr("TOTAL")+'</small>&emsp;\
        <span class="active_vms"/> <small>'+tr("ACTIVE")+'</small>&emsp;\
        <span class="off_vms"/> <small>'+tr("OFF")+'</small>&emsp;\
        <span class="pending_vms"/> <small>'+tr("PENDING")+'</small>&emsp;\
        <span class="failed_vms"/> <small>'+tr("FAILED")+'</small>',
    table: '<table id="datatable_vmachines" class="dataTable" cellpadding="0" cellspacing="0" border="0" >\
        <thead>\
          <tr>\
            <th class="check"><input type="checkbox" class="check_all" value=""></input></th>\
            <th>'+tr("ID")+'</th>\
            <th>'+tr("Owner")+'</th>\
            <th>'+tr("Group")+'</th>\
            <th>'+tr("Name")+'</th>\
            <th>'+tr("Status")+'</th>\
            <th>'+tr("Used CPU")+'</th>\
            <th>'+tr("Used Memory")+'</th>\
            <th>'+tr("Host")+'</th>\
            <th>'+tr("IPs")+'</th>\
            <th>'+tr("Start Time")+'</th>\
            <th>'+tr("VNC/SPICE")+'</th>\
            <th>'+tr("Endpoint")+'</th>\
          </tr>\
        </thead>\
        <tbody id="tbodyvmachines">\
        </tbody>\
      </table>'

};

Sunstone.addActions(vm_actions);
Sunstone.addMainTab('vms-tab',vms_tab);
Sunstone.addInfoPanel('vm_info_panel',vm_info_panel);


function vmElements() {
    return getSelectedNodes(dataTable_vMachines);
};

function vmShow(req) {
    Sunstone.runAction("VM.show",req.request.data[0]);
};

// Returns a human readable running time for a VM
function str_start_time(vm){
    return pretty_time(vm.STIME);
};


// Return the IP or several IPs of a VM
function ip_str(vm){
    var nic = vm.TEMPLATE.NIC;
    var ip = '--';
    if ($.isArray(nic)) {
        ip = '';
        $.each(nic, function(index,value){
            ip += value.IP+'<br />';
        });
    } else if (nic && nic.IP) {
        ip = nic.IP;
    };
    return ip;
};

// Returns an array formed by the information contained in the vm_json
// and ready to be introduced in a dataTable
function vMachineElementArray(vm_json){
    var vm = vm_json.VM;
    var state = OpenNebula.Helper.resource_state("vm",vm.STATE);
    var hostname = "--";

    if (state == tr("ACTIVE") || state == tr("SUSPENDED") || state == tr("POWEROFF")){
        if (vm.HISTORY_RECORDS.HISTORY.constructor == Array){
            hostname = vm.HISTORY_RECORDS.HISTORY[vm.HISTORY_RECORDS.HISTORY.length-1].HOSTNAME;
        } else {
            hostname = vm.HISTORY_RECORDS.HISTORY.HOSTNAME;
        };
    };


    switch (state) {
      case tr("INIT"):
      case tr("PENDING"):
      case tr("HOLD"):
        pending_vms++;
        break;
      case tr("FAILED"):
        failed_vms++;
        break;
      case tr("ACTIVE"):
        active_vms++;
        break;
      case tr("STOPPED"):
      case tr("SUSPENDED"):
      case tr("POWEROFF"):
        off_vms++;
        break;
      default:
        break;
    }

    if (state == tr("ACTIVE")) {
        state = OpenNebula.Helper.resource_state("vm_lcm",vm.LCM_STATE);
    };


    return [
        '<input class="check_item" type="checkbox" id="vm_'+vm.ID+'" name="selected_items" value="'+vm.ID+'"/>',
        vm.ID,
        vm.UNAME,
        vm.GNAME,
        vm.NAME,
        state,
        vm.CPU,
        humanize_size(vm.MEMORY),
        hostname,
        ip_str(vm),
        str_start_time(vm),
//Ezilla redir start
        vncIcon(vm),
        redirectPortIcon(vm)
//Ezilla redir End
    ];
};


// Callback to refresh a single element from the list
function updateVMachineElement(request, vm_json){
    var id = vm_json.VM.ID;
    var element = vMachineElementArray(vm_json);
    updateSingleElement(element,dataTable_vMachines,'#vm_'+id)
}

// Callback to delete a single element from the list
function deleteVMachineElement(request){
    deleteElement(dataTable_vMachines,'#vm_'+request.request.data);
}

// Callback to add an element to the list
function addVMachineElement(request,vm_json){
    var id = vm_json.VM.ID;
    var element = vMachineElementArray(vm_json);
    addElement(element,dataTable_vMachines);
}


// Callback to refresh the list of Virtual Machines
function updateVMachinesView(request, vmachine_list){
    var vmachine_list_array = [];

    active_vms = 0;
    pending_vms = 0;
    failed_vms = 0;
    off_vms = 0;

    var total_real_cpu = 0;
    var total_allocated_cpu = 0;

    var total_real_mem = 0;
    var total_allocated_mem = 0;

    $.each(vmachine_list,function(){
        vmachine_list_array.push( vMachineElementArray(this));

        if(this.VM.STATE == 3 && this.VM.STATE == 3){ // ACTIVE, RUNNING
            total_real_cpu += parseInt(this.VM.CPU);
            total_allocated_cpu += parseInt(this.VM.TEMPLATE.CPU * 100);

            total_real_mem += parseInt(this.VM.MEMORY);
            total_allocated_mem += parseInt(this.VM.TEMPLATE.MEMORY);
        }
    });

    updateView(vmachine_list_array,dataTable_vMachines);

    var usage = 0;
    if(total_allocated_cpu != 0){
        usage = parseInt(100 * total_real_cpu / total_allocated_cpu);
    }
    var info_str = usage+'%';
    $("#dash_vm_real_cpu").html(usageBarHtml(usage, 100, info_str, true));

    usage = 0;
    if(total_allocated_mem != 0){
        usage = parseInt(100 * total_real_mem / 1024 / total_allocated_mem);
    }
    info_str = usage+'%';
    $("#dash_vm_real_mem").html(usageBarHtml(usage, 100, info_str, true));

    $(".total_vms").text(vmachine_list.length);
    $(".active_vms").text(active_vms);
    $(".pending_vms").text(pending_vms);
    $(".failed_vms").text(failed_vms);
    $(".off_vms").text(off_vms);
};


// Returns the html code for a nice formatted VM history
// Some calculations are performed, inspired from what is done
// in the CLI
function generatePlacementTable(vm){
   var requirements_str = vm.USER_TEMPLATE.SCHED_REQUIREMENTS ? vm.USER_TEMPLATE.SCHED_REQUIREMENTS : "-";
   var rank_str = vm.USER_TEMPLATE.SCHED_RANK ? vm.USER_TEMPLATE.SCHED_RANK : "-";
   var ds_requirements_str = vm.USER_TEMPLATE.SCHED_DS_REQUIREMENTS ? vm.USER_TEMPLATE.SCHED_DS_REQUIREMENTS : "-";
   var ds_rank_str = vm.USER_TEMPLATE.SCHED_DS_RANK ? vm.USER_TEMPLATE.SCHED_DS_RANK : "-";


    var html = '<div class="row"><div class="large-12 columns">\
          <table id="vm_history_table" class="extended_table dataTable">\
                   <thead>\
                     <tr>\
                         <th>'+tr("#")+'</th>\
                         <th>'+tr("Host")+'</th>\
                         <th>'+tr("Datastore")+'</th>\
                         <th>'+tr("Action")+'</th>\
                         <th>'+tr("Reason")+'</th>\
                         <th>'+tr("Chg time")+'</th>\
                         <th>'+tr("Total time")+'</th>\
                         <th colspan="2">'+tr("Prolog time")+'</th>\
                     </tr>\
                   </thead>\
                   <tbody>';

    var history = [];
    if (vm.HISTORY_RECORDS.HISTORY){
        if ($.isArray(vm.HISTORY_RECORDS.HISTORY))
            history = vm.HISTORY_RECORDS.HISTORY;
        else if (vm.HISTORY_RECORDS.HISTORY.SEQ)
            history = [vm.HISTORY_RECORDS.HISTORY];
    } else {
      html += '     <tr>\
               <td colspan="8" style="width:5%">'+tr("No data available in table")+'</td>\
              </tr>'
    }

    var now = Math.round(new Date().getTime() / 1000);

    for (var i=0; i < history.length; i++){
        // :TIME time calculations copied from onevm_helper.rb
        var stime = parseInt(history[i].STIME, 10);

        var etime = parseInt(history[i].ETIME, 10)
        etime = etime == 0 ? now : etime;

        var dtime = etime - stime;
        // end :TIME

        //:PTIME
        var stime2 = parseInt(history[i].PSTIME, 10);
        var etime2;
        var ptime2 = parseInt(history[i].PETIME, 10);
        if (stime2 == 0)
            etime2 = 0;
        else
            etime2 = ptime2 == 0 ? now : ptime2;
        var dtime2 = etime2 - stime2;

        //end :PTIME


        html += '     <tr>\
                       <td style="width:5%">'+history[i].SEQ+'</td>\
                       <td style="width:15%">'+history[i].HOSTNAME+'</td>\
                       <td style="width:5%">'+history[i].DS_ID+'</td>\
                       <td style="width:16%">'+OpenNebula.Helper.resource_state("VM_MIGRATE_ACTION",parseInt(history[i].ACTION, 10))+'</td>\
                       <td style="width:10%">'+OpenNebula.Helper.resource_state("VM_MIGRATE_REASON",parseInt(history[i].REASON, 10))+'</td>\
                       <td style="width:16%">'+pretty_time(history[i].STIME)+'</td>\
                       <td style="width:16%">'+pretty_time_runtime(dtime)+'</td>\
                       <td style="width:16%">'+pretty_time_runtime(dtime2)+'</td>\
                       <td></td>\
                      </tr>'
    };
    html += '</tbody>\
                </table>\
          </div>\
        </div>';

    if (vm.USER_TEMPLATE.SCHED_MESSAGE) {
        html += '<div class="row">\
        <div class="large-12 columns">\
          <table id="vm_ds_placement_table" class="extended_table dataTable">\
                   <thead>\
                     <tr>\
                         <th align="center">'+tr("Sched Message")+'</th>\
                     </tr>\
                   </thead>\
                   <tbody>\
                      <tr>\
                       <td>'+ vm.USER_TEMPLATE.SCHED_MESSAGE +'</td>\
                     </tr>\
                   </tbody>\
          </table>\
          </div>\
        </div>';
    }

    html += '<div class="row">\
      <div class="large-9 columns">\
          <table id="vm_placement_table" class="extended_table dataTable">\
                   <thead>\
                     <tr>\
                         <th colspan="2" align="center">'+tr("Placement - Host")+'</th>\
                     </tr>\
                   </thead>\
                   <tbody>\
                      <tr>\
                       <td>'+ tr("Requirements")+'</td>\
                       <td>'+requirements_str+'</td>\
                     </tr>\
                      <tr>\
                       <td>'+ tr("Rank")+'</td>\
                       <td>'+rank_str+'</td>\
                     </tr>\
                   </tbody>\
          </table>\
          <table id="vm_ds_placement_table" class="extended_table dataTable">\
                   <thead>\
                     <tr>\
                         <th colspan="2" align="center">'+tr("Placement - Datastore")+'</th>\
                     </tr>\
                   </thead>\
                   <tbody>\
                      <tr>\
                       <td>'+ tr("DS Requirements")+'</td>\
                       <td>'+ds_requirements_str+'</td>\
                     </tr>\
                      <tr>\
                       <td>'+ tr("DS Rank")+'</td>\
                       <td>'+ds_rank_str+'</td>\
                     </tr>\
                   </tbody>\
          </table>\
          </div>\
        </div>';

    return html;

};


// Refreshes the information panel for a VM
function updateVMInfo(request,vm){
    var vm_info = vm.VM;
    var vm_state = OpenNebula.Helper.resource_state("vm",vm_info.STATE);
    var hostname = "--"
    if (vm_state == tr("ACTIVE") || vm_state == tr("SUSPENDED") || vm_state == tr("POWEROFF")) {
        if (vm_info.HISTORY_RECORDS.HISTORY.constructor == Array){
            hostname = vm_info.HISTORY_RECORDS.HISTORY[vm_info.HISTORY_RECORDS.HISTORY.length-1].HOSTNAME
        } else {
            hostname = vm_info.HISTORY_RECORDS.HISTORY.HOSTNAME;
        };
    };

    // Get rid of the unwanted (for show) SCHED_* keys
    var stripped_vm_template = {};
    var unshown_values       = {};

    for (key in vm_info.USER_TEMPLATE)
        if(!key.match(/^SCHED_*/))
            stripped_vm_template[key]=vm_info.USER_TEMPLATE[key];
        else
            unshown_values[key]=vm_info.USER_TEMPLATE[key];


    var info_tab = {
        title : tr("Info"),
        icon: "fa-info-circle",
        content:
        '<div class="row">\
        <div class="large-6 columns">\
        <table id="info_vm_table" class="dataTable extended_table">\
            <thead>\
              <tr><th colspan="3">'+tr("Information")+'</th></tr>\
            </thead>\
            <tbody>\
              <tr>\
                 <td class="key_td">'+tr("ID")+'</td>\
                 <td class="value_td">'+vm_info.ID+'</td>\
                 <td></td>\
              </tr>'+
              insert_rename_tr(
                'vms-tab',
                "VM",
                vm_info.ID,
                vm_info.NAME)+
              '<tr>\
                 <td class="key_td">'+tr("State")+'</td>\
                 <td class="value_td">'+tr(vm_state)+'</td>\
                 <td></td>\
              </tr>\
              <tr>\
                 <td class="key_td">'+tr("LCM State")+'</td>\
                 <td class="value_td">'+tr(OpenNebula.Helper.resource_state("vm_lcm",vm_info.LCM_STATE))+'</td>\
                 <td></td>\
              </tr>\
              <tr>\
                 <td class="key_td">'+tr("Host")+'</td>\
              <td class="value_td">'+ hostname +'</td>\
                 <td></td>\
              </tr>\
              <tr>\
                 <td class="key_td">'+tr("Start time")+'</td>\
                 <td class="value_td">'+pretty_time(vm_info.STIME)+'</td>\
                 <td></td>\
              </tr>\
              <tr>\
                 <td class="key_td">'+tr("Deploy ID")+'</td>\
                 <td class="value_td">'+(typeof(vm_info.DEPLOY_ID) == "object" ? "-" : vm_info.DEPLOY_ID)+'</td>\
                 <td></td>\
              </tr>\
              <tr>\
                 <td class="key_td">'+tr("Reschedule")+'</td>\
                 <td class="value_td">'+(parseInt(vm_info.RESCHED) ? tr("yes") : tr("no"))+'</td>\
                 <td></td>\
              </tr>\
              </tbody>\
               </table>\
            </div>\
            <div class="large-6 columns">' +
               insert_permissions_table('vms-tab',
                                        "VM",
                                        vm_info.ID,
                                        vm_info.UNAME,
                                        vm_info.GNAME,
                                        vm_info.UID,
                                        vm_info.GID) +

            '</div>\
            </div>\
            <div class="row">\
              <div class="large-9 columns">'+
                 insert_extended_template_table(stripped_vm_template,
                                                "VM",
                                                vm_info.ID,
                                                "Attributes",
                                                unshown_values) +
              '</div>\
            </div>'
    };

    var hotplugging_tab = {
        title: tr("Storage"),
        icon: "fa-tasks",
        content: printDisks(vm_info)
    };

    var network_tab = {
        title: tr("Network"),
        icon: "fa-globe",
        content: printNics(vm_info)
    };

    var capacity_tab = {
        title: tr("Capacity"),
        icon: "fa-laptop",
        content: printCapacity(vm_info)
    };

    var snapshot_tab = {
        title: tr("Snapshots"),
        icon: "fa-camera",
        content: printSnapshots(vm_info)
    };

    var template_tab = {
        title: tr("Template"),
        icon: "fa-file-o",
        content:
        '<div class="row">\
          <div class="large-9 columns">\
            <table id="vm_template_table" class="info_table dataTable">'+
                prettyPrintJSON(vm_info.TEMPLATE)+
            '</table>\
          </div>\
        </div>'
    };

    var log_tab = {
        title: tr("Log"),
        icon: "fa-file-text",
        content: '<div>'+spinner+'</div>'
    };

    var actions_tab = {
        title: tr("Actions"),
        icon: "fa-calendar",
        content: printActionsTable(vm_info)
    };


    var placement_tab = {
        title: tr("Placement"),
        icon: "fa-sitemap",
        content: generatePlacementTable(vm_info)
    };

    Sunstone.updateInfoPanelTab("vm_info_panel","vm_info_tab",info_tab);
    Sunstone.updateInfoPanelTab("vm_info_panel","vm_capacity_tab",capacity_tab);
    Sunstone.updateInfoPanelTab("vm_info_panel","vm_hotplugging_tab",hotplugging_tab);
    Sunstone.updateInfoPanelTab("vm_info_panel","vm_network_tab",network_tab);
    Sunstone.updateInfoPanelTab("vm_info_panel","vm_snapshot_tab",snapshot_tab);
    Sunstone.updateInfoPanelTab("vm_info_panel","vm_placement_tab",placement_tab);
    Sunstone.updateInfoPanelTab("vm_info_panel","vm_actions_tab",actions_tab);
    Sunstone.updateInfoPanelTab("vm_info_panel","vm_template_tab",template_tab);
    Sunstone.updateInfoPanelTab("vm_info_panel","vm_log_tab",log_tab);

    // TODO: re-use pool_monitor data?

    //Pop up the info panel and asynchronously get vm_log and stats
    Sunstone.popUpInfoPanel("vm_info_panel", "vms-tab");
    Sunstone.runAction("VM.log",vm_info.ID);
    Sunstone.runAction("VM.monitor",vm_info.ID,
        { monitor_resources : "CPU,MEMORY,NET_TX,NET_RX"});

    var $info_panel = $('div#vm_info_panel');
    var $hotplugging_tab = $('div#vm_hotplugging_tab', $info_panel);
    $('tr.at_volatile',$hotplugging_tab).hide();
    $('tr.at_image',$hotplugging_tab).show();

    // Populate permissions grid
    setPermissionsTable(vm_info,'');

    // Enable / disable vnc button
    $(".vnc-right-info").prop("disabled", !enableVnc(vm_info));
}

function updateVMDisksInfo(request,vm){
  $("li#vm_hotplugging_tabTab").html(printDisks(vm.VM));
}

// Create the  actions table (with listeners)
function printActionsTable(vm_info)
{

    var str = '<div class="row">\
                <div class="large-12 columns">\
                  <table id="scheduling_actions_table" class="info_table dataTable extended_table">\
                   <thead>\
                     <tr>\
                        <th>'+tr("ID")+'</th>\
                        <th>'+tr("ACTION")+'</th>\
                        <th>'+tr("TIME")+'</th>\
                        <th>'+tr("DONE")+'</th>\
                        <th>'+tr("MESSAGE")+'</th>\
                        <th colspan="">'+tr("Actions")+'</th>\
                        <th><button id="add_scheduling_action" class="button tiny success right radius" >'+tr("Add action")+'</button></th>\
                     </tr>\
                    </thead>' +
                      fromJSONtoActionsTable(
                                        vm_info.USER_TEMPLATE.SCHED_ACTION) +
                   '</table>\
                  </div>\
                </div>'

    // Remove previous listeners
    $(".remove_action_x").die();
    $(".edit_action_e").die();
    $('#add_scheduling_action').die();
    $("#submit_scheduling_action").die();
    $(".select_action").die();
    $(".input_edit_time").die();


    $('#add_scheduling_action').live('click', function(){

        $("#add_scheduling_action").attr("disabled", "disabled");

        $("#scheduling_actions_table").append('<tr><td></td>\
             <td class="columns"><select id="select_new_action" class="select_new_action" name="select_action">\
                                <option value="shutdown">' + tr("shutdown") + '</option>\
                                <option value="shutdown-hard">' + tr("shutdown-hard") + '</option>\
                                <option value="hold">' + tr("hold") + '</option>\
                                <option value="release">' + tr("release") + '</option>\
                                <option value="stop">' + tr("stop") + '</option>\
                                <option value="suspend">' + tr("suspend") + '</option>\
                                <option value="resume">' + tr("resume") + '</option>\
                                <option value="boot">' + tr("boot") + '</option>\
                                <option value="delete">' + tr("delete") + '</option>\
                                <option value="delete-recreate">' + tr("delete-recreate") + '</option>\
                                <option value="reboot">' + tr("reboot") + '</option>\
                                <option value="reboot-hard">' + tr("reboot-hard") + '</option>\
                                <option value="poweroff">' + tr("poweroff") + '</option>\
                                <option value="poweroff-hard">' + tr("poweroff-hard") + '</option>\
                                <option value="undeploy">' + tr("undeploy") + '</option>\
                                <option value="undeploy-hard">' + tr("undeploy-hard") + '</option>\
                                <option value="snapshot-create">' + tr("snapshot-create") + '</option>\
                              </select>\
              </td>\
             <td>\
                <input id="date_input" class="jdpicker" type="text" placeholder="2013/12/30"/>\
                <input id="time_input" type="text" placeholder="12:30"/>\
             </td>\
             <td>\
                <button id="submit_scheduling_action" class="button small secondary radius" >' + tr("Add") +'</button>\
             </td>\
             <td colspan=2></td>\
           </tr>');

        $("#date_input").jdPicker();
        return false;
    });

    $("#submit_scheduling_action").live("click", function() {
        var date_input_value = $("#date_input").val();
        var time_input_value = $("#time_input").val();

        if (date_input_value=="" || time_input_value=="")
          return false;

        var time_value = date_input_value + ' ' + time_input_value


        // Calculate MAX_ID
        var max_id = -1;

        if (vm_info.USER_TEMPLATE.SCHED_ACTION)
        {
          if (!vm_info.USER_TEMPLATE.SCHED_ACTION.length)
          {
            var tmp_element = vm_info.USER_TEMPLATE.SCHED_ACTION;
            vm_info.USER_TEMPLATE.SCHED_ACTION = new Array();
            vm_info.USER_TEMPLATE.SCHED_ACTION.push(tmp_element);
          }

          $.each(vm_info.USER_TEMPLATE.SCHED_ACTION, function(i,element){
              if (max_id<element.ID)
                max_id=element.ID
          })
        }
        else
        {
          vm_info.USER_TEMPLATE.SCHED_ACTION = new Array();
        }


        var new_action = {};
        new_action.ID  = parseInt(max_id) + 1;
        new_action.ACTION = $("#select_new_action").val();
        var epoch_str   = new Date(time_value);

        new_action.TIME = parseInt(epoch_str.getTime())/1000;

        vm_info.USER_TEMPLATE.SCHED_ACTION.push(new_action);

        // Let OpenNebula know
        var template_str = convert_template_to_string(vm_info.USER_TEMPLATE);
        Sunstone.runAction("VM.update_actions",vm_info.ID,template_str);

        $("#add_scheduling_action").removeAttr("disabled");
        return false;
    });

    // Listener for key,value pair remove action
    $(".remove_action_x").live("click", function() {
        var index = this.id.substring(6,this.id.length);
        var tmp_tmpl = new Array();

        $.each(vm_info.USER_TEMPLATE.SCHED_ACTION, function(i,element){
            if(element.ID!=index)
              tmp_tmpl[i] = element
        })

        vm_info.USER_TEMPLATE.SCHED_ACTION = tmp_tmpl;
        var template_str = convert_template_to_string(vm_info.USER_TEMPLATE);

        // Let OpenNebula know
        Sunstone.runAction("VM.update_actions",vm_info.ID,template_str);
    });

    return str;
}

// Returns an HTML string with the json keys and values
function fromJSONtoActionsTable(actions_array){
    var str = ""
    var empty = '\
    <tr id="no_actions_tr">\
        <td colspan="6">' + tr("No actions to show") + '</td>\
    </tr>';

    if (!actions_array){
        return empty;
    }

    if (!$.isArray(actions_array))
    {
      var tmp_array = new Array();
      tmp_array[0]  = actions_array;
      actions_array = tmp_array;
    }

    if (!actions_array.length){
        return empty;
    }

    $.each(actions_array, function(index, scheduling_action){
       str += fromJSONtoActionRow(scheduling_action);
    });

    return str;
}


// Helper for fromJSONtoHTMLTable function
function fromJSONtoActionRow(scheduling_action){
    var str = "";

    var done_str    = scheduling_action.DONE ? (new Date(scheduling_action.DONE*1000).toLocaleString()) : "";
    var message_str = scheduling_action.MESSAGE ? scheduling_action.MESSAGE : "";
    var time_str    = new Date(scheduling_action.TIME*1000).toLocaleString();

    str += '<tr class="tr_action_'+scheduling_action.ID+'">\
             <td class="id_row">'+scheduling_action.ID+'</td>\
             <td class="action_row">'+scheduling_action.ACTION+'</td>\
             <td nowrap class="time_row">'+time_str+'</td>\
             <td class="done_row">'+done_str+'</td>\
             <td class="message_row">'+message_str+'</td>\
             <td>\
               <div>\
                 <a id="minus_'+scheduling_action.ID+'" class="remove_action_x" href="#"><i class="fa fa-trash-o"/></a>\
               </div>\
             </td>\
           </tr>';

    return str;
}

function setupDateTimePicker(input_to_fill, time_str){
    dialogs_context.append('<div id="date_time_picker_dialog"></div>');
    $date_time_picker_dialog = $('#date_time_picker_dialog',dialogs_context);
    var dialog = $date_time_picker_dialog;

    dialog.html( '<div class="row">\
                  <h3 class="subheader">'+tr("Date Time Picker")+'</h3>\
                  <form id="date_time_form" action="">\
                    </div>\
                    <input type="text" name="date" value="2012/01/01 10:00">\
                    <script type="text/javascript">\
                      $(function(){\
                        $("*[name=date]").appendDtpicker({"inline": true, "current": "'+time_str+'"});\
                      });\
                    </script>\
                    <div class="form_buttons">\
                      <button class="button radius right success" id="date_time_form" type="submit">'+tr("Done")+'</button>\
                    </div>\
                    <a class="close-reveal-modal">&#215;</a>\
                  </form>');

    dialog.addClass("reveal-modal large").attr("data-reveal", "");
    dialog.foundation().foundation('reveal', 'open');

    $("*[name=date]").val(time_str)
    $('#date_time_form',dialog).die();

    $('#date_time_form',dialog).live('click', function(){
        var date_str = $('*[name=date]').val();
        $(input_to_fill).val(date_str);
        $(input_to_fill).trigger("change");

        $date_time_picker_dialog.foundation('reveal', 'close')
        return false;
    });
};

function updateActionsInfo(request,vm){
  $("li#vm_actions_tabTab").html(printActionsTable(vm.VM));
}

// Generates the HTML for the hotplugging tab
// This is a list of disks with the save_as, detach options.
// And a form to attach a new disk to the VM, if it is running.
function printDisks(vm_info){
   var html ='<form id="hotplugging_form" vmid="'+vm_info.ID+'" >\
      <div class="row">\
      <div class="large-12 columns">\
         <table class="info_table dataTable extended_table">\
           <thead>\
             <tr>\
                <th>'+tr("ID")+'</th>\
                <th>'+tr("Target")+'</th>\
                <th>'+tr("Image / Format-Size")+'</th>\
                <th>'+tr("Persistent")+'</th>\
                <th>'+tr("Save as")+'</th>\
                <th colspan="">'+tr("Actions")+'</th>\
                <th>';

    if (Config.isTabActionEnabled("vms-tab", "VM.attachdisk")) {
      // If VM is not RUNNING, then we forget about the attach disk form.
      if (vm_info.STATE == "3" && vm_info.LCM_STATE == "3"){
        html += '\
           <button id="attach_disk" class="button tiny success right radius" >'+tr("Attach disk")+'</button>'
      } else {
        html += '\
           <button id="attach_disk" class="button tiny success right radius" disabled="disabled">'+tr("Attach disk")+'</button>'
      }
    }

    html += '</th>\
              </tr>\
           </thead>\
           <tbody>';


    var disks = []
    if ($.isArray(vm_info.TEMPLATE.DISK))
        disks = vm_info.TEMPLATE.DISK
    else if (!$.isEmptyObject(vm_info.TEMPLATE.DISK))
        disks = [vm_info.TEMPLATE.DISK]

    if (!disks.length){
        html += '\
          <tr id="no_disks_tr">\
            <td colspan="6">' + tr("No disks to show") + '</td>\
          </tr>';
    }
    else {

        for (var i = 0; i < disks.length; i++){
            var disk = disks[i];

            var save_as;
            // Snapshot deferred
            if (
               ( // ACTIVE
                vm_info.STATE == "3") &&
               ( // HOTPLUG_SAVEAS HOTPLUG_SAVEAS_POWEROFF HOTPLUG_SAVEAS_SUSPENDED
                vm_info.LCM_STATE == "26" || vm_info.LCM_STATE == "27" || vm_info.LCM_STATE == "28") &&
               ( //
                disk.SAVE_AS_ACTIVE == "YES")
               ) {
              save_as = tr("in progress");
              actions = tr('deferred snapshot in progress');
            }
            // Snapshot Hot
            else if (
               ( // ACTIVE
                vm_info.STATE == "3") &&
               ( // HOTPLUG_SAVEAS HOTPLUG_SAVEAS_POWEROFF HOTPLUG_SAVEAS_SUSPENDED
                vm_info.LCM_STATE == "26" || vm_info.LCM_STATE == "27" || vm_info.LCM_STATE == "28") &&
               ( //
                disk.HOTPLUG_SAVE_AS_ACTIVE == "YES")
               ) {
              save_as = (disk.SAVE_AS ? disk.SAVE_AS : '-');
              actions = tr('hot snapshot in progress');
            }
            // Attach / Detach
            else if (
               ( // ACTIVE
                vm_info.STATE == "3") &&
               ( // HOTPLUG_SAVEAS HOTPLUG_SAVEAS_POWEROFF HOTPLUG_SAVEAS_SUSPENDED
                vm_info.LCM_STATE == "17") &&
               ( //
                disk.ATTACH = "YES")
               ) {
              save_as = (disk.SAVE_AS ? disk.SAVE_AS : '-');
              actions = tr('attach/detach in progress');
            }
            else {
              save_as = (disk.SAVE_AS ? disk.SAVE_AS : '-');

              actions = '';

              if (Config.isTabActionEnabled("vms-tab", "VM.saveas")) {
                // Check if its volatie
                if (disk.IMAGE_ID) {
                  if ((vm_info.STATE == "3" && vm_info.LCM_STATE == "3") || vm_info.STATE == "5" || vm_info.STATE == "8") {
                    actions += '<a href="VM.saveas" class="saveas" ><i class="fa fa-save"/>'+tr("Snapshot")+'</a> &emsp;'
                  }
                }
              }

              if (Config.isTabActionEnabled("vms-tab", "VM.detachdisk")) {
                if (vm_info.STATE == "3" && vm_info.LCM_STATE == "3") {
                  actions += '<a href="VM.detachdisk" class="detachdisk" ><i class="fa fa-times"/>'+tr("Detach")+'</a>'
                }
              }
            }

            html += '\
              <tr disk_id="'+(disk.DISK_ID)+'">\
                <td>' + disk.DISK_ID + '</td>\
                <td>' + disk.TARGET + '</td>\
                <td>' + (disk.IMAGE ? disk.IMAGE : (humanize_size_from_mb(disk.SIZE) + (disk.FORMAT ? (' - ' + disk.FORMAT) : '') )) + '</td>\
                <td>' + ((disk.SAVE && disk.SAVE == 'YES' )? tr('YES') : tr('NO')) + '</td>\
                <td>' + save_as + '</td>\
                <td>' + actions + '</td>\
            </tr>';
        }
    }

    html += '\
              </tbody>\
            </table>\
          </div>\
        </div>\
      </form>';

    return html;
}

function setupSaveAsDialog(){
    dialogs_context.append('<div id="save_as_dialog"></div>');
    $save_as_dialog = $('#save_as_dialog',dialogs_context);
    var dialog = $save_as_dialog;

    dialog.html('<div class="row">\
  <div class="large-12 columns">\
    <h3 class="subheader" id="">'+tr("Snapshot")+'</h3>\
  </div>\
</div>\
<form id="save_as_form" action="">\
      <div class="row">\
          <div class="large-12 columns">\
              <label for="vm_id">'+tr("Virtual Machine ID")+':</label>\
              <label style="border-style: inset; background-color: lightgrey" type="text" name="vm_id" id="vm_id" disabled/>\
          </div>\
      </div>\
      <div class="row">\
          <div class="large-12 columns">\
              <label for="disk_id">'+tr("Disk ID")+':</label>\
              <label style="border-style: inset; background-color: lightgrey" type="text" name="disk_id" id="disk_id" disabled/>\
              <div class=""></div>\
          </div>\
      </div>\
      <div class="row">\
          <div class="large-12 columns">\
              <label for="image_name">'+tr("Image name")+':</label>\
              <input type="text" name="image_name" id="image_name" />\
          </div>\
      </div>\
      <div class="row centered">\
          <div class="large-12 columns">\
              <label for="snapshot_type">'+tr("Snapshot type")+
                  '<span class="tip">'+tr("Sets the specified VM disk to be saved in a new Image.")+'<br><br>\
                    '+tr("Deferred: The Image is created immediately, but the contents are saved only if the VM is shut down gracefully (i.e., using Shutdown; not Delete)")+'<br><br>\
                    '+tr("Hot: The Image will be saved immediately.")+'</span>'+
              '</label>\
              <select name="snapshot_type" id="snapshot_type">\
                   <option value="false" selected="selected">'+tr("Deferred")+'</option>\
                   <option value="true">'+tr("Hot")+'</option>\
              </select>\
          </div>\
      </div>\
      <div class="form_buttons">\
          <button class="button radius right success" id="snapshot_live_button" type="submit" value="VM.saveas">'+tr("Take snapshot")+'</button>\
      </div>\
  <a class="close-reveal-modal">&#215;</a>\
</form>')

    dialog.addClass("reveal-modal").attr("data-reveal", "");
    setupTips(dialog);

    $('#save_as_form',dialog).submit(function(){
        var vm_id = $('#vm_id', this).text();
        var image_name = $('#image_name', this).val();
        var snapshot_type = $('#snapshot_type', this).val();

        if (!image_name.length){
            notifyError(tr('Please provide a name for the new image'));
            return false;
        }

        var obj = {
            disk_id : $('#disk_id', this).text(),
            image_name : image_name,
            type: "",
            hot: (snapshot_type == "true" ? true : false),
            clonetemplate: false,
        };

        Sunstone.runAction('VM.saveas', vm_id, obj);

        $save_as_dialog.foundation('reveal', 'close')
        return false;
    });
};

function popUpSaveAsDialog(vm_id, disk_id){
    $('#vm_id',$save_as_dialog).text(vm_id);
    $('#disk_id',$save_as_dialog).text(disk_id);
    $save_as_dialog.foundation().foundation('reveal', 'open');
    $("input#image_name",$save_as_dialog).focus();
}




function setupAttachDiskDialog(){
    dialogs_context.append('<div id="attach_disk_dialog"></div>');
    $attach_disk_dialog = $('#attach_disk_dialog',dialogs_context);
    var dialog = $attach_disk_dialog;

    dialog.html('<div class="row">\
      <div class="large-12 columns">\
        <h3 class="subheader" id="">'+tr("Attach new disk")+'</h3>\
      </div>\
    </div>\
        <div class="reveal-body">\
    <form id="attach_disk_form" action="">\
          <div class="row">\
              <div class="large-6 columns">\
                  <label for="vm_id">'+tr("Virtual Machine ID")+':</label>\
                  <label style="border-style: inset; background-color: lightgrey" type="text" name="vm_id" id="vm_id" disabled/>\
              </div>\
          </div>' +
          generate_disk_tab_content("attach_disk", "attach_disk") +
          '<div class="reveal-footer">\
          <div class="form_buttons">\
              <button class="button radius right success" id="attach_disk_button" type="submit" value="VM.attachdisk">'+tr("Attach")+'</button>\
          </div>\
          </div>\
      <a class="close-reveal-modal">&#215;</a>\
    </form></div>')

    dialog.addClass("reveal-modal large max-height").attr("data-reveal", "");
    setupTips(dialog);

    setup_disk_tab_content(dialog, "attach_disk", "attach_disk")

    $('#attach_disk_form',dialog).submit(function(){
        var vm_id = $('#vm_id', this).text();

        var data  = {};

        if($('input[type=radio]:checked', dialog).val()=="image")
        {
          // Clear the volatile fields
          $('input#FORMAT',   dialog).val("");
          $('input#SIZE_TMP', dialog).val("");
        }
        else
        {
          $('input#IMAGE_ID',   dialog).val("");
          $('input#IMAGE',      dialog).val("");
          $('input#IMAGE_UID',  dialog).val("");
          $('input#IMAGE_UNAME',dialog).val("");
        }

        addSectionJSON(data, this);

        var obj = {DISK: data}
        Sunstone.runAction('VM.attachdisk', vm_id, obj);

        $attach_disk_dialog.foundation('reveal', 'close')
        return false;
    });
};

function popUpAttachDiskDialog(vm_id){
    $('#vm_id',$attach_disk_dialog).text(vm_id);
    $attach_disk_dialog.foundation().foundation('reveal', 'open');
}


// Listeners to the disks operations (detach, saveas, attach)
function hotpluggingOps(){
    if (Config.isTabActionEnabled("vms-tab", "VM.saveas")) {
      setupSaveAsDialog();

      $('a.saveas').live('click', function(){
          var b = $(this);
          var vm_id = b.parents('form').attr('vmid');
          var disk_id = b.parents('tr').attr('disk_id');

          popUpSaveAsDialog(vm_id, disk_id);

          //b.html(spinner);
          return false;
      });
    }

    if (Config.isTabActionEnabled("vms-tab", "VM.attachdisk")) {
      setupAttachDiskDialog();

      $('#attach_disk').live('click', function(){
          var b = $(this);
          var vm_id = b.parents('form').attr('vmid');

          popUpAttachDiskDialog(vm_id);

          //b.html(spinner);
          return false;
      });
    }

    if (Config.isTabActionEnabled("vms-tab", "VM.detachdisk")) {
      $('a.detachdisk').live('click', function(){
          var b = $(this);
          var vm_id = b.parents('form').attr('vmid');
          var disk_id = b.parents('tr').attr('disk_id');

          Sunstone.runAction('VM.detachdisk', vm_id, disk_id);

          //b.html(spinner);
          return false;
      });
    }
}

function printNics(vm_info){
   var html ='<form id="tab_network_form" vmid="'+vm_info.ID+'" >\
      <div class="row">\
      <div class="large-12 columns">\
         <table class="info_table dataTable extended_table">\
           <thead>\
             <tr>\
                <th>'+tr("ID")+'</th>\
                <th>'+tr("Network")+'</th>\
                <th>'+tr("IP")+'</th>\
                <th>'+tr("MAC")+'</th>\
                <th>'+tr("IPv6 Site")+'</th>\
                <th>'+tr("IPv6 Global")+'</th>\
                <th colspan="">'+tr("Actions")+'</th>\
                <th>';

    if (Config.isTabActionEnabled("vms-tab", "VM.attachnic")) {
      // If VM is not RUNNING, then we forget about the attach nic form.
      if (vm_info.STATE == "3" && vm_info.LCM_STATE == "3"){
        html += '\
           <button id="attach_nic" class="button tiny success right radius" >'+tr("Attach nic")+'</button>'
      } else {
        html += '\
           <button id="attach_nic" class="button tiny success right radius" disabled="disabled">'+tr("Attach nic")+'</button>'
      }
    }

    html += '</th>\
              </tr>\
           </thead>\
           <tbody>';


    var nics = []
    if ($.isArray(vm_info.TEMPLATE.NIC))
        nics = vm_info.TEMPLATE.NIC
    else if (!$.isEmptyObject(vm_info.TEMPLATE.NIC))
        nics = [vm_info.TEMPLATE.NIC]

    if (!nics.length){
        html += '\
          <tr id="no_nics_tr">\
            <td colspan="7">' + tr("No nics to show") + '</td>\
          </tr>';
    }
    else {

        for (var i = 0; i < nics.length; i++){
            var nic = nics[i];

            var actions;
            // Attach / Detach
            if (
               ( // ACTIVE
                vm_info.STATE == "3") &&
               ( // HOTPLUG_NIC
                vm_info.LCM_STATE == "25") &&
               ( //
                nic.ATTACH == "YES")
               ) {
              actions = 'attach/detach in progress'
            }
            else {
              actions = '';

              if (Config.isTabActionEnabled("vms-tab", "VM.detachnic")) {
                if (vm_info.STATE == "3" && vm_info.LCM_STATE == "3") {
                  actions += '<a href="VM.detachnic" class="detachnic" ><i class="fa fa-times"/>'+tr("Detach")+'</a>'
                }
              }
            }

            html += '\
              <tr nic_id="'+(nic.NIC_ID)+'">\
                <td>' + nic.NIC_ID + '</td>\
                <td>' + nic.NETWORK + '</td>\
                <td>' + nic.IP + '</td>\
                <td>' + nic.MAC + '</td>\
                <td>' + (nic.IP6_SITE ? nic.IP6_SITE : "--") +'</td>\
                <td>' + (nic.IP6_GLOBAL ? nic.IP6_GLOBAL : "--") +'</td>\
                <td>' + actions + '</td>\
            </tr>';
        }
    }

    html += '\
            </tbody>\
          </table>\
        </div>\
        </div>\
        <div class="row">\
            <div class="large-6 columns">\
              <div class="row text-center">\
                <h3 class="subheader"><small>'+tr("NET RX")+'</small></h3>\
              </div>\
              <div class="row">\
                <div class="large-10 columns centered graph" id="vm_net_rx_graph" style="height: 100px;">\
                </div>\
              </div>\
              <div class="row graph_legend">\
                <div class="large-10 columns centered" id="vm_net_rx_legend">\
                </div>\
              </div>\
            </div>\
            <div class="large-6 columns">\
              <div class="row text-center">\
                <h3 class="subheader"><small>'+tr("NET TX")+'</small></h3>\
              </div>\
              <div class="row">\
                <div class="large-10 columns centered graph" id="vm_net_tx_graph" style="height: 100px;">\
                </div>\
              </div>\
              <div class="row graph_legend">\
                <div class="large-10 columns centered" id="vm_net_tx_legend">\
                </div>\
              </div>\
            </div>\
            <div class="large-6 columns">\
              <div class="row text-center">\
                <h3 class="subheader"><small>'+tr("NET DOWNLOAD SPEED")+'</small></h3>\
              </div>\
              <div class="row">\
                <div class="large-10 columns centered graph" id="vm_net_rx_speed_graph" style="height: 100px;">\
                </div>\
              </div>\
              <div class="row graph_legend">\
                <div class="large-10 columns centered" id="vm_net_rx_speed_legend">\
                </div>\
              </div>\
            </div>\
            <div class="large-6 columns">\
              <div class="row text-center">\
                <h3 class="subheader"><small>'+tr("NET UPLOAD SPEED")+'</small></h3>\
              </div>\
              <div class="row">\
                <div class="large-10 columns centered graph" id="vm_net_tx_speed_graph" style="height: 100px;">\
                </div>\
              </div>\
              <div class="row graph_legend">\
                <div class="large-10 columns centered" id="vm_net_tx_speed_legend">\
                </div>\
              </div>\
            </div>\
        </div>\
      </form>';

    return html;
}

function setupAttachNicDialog(){
    dialogs_context.append('<div id="attach_nic_dialog"></div>');
    $attach_nic_dialog = $('#attach_nic_dialog',dialogs_context);
    var dialog = $attach_nic_dialog;

    dialog.html('<div class="row">\
      <div class="large-12 columns">\
        <h3 class="subheader" id="">'+tr("Attach new nic")+'</h3>\
      </div>\
    </div>\
        <div class="reveal-body">\
    <form id="attach_nic_form" action="">\
          <div class="row ">\
              <div class="large-6 columns">\
                  <label for="vm_id">'+tr("Virtual Machine ID")+':</label>\
                  <label style="border-style: inset; background-color: lightgrey" type="text" name="vm_id" id="vm_id" disabled/>\
              </div>\
          </div>' +
          generate_nic_tab_content("attach_nic", "attach_nic") +
          '<div class="reveal-footer">\
          <div class="form_buttons">\
              <button class="button radius right success" id="attach_nic_button" type="submit" value="VM.attachnic">'+tr("Attach")+'</button>\
          </div>\
          </div>\
      <a class="close-reveal-modal">&#215;</a>\
    </form></div>')

    dialog.addClass("reveal-modal large max-height").attr("data-reveal", "");
    setupTips(dialog);

    setup_nic_tab_content(dialog, "attach_nic", "attach_nic")

    $('#attach_nic_form',dialog).submit(function(){
        var vm_id = $('#vm_id', this).text();
        var data = retrieve_nic_tab_data(this);

        var obj = {NIC: data}
        Sunstone.runAction('VM.attachnic', vm_id, obj);

        $attach_nic_dialog.foundation('reveal', 'close')
        return false;
    });
};

function popUpAttachNicDialog(vm_id){
    $('#vm_id',$attach_nic_dialog).text(vm_id);
    $attach_nic_dialog.foundation().foundation('reveal', 'open');
}


// Listeners to the nics operations (detach, saveas, attach)
function setup_vm_network_tab(){
    if (Config.isTabActionEnabled("vms-tab", "VM.attachnic")) {
      setupAttachNicDialog();

      $('#attach_nic').live('click', function(){
          var b = $(this);
          var vm_id = b.parents('form').attr('vmid');

          popUpAttachNicDialog(vm_id);

          //b.html(spinner);
          return false;
      });
    }

    if (Config.isTabActionEnabled("vms-tab", "VM.detachnic")) {
      $('a.detachnic').live('click', function(){
          var b = $(this);
          var vm_id = b.parents('form').attr('vmid');
          var nic_id = b.parents('tr').attr('nic_id');

          Sunstone.runAction('VM.detachnic', vm_id, nic_id);

          //b.html(spinner);
          return false;
      });
    }
}

function printCapacity(vm_info){
   var html ='\
           <form id="tab_capacity_form" vmid="'+vm_info.ID+'" >'

    html += '\
      <div class="row">\
        <div class="large-6 columns">\
           <table class="info_table dataTable extended_table">\
             <thead>\
               <tr>\
                  <th>'+tr("CPU")+'</th>\
                  <th>'+tr("VCPU")+'</th>\
                  <th>'+tr("MEMORY")+'</th>\
                  <th></th>\
                </tr>\
             </thead>\
             <tbody>\
                <tr>\
                  <td id="cpu_info">' + vm_info.TEMPLATE.CPU + '</td>\
                  <td id="vcpu_info">' + (vm_info.TEMPLATE.VCPU ? vm_info.TEMPLATE.VCPU : '-') + '</td>\
                  <td id="memory_info" one_value="'+vm_info.TEMPLATE.MEMORY+'">' + humanize_size_from_mb(vm_info.TEMPLATE.MEMORY) + '</td>\
                  <td>';

    if (Config.isTabActionEnabled("vms-tab", "VM.resize")) {
      // If VM is not INIT, PENDING, HOLD, FAILED, POWEROFF, UNDEPLOYED, then we forget about the resize form.
      if (vm_info.STATE == "0" || vm_info.STATE == "1" || vm_info.STATE == "2" || vm_info.STATE == "7" || vm_info.STATE == "8" || vm_info.STATE == "9"){
        html += '\
          <button id="resize_capacity" class="button tiny success right radius" >' + tr("Resize") +'</button>'
      } else {
        html += '\
          <button id="resize_capacity" class="button tiny success right radius" disabled="disabled">' + tr("Resize") +'</button>'
      }
    }

              html += '</td>\
                </tr>\
              </tbody>\
            </table>\
          </div>\
        </div>\
        <div class="row">\
            <div class="large-6 columns">\
              <div class="row text-center">\
                <div class="large-12 columns">\
                  <h3 class="subheader"><small>'+tr("REAL CPU")+'</small></h3>\
                </div>\
              </div>\
              <div class="row">\
                <div class="large-12 columns">\
                  <div class="large-10 columns centered graph vm_cpu_graph" style="height: 100px;">\
                  </div>\
                </div>\
              </div>\
              <div class="row graph_legend">\
                <div class="large-10 columns centered" id="vm_cpu_legend">\
                </div>\
              </div>\
            </div>\
            <div class="large-6 columns">\
              <div class="row text-center">\
                <h3 class="subheader"><small>'+tr("REAL MEMORY")+'</small></h3>\
              </div>\
              <div class="row">\
                <div class="large-10 columns centered graph vm_memory_graph" style="height: 100px;">\
                </div>\
              </div>\
              <div class="row graph_legend">\
                <div class="large-10 columns centered" id="vm_memory_legend">\
                </div>\
              </div>\
            </div>\
        </div>\
      </form>';

    return html;
}

function setupResizeCapacityDialog(){
    dialogs_context.append('<div id="resize_capacity_dialog"></div>');
    $resize_capacity_dialog = $('#resize_capacity_dialog',dialogs_context);
    var dialog = $resize_capacity_dialog;

    dialog.html('<div class="row">\
      <div class="large-12 columns">\
        <h3 class="subheader" id="">'+tr("Resize VM capacity")+'</h3>\
      </div>\
    </div>\
    <div class="reveal-body">\
    <form id="resize_capacity_form" action="">\
        <div class="row centered">\
          <div class="large-6 columns">\
                  <label for="vm_id">'+tr("Virtual Machine ID")+':</label>\
                  <label style="border-style: inset; background-color: lightgrey" type="text" name="vm_id" id="vm_id" disabled/>\
          </div>\
          <div class="large-6 columns">\
                  <input type="checkbox" name="enforce" id="enforce"/>\
                  <label class="inline" for="vm_id">'+tr("Enforce")+
                    '<span class="tip">'
                      + tr("If it is set to true, the host capacity will be checked. This will only affect oneadmin requests, regular users resize requests will always be enforced") +
                    '</span>'+
                  '</label>\
          </div>\
          </div>' +
          generate_capacity_tab_content() +
          '<div class="reveal-footer">\
          <div class="form_buttons">\
              <button class="button radius right success" id="resize_capacity_button" type="submit" value="VM.resize">'+tr("Resize")+'</button>\
          </div>\
          </div>\
      <a class="close-reveal-modal">&#215;</a>\
    </form></div>')

    dialog.addClass("reveal-modal large max-height").attr("data-reveal", "");
    setupTips(dialog);

    $("#template_name_form", dialog).hide();

    setup_capacity_tab_content(dialog);

    $('#resize_capacity_form',dialog).submit(function(){
        var vm_id = $('#vm_id', this).text();

        var enforce = false;
        if ($("#enforce", this).is(":checked")) {
          enforce = true;
        }

        var data  = {};
        addSectionJSON(data, this);

        var obj = {
          "vm_template": data,
          "enforce": enforce,
        }

        Sunstone.runAction('VM.resize', vm_id, obj);

        $resize_capacity_dialog.foundation('reveal', 'close')
        return false;
    });
};

function popUpResizeCapacityDialog(vm_id){
    $('#vm_id',$resize_capacity_dialog).text(vm_id);

    $('#CPU',$resize_capacity_dialog).val($('#cpu_info').text());
    $('#MEMORY_TMP',$resize_capacity_dialog).val($('#memory_info').attr("one_value"));
    if ($('#vcpu_info').text() != "-") {
      $('#VCPU',$resize_capacity_dialog).val($('#vcpu_info').text());
    }

    $resize_capacity_dialog.foundation().foundation('reveal', 'open');
}


// Listeners to the nics operations (detach, saveas, attach)
function setup_vm_capacity_tab(){
    //setupSaveAsDialog();
    if (Config.isTabActionEnabled("vms-tab", "VM.resize")) {
      setupResizeCapacityDialog();


      $('#resize_capacity').live('click', function(){
          var b = $(this);
          var vm_id = b.parents('form').attr('vmid');

          popUpResizeCapacityDialog(vm_id);

          //b.html(spinner);
          return false;
      });
    }
}


function updateVMSnapshotsInfo(request,vm){
  $("li#vm_snapshot_tabTab").html(printSnapshots(vm.VM));
}

// Generates the HTML for the snapshot tab
// This is a list of disks with the save_as, detach options.
// And a form to attach a new disk to the VM, if it is running.
function printSnapshots(vm_info){
   var html ='\
           <form id="snapshot_form" vmid="'+vm_info.ID+'" >\
      <div class="row">\
      <div class="large-12 columns">\
         <table class="info_table dataTable extended_table">\
           <thead>\
             <tr>\
                <th>'+tr("ID")+'</th>\
                <th>'+tr("Name")+'</th>\
                <th>'+tr("Timestamp")+'</th>\
                <th>'+tr("Actions")+'</th>\
                <th>'

    if (Config.isTabActionEnabled("vms-tab", "VM.snapshot_create")) {
      // If VM is not RUNNING, then we forget about the attach disk form.
      if (vm_info.STATE == "3" && vm_info.LCM_STATE == "3"){
        html += '\
           <button id="take_snapshot" class="button tiny success right radius" >'+tr("Take snapshot")+'</button>'
      } else {
        html += '\
           <button id="take_snapshot" class="button tiny success right radius" disabled="disabled">'+tr("Take snapshot")+'</button>'
      }
    }

    html +=  '</th>\
              </tr>\
           </thead>\
           <tbody>';


    var snapshots = []
    if ($.isArray(vm_info.TEMPLATE.SNAPSHOT))
        snapshots = vm_info.TEMPLATE.SNAPSHOT
    else if (!$.isEmptyObject(vm_info.TEMPLATE.SNAPSHOT))
        snapshots = [vm_info.TEMPLATE.SNAPSHOT]

    if (!snapshots.length){
        html += '\
          <tr id="no_snapshots_tr">\
            <td colspan="6">' + tr("No snapshots to show") + '</td>\
          </tr>';
    }
    else {

        for (var i = 0; i < snapshots.length; i++){
            var snapshot = snapshots[i];

            if (
               ( // ACTIVE
                vm_info.STATE == "3") &&
               ( // HOTPLUG_SNAPSHOT
                vm_info.LCM_STATE == "24"))  {
              actions = 'snapshot in progress'
            }
            else {
              actions = '';

              if ((vm_info.STATE == "3" && vm_info.LCM_STATE == "3")) {
                if (Config.isTabActionEnabled("vms-tab", "VM.snapshot_revert")) {
                  actions += '<a href="VM.snapshot_revert" class="snapshot_revert" ><i class="fa fa-reply"/>'+tr("Revert")+'</a> &emsp;'
                }

                if (Config.isTabActionEnabled("vms-tab", "VM.snapshot_delete")) {
                  actions += '<a href="VM.snapshot_delete" class="snapshot_delete" ><i class="fa fa-times"/>'+tr("Delete")+'</a>'
                }
              }
            }

            html += '\
              <tr snapshot_id="'+(snapshot.SNAPSHOT_ID)+'">\
                <td>' + snapshot.SNAPSHOT_ID + '</td>\
                <td>' + snapshot.NAME + '</td>\
                <td>' + pretty_time(snapshot.TIME) + '</td>\
                <td>' + actions + '</td>\
            </tr>';
        }
    }

    html += '\
            </tbody>\
          </table>\
        </div>\
        </div>\
      </form>';

    return html;
}

function setupSnapshotDialog(){
    dialogs_context.append('<div id="snapshot_dialog"></div>');
    $snapshot_dialog = $('#snapshot_dialog',dialogs_context);
    var dialog = $snapshot_dialog;

    dialog.html('<div class="row">\
      <div class="large-12 columns">\
    <h3 class="subheader" id="">'+tr("Snapshot")+'</h3>\
  </div>\
</div>\
<form id="snapshot_form" action="">\
      <div class="row">\
          <div class="large-12 columns">\
              <label for="vm_id">'+tr("Virtual Machine ID")+':</label>\
              <label style="border-style: inset; background-color: lightgrey" type="text" name="vm_id" id="vm_id" disabled/>\
          </div>\
      </div>\
      <div class="row">\
          <div class="large-12 columns">\
              <label for="snapshot_name">'+tr("Snapshot name")+':</label>\
              <input type="text" name="snapshot_name" id="snapshot_name" />\
          </div>\
      </div>\
      <div class="form_buttons">\
          <button class="button radius right success" id="snapshot_live_button" type="submit" value="VM.saveas">'+tr("Take snapshot")+'</button>\
      </div>\
  <a class="close-reveal-modal">&#215;</a>\
</form>')

    dialog.addClass("reveal-modal").attr("data-reveal", "");
    setupTips(dialog);

    $('#snapshot_form',dialog).submit(function(){
        var vm_id = $('#vm_id', this).text();
        var snapshot_name = $('#snapshot_name', this).val();

        var obj = {
            snapshot_name : snapshot_name
        };

        Sunstone.runAction('VM.snapshot_create', vm_id, obj);

        $snapshot_dialog.foundation('reveal', 'close')
        return false;
    });
};

function popUpSnapshotDialog(vm_id){
    $('#vm_id',$snapshot_dialog).text(vm_id);
    $snapshot_dialog.foundation().foundation('reveal', 'open');
    $("input#snapshot_name",$snapshot_dialog).focus();
}




// Listeners to the disks operations (detach, saveas, attach)
function setup_vm_snapshot_tab(){
    if (Config.isTabActionEnabled("vms-tab", "VM.snapshot_create")) {
      setupSnapshotDialog();

      $('#take_snapshot').live('click', function(){
          var b = $(this);
          var vm_id = b.parents('form').attr('vmid');

          popUpSnapshotDialog(vm_id);

          //b.html(spinner);
          return false;
      });
    }

    if (Config.isTabActionEnabled("vms-tab", "VM.snapshot_revert")) {
      $('a.snapshot_revert').live('click', function(){
          var b = $(this);
          var vm_id = b.parents('form').attr('vmid');
          var snapshot_id = b.parents('tr').attr('snapshot_id');

          Sunstone.runAction('VM.snapshot_revert', vm_id, {"snapshot_id": snapshot_id});

          //b.html(spinner);
          return false;
      });
    }


    if (Config.isTabActionEnabled("vms-tab", "VM.snapshot_delete")) {
      $('a.snapshot_delete').live('click', function(){
          var b = $(this);
          var vm_id = b.parents('form').attr('vmid');
          var snapshot_id = b.parents('tr').attr('snapshot_id');

          Sunstone.runAction('VM.snapshot_delete', vm_id, {"snapshot_id": snapshot_id});

          //b.html(spinner);
          return false;
      });
    }
}


// Sets up the create-template dialog and all the processing associated to it,
// which is a lot.
function setupCreateVMDialog(include_select_image){

    dialogs_context.append('<div id="create_vm_dialog"  class="reveal-modal large max-height"" data-reveal></div>');
    //Insert HTML in place
    $create_vm_dialog = $('#create_vm_dialog')
    var dialog = $create_vm_dialog;
    dialog.html(create_vm_tmpl);
    $(document).foundation();
    //dialog.addClass("reveal-modal large max-height").attr("data-reveal", "");
    // Hide advanced options
   // $('.advanced',capacity_section).hide();

   // $('#advanced_capacity',capacity_section).click(function(){
   //     $('.advanced',capacity_section).toggle();
   //     return false;
   // });


    var dataTable_template_templates = $('#template_templates_table', dialog).dataTable({
        "bSortClasses": false,
        "bDeferRender": true,
        "iDisplayLength": 4,
        "bAutoWidth":false,
        "sDom" : '<"H">t<"F"p>',
        "aoColumnDefs": [
            { "sWidth": "35px", "aTargets": [0,1] },
//Ezilla redir start
            { "bVisible": false, "aTargets": [1,2,3,5]}
//Ezilla redir end
        ],
          "fnDrawCallback": function(oSettings) {
            var nodes = this.fnGetNodes();
            $.each(nodes, function(){
                if ($(this).find("td:eq(0)").html() == $('#TEMPLATE_ID', dialog).val()) {
                    $("td", this).addClass('markrow');
                    $('input.check_item', this).attr('checked','checked');
                }
            })
          }
    });

    // Retrieve the images to fill the datatable
    update_datatable_template_templates(dataTable_template_templates);

    $('#template_templates_table_search', dialog).keyup(function(){
      dataTable_template_templates.fnFilter( $(this).val() );
    })

    dataTable_template_templates.fnSort( [ [1,config['user_config']['table_order']] ] );

    $('#template_templates_table tbody', dialog).delegate("tr", "click", function(e){
        var aData = dataTable_template_templates.fnGetData(this);

        $("td.markrow", dataTable_template_templates).removeClass('markrow');
        $('tbody input.check_item', dataTable_template_templates).removeAttr('checked');

        $('#template_selected', dialog).show();
        $('#select_template', dialog).hide();
        $('.alert-box', dialog).hide();

        $("td", this).addClass('markrow');
        $('input.check_item', this).attr('checked','checked');

        $('#TEMPLATE_NAME', dialog).text(aData[4]);
        $('#TEMPLATE_ID', dialog).val(aData[1]);
        return true;
    });

    //Ezilla  - Show Passwd - Start
    $('#advanced_passwd', dialog).click(function(){
        $('.advanced_passwd', dialog).toggle();
        return false;
    });
    //Ezilla  - Show Passwd - End
    $("#refresh_template_templates_table_button_class").die();
    $("#refresh_template_templates_table_button_class").live('click', function(){
        update_datatable_template_templates($('#template_templates_table').dataTable());
    });

    if (include_select_image) {
      $("#select_image_step", dialog).show();
      var dataTable_template_images = $('#template_images_table', dialog).dataTable({
          "bSortClasses": false,
          "bDeferRender": true,
          "iDisplayLength": 4,
          "bAutoWidth":false,
          "sDom" : '<"H">t<"F"p>',
          "aoColumnDefs": [
              { "sWidth": "35px", "aTargets": [0,1] },
//Ezilla redir start
              { "bVisible": false, "aTargets": [0,2,3,7,8,5,9,12,13]}// if you want hideen any column , write here.
//Ezilla redir end
          ],
            "fnDrawCallback": function(oSettings) {
              var nodes = this.fnGetNodes();
              $.each(nodes, function(){
                  if ($(this).find("td:eq(0)").html() == $('#IMAGE_ID', dialog).val()) {
                      $("td", this).addClass('markrow');
                      $('input.check_item', this).attr('checked','checked');
                  }
              })
            }
      });

      // Retrieve the images to fill the datatable
      update_datatable_template_images(dataTable_template_images);

      $('#template_images_table_search', dialog).keyup(function(){
        dataTable_template_images.fnFilter( $(this).val() );
      })

      dataTable_template_images.fnSort( [ [1,config['user_config']['table_order']] ] );

      $('#template_images_table tbody', dialog).delegate("tr", "click", function(e){
          var aData = dataTable_template_images.fnGetData(this);

          $("td.markrow", dataTable_template_images).removeClass('markrow');
          $('tbody input.check_item', dataTable_template_images).removeAttr('checked');

          $('#image_selected', dialog).show();
          $('#select_image', dialog).hide();
          $('.alert-box', dialog).hide();

          $("td", this).addClass('markrow');
          $('input.check_item', this).attr('checked','checked');

          $('#IMAGE_NAME', dialog).text(aData[4]);
          $('#IMAGE_ID', dialog).val(aData[1]);
          return true;
      });

      $("#refresh_template_images_table_button_class").die();
      $("#refresh_template_images_table_button_class").live('click', function(){
          update_datatable_template_images($('#template_images_table').dataTable());
      });
    } else {
      $("#select_image_step", dialog).hide();
    }

    setupTips(dialog);

    $('#create_vm_form',dialog).submit(function(){
        var vm_name = $('#vm_name',this).val();
        var template_id = $('#TEMPLATE_ID',this).val();
        var n_times = $('#vm_n_times',this).val();
        var n_times_int=1;
//Ezilla - Check Passwd - Start
        if (!$('#user_passwd',this).is(":hidden")){
                var user_passwd = $('#user_passwd',this).val();
                var user_passwd_confirm = $('#user_passwd_confirm',this).val();
                var CheckData = /[|]|{|}|<|>|'|;|&|#|"|'|!| /;
                if (user_passwd != user_passwd_confirm){
                        notifyError(tr("These passwords don't match. Try again"));
                        return false;
                };

                if (user_passwd.length < 6){
                        notifyError(tr("Password must be at least 6 characters"));
                        return false;
                };

                if (CheckData.test(user_passwd)){
                        notifyError(tr("Don't allow special characters in your password !"));
                        return false;
                };
        };
//Ezilla - Check Passwd - End

        if (!template_id.length){
            notifyError(tr("You have not selected a template"));
            return false;
        };

        if (n_times.length){
            n_times_int=parseInt(n_times,10);
        };

        var extra_msg = "";
        if (n_times_int > 1) {
            extra_msg = n_times_int+" times";
        }

        notifySubmit("Template.instantiate",template_id, extra_msg);

        var extra_info = {};
        if ($("#IMAGE_ID", this).val()) {
          image_id = $("#IMAGE_ID", this).val();
          extra_info['template'] = {
            'disk': {
              'image_id': image_id
            }
          }
        }
//Ezilla - Create VM - Start
/*

        if (!vm_name.length){ //empty name use OpenNebula core default
            for (var i=0; i< n_times_int; i++){
                extra_info['vm_name'] = "";
                Sunstone.runAction("Template.instantiate_quiet", template_id, extra_info);
            };
        }
        else
        {
          if (vm_name.indexOf("%i") == -1){//no wildcard, all with the same name
              for (var i=0; i< n_times_int; i++){
                extra_info['vm_name'] = vm_name;
                Sunstone.runAction("Template.instantiate_quiet", template_id, extra_info);
              };
          } else { //wildcard present: replace wildcard
              for (var i=0; i< n_times_int; i++){
                  extra_info['vm_name'] = vm_name.replace(/%i/gi,i);
                  Sunstone.runAction("Template.instantiate_quiet", template_id, extra_info);
              };
          };
        }
*/
        Sunstone.runAction("VM.Template_submit", template_id );
//Ezilla - Create VM - End

        setTimeout(function(){
            Sunstone.runAction("VM.list");
        },1500);
        $create_vm_dialog.foundation('reveal', 'close')
        return false;
    });
}

// Open creation dialog
function popUpCreateVMDialog(include_select_image){
    setupCreateVMDialog(include_select_image);
    $create_vm_dialog.foundation().foundation('reveal', 'open');
    $("input#vm_name",$create_vm_dialog).focus();
}





// Sets up the create-template dialog and all the processing associated to it,
// which is a lot.
function setupDeployVMDialog(){

    dialogs_context.append('<div id="deploy_vm_dialog"></div>');
    //Insert HTML in place
    $deploy_vm_dialog = $('#deploy_vm_dialog')
    var dialog = $deploy_vm_dialog;
    dialog.html(deploy_vm_tmpl);
    dialog.addClass("reveal-modal large max-height").attr("data-reveal", "");

    var dataTable_deploy_hosts = $('#deploy_datatable_hosts', dialog).dataTable({
        "bSortClasses": false,
        "bDeferRender": true,
        "iDisplayLength": 4,
        "bAutoWidth":false,
        "sDom" : '<"H">t<"F"p>',
        "aoColumnDefs": [
              { "bSortable": false, "aTargets": ["check",5,6,7,8] },
              { "sWidth": "35px", "aTargets": [0] }, //check, ID, RVMS, Status,
              { "bVisible": false, "aTargets": [3,5,7,10,11,12]}
        ],
          "fnDrawCallback": function(oSettings) {
            var nodes = this.fnGetNodes();
            $.each(nodes, function(){
                if ($(this).find("td:eq(0)").html() == $('#HOST_ID', dialog).val()) {
                    $("td", this).addClass('markrow');
                    $('input.check_item', this).attr('checked','checked');
                }
            })
          }
    });

    // Retrieve the images to fill the datatable
    update_datatable_template_hosts(dataTable_deploy_hosts);

    $('#deploy_hosts_table_search', dialog).keyup(function(){
      dataTable_deploy_hosts.fnFilter( $(this).val() );
    })

    $('#deploy_datatable_hosts tbody', dialog).delegate("tr", "click", function(e){
        var aData = dataTable_deploy_hosts.fnGetData(this);

        $("td.markrow", dataTable_deploy_hosts).removeClass('markrow');
        $('tbody input.check_item', dataTable_deploy_hosts).removeAttr('checked');

        $('#host_selected', dialog).show();
        $('#select_host', dialog).hide();
        $('.alert-box', dialog).hide();

        $("td", this).addClass('markrow');
        $('input.check_item', this).attr('checked','checked');

        $('#HOST_NAME', dialog).text(aData[2]);
        $('#HOST_ID', dialog).val(aData[1]);
        return true;
    });

    $("#refresh_deploy_hosts_table_button_class").die();
    $("#refresh_deploy_hosts_table_button_class").live('click', function(){
        update_datatable_template_hosts($('#deploy_datatable_hosts').dataTable());
    });


    var dataTable_deploy_datastores = $('#deploy_datatable_datastores', dialog).dataTable({
      "bSortClasses": false,
      "bDeferRender": true,
      "iDisplayLength": 4,
      "bAutoWidth":false,
      "sDom" : '<"H">t<"F"p>',
      "aoColumnDefs": [
          { "sWidth": "35px", "aTargets": [0,1] },
          { "bVisible": false, "aTargets": [0,5,7,8,9,10] }
      ],
        "fnDrawCallback": function(oSettings) {
          var nodes = this.fnGetNodes();
          $.each(nodes, function(){
              if ($(this).find("td:eq(0)").html() == $('#DATASTORE_ID', dialog).val()) {
                  $("td", this).addClass('markrow');
                  $('input.check_item', this).attr('checked','checked');
              }
          })
        }
    });

    // Retrieve the images to fill the datatable
    update_datatable_template_datastores(dataTable_deploy_datastores);

    $('#deploy_datastores_table_search', dialog).keyup(function(){
    dataTable_deploy_datastores.fnFilter( $(this).val() );
    })

    $('#deploy_datatable_datastores tbody', dialog).delegate("tr", "click", function(e){
      var aData = dataTable_deploy_datastores.fnGetData(this);

      $("td.markrow", dataTable_deploy_datastores).removeClass('markrow');
      $('tbody input.check_item', dataTable_deploy_datastores).removeAttr('checked');

      $('#datastore_selected', dialog).show();
      $('#select_datastore', dialog).hide();
      $('.alert-box', dialog).hide();

      $("td", this).addClass('markrow');
      $('input.check_item', this).attr('checked','checked');

      $('#DATASTORE_NAME', dialog).text(aData[4]);
      $('#DATASTORE_ID', dialog).val(aData[1]);
      return true;
    });

    $("#refresh_deploy_datastores_table_button_class").die();
    $("#refresh_deploy_datastores_table_button_class").live('click', function(){
      update_datatable_template_datastores($('#deploy_datatable_datastores').dataTable());
    });

    dataTable_deploy_datastores.fnFilter("system",10);


    $('#advanced_deploy', dialog).hide();
    $('#advanced_toggle',dialog).click(function(){
        $('#advanced_deploy',dialog).toggle();
        return false;
    });

    setupTips(dialog);

    $('#deploy_vm_form',dialog).submit(function(){
        var extra_info = {};

        if ($('#HOST_ID', dialog).val()) {
            extra_info['host_id'] = $('#HOST_ID', dialog).val();
        } else {
            notifyError(tr("You have not selected a host"));
            return false;
        }

        extra_info['ds_id'] = $('#DATASTORE_ID', dialog).val() || -1
        extra_info['enforce'] = $("#enforce", this).is(":checked") ? true : false

        //notifySubmit("Template.instantiate",template_id, extra_msg);

        $.each(getSelectedNodes(dataTable_vMachines), function(index, elem) {
            Sunstone.runAction("VM.deploy_action", elem, extra_info);
        });

        $deploy_vm_dialog.foundation('reveal', 'close')
        return false;
    });
}

function setupMigrateVMDialog(live){
    dialogs_context.append('<div id="migrate_vm_dialog"></div>');
    //Insert HTML in place
    $migrate_vm_dialog = $('#migrate_vm_dialog')
    var dialog = $migrate_vm_dialog;
    dialog.html(migrate_vm_tmpl);
    dialog.addClass("reveal-modal large max-height").attr("data-reveal", "");

    var dataTable_migrate_hosts = $('#migrate_datatable_hosts', dialog).dataTable({
        "bSortClasses": false,
        "bDeferRender": true,
        "iDisplayLength": 4,
        "bAutoWidth":false,
        "sDom" : '<"H">t<"F"p>',
        "aoColumnDefs": [
              { "bSortable": false, "aTargets": ["check",5,6,7,8] },
              { "sWidth": "35px", "aTargets": [0] }, //check, ID, RVMS, Status,
              { "bVisible": false, "aTargets": [3,5,7,10,11,12]}
        ],
          "fnDrawCallback": function(oSettings) {
            var nodes = this.fnGetNodes();
            $.each(nodes, function(){
                if ($(this).find("td:eq(0)").html() == $('#HOST_ID', dialog).val()) {
                    $("td", this).addClass('markrow');
                    $('input.check_item', this).attr('checked','checked');
                }
            })
          }
    });

    $('tbody input.check_item:checked',dataTable_vMachines).each(function(){
        var data = dataTable_vMachines.fnGetData( $(this).closest('tr')[0] );
        $("#current_hosts_of_vms").append('<span class="radius secondary label">'+tr("VM")+' ['+$(this).val() + '] ' + tr("is currently running on Host") + ' [' + data[8] + ']</span><br>')
    });

    // Retrieve the images to fill the datatable
    update_datatable_template_hosts(dataTable_migrate_hosts);

    $('#migrate_hosts_table_search', dialog).keyup(function(){
      dataTable_migrate_hosts.fnFilter( $(this).val() );
    })

    $('#migrate_datatable_hosts tbody', dialog).delegate("tr", "click", function(e){
        var aData = dataTable_migrate_hosts.fnGetData(this);

        $("td.markrow", dataTable_migrate_hosts).removeClass('markrow');
        $('tbody input.check_item', dataTable_migrate_hosts).removeAttr('checked');

        $('#host_selected', dialog).show();
        $('#select_host', dialog).hide();
        $('.alert-box', dialog).hide();

        $("td", this).addClass('markrow');
        $('input.check_item', this).attr('checked','checked');

        $('#HOST_NAME', dialog).text(aData[2]);
        $('#HOST_ID', dialog).val(aData[1]);
        return true;
    });

    $("#refresh_migrate_hosts_table_button_class").die();
    $("#refresh_migrate_hosts_table_button_class").live('click', function(){
        update_datatable_template_hosts($('#migrate_datatable_hosts').dataTable());
    });

    $('#advanced_migrate', dialog).hide();
    $('#advanced_migrate_toggle',dialog).click(function(){
        $('#advanced_migrate',dialog).toggle();
        return false;
    });

    setupTips(dialog);

    $('#migrate_vm_form',dialog).submit(function(){
        var extra_info = {};

        if ($('#HOST_ID', dialog).val()) {
            extra_info['host_id'] = $('#HOST_ID', dialog).val();
        } else {
            notifyError(tr("You have not selected a host"));
            return false;
        }

        extra_info['enforce'] = $("#enforce", this).is(":checked") ? true : false

        //notifySubmit("Template.instantiate",template_id, extra_msg);

        $.each(getSelectedNodes(dataTable_vMachines), function(index, elem) {
          if (live) {
            Sunstone.runAction("VM.migrate_live_action", elem, extra_info);
          } else {
            Sunstone.runAction("VM.migrate_action", elem, extra_info);
          }
        });

        $migrate_vm_dialog.foundation('reveal', 'close')
        return false;
    });
}

// Open creation dialog
function popUpDeployVMDialog(){
    setupDeployVMDialog();
    $deploy_vm_dialog.foundation().foundation('reveal', 'open');
}


// Open creation dialog
function popUpMigrateVMDialog(live){
    setupMigrateVMDialog(live);
    $migrate_vm_dialog.foundation().foundation('reveal', 'open');
}

//This is taken from noVNC examples
function updateVNCState(rfb, state, oldstate, msg) {
    var s, sb, cad, klass;
    s = $D('VNC_status');
    sb = $D('VNC_status_bar');
    cad = $D('sendCtrlAltDelButton');
    switch (state) {
    case 'failed':
    case 'fatal':
        klass = "VNC_status_error";
        break;
    case 'normal':
        klass = "VNC_status_normal";
        break;
    case 'disconnected':
    case 'loaded':
        klass = "VNC_status_normal";
        break;
    case 'password':
        klass = "VNC_status_warn";
        break;
    default:
        klass = "VNC_status_warn";
    }

    if (state === "normal") { cad.disabled = false; }
    else                    { cad.disabled = true; }

    if (typeof(msg) !== 'undefined') {
        sb.setAttribute("class", klass);
        s.innerHTML = msg;
    }
}

//setups VNC application
function setupVNC(){

    //Append to DOM
    dialogs_context.append('<div id="vnc_dialog" style="width:auto; max-width:100%" title=\"'+tr("VNC connection")+'\"></div>');
    $vnc_dialog = $('#vnc_dialog',dialogs_context);
    var dialog = $vnc_dialog;

    dialog.html('\
  <div class="row">\
    <div class="large-12 columns">\
      <h3 class="subheader" id="vnc_dialog">'+tr("VNC")+' \
          <span id="VNC_status">'+tr("Loading")+'</span>\
          <span id="VNC_buttons">\
            <input type=button value="Send CtrlAltDel" id="sendCtrlAltDelButton">\
            <a id="open_in_a_new_window" href="" target="_blank" title="'+tr("Open in a new window")+'">\
              <i class="fa fa-external-link detach-vnc-icon"/>\
            </a>\
          </span>\
      </h3>\
    </div>\
  </div>\
  <div class="reveal-body" style="width:100%; overflow-x:overlay">\
    <canvas id="VNC_canvas" width="640px">\
        '+tr("Canvas not supported.")+'\
    </canvas>\
    <div id="VNC_status_bar" class="VNC_status_bar">\
    </div>\
  </div>\
  <a class="close-reveal-modal">&#215;</a>\
');

    dialog.addClass("reveal-modal large max-height").attr("data-reveal", "");

    $vnc_dialog.foundation();

    $("#open_in_a_new_window", dialog).on("click", function(){
      $vnc_dialog.foundation('reveal', 'close');
    });

    $('#sendCtrlAltDelButton',dialog).click(function(){
        rfb.sendCtrlAltDel();
        return false;
    });


    $('.vnc').live("click",function(){
        var id = $(this).attr('vm_id');

        //Ask server for connection params
        Sunstone.runAction("VM.startvnc_action",id);
        return false;
    });
}

// Open vnc window
function popUpVnc(){
    $.each(getSelectedNodes(dataTable_vMachines), function(index, elem) {
        Sunstone.runAction("VM.startvnc_action", elem);
    });
}

function vncCallback(request,response){
    rfb = new RFB({'target':       $D('VNC_canvas'),
                   'encrypt':      config['user_config']['vnc_wss'] == "yes",
                   'true_color':   true,
                   'local_cursor': true,
                   'shared':       true,
                   'updateState':  updateVNCState});

    var proxy_host = window.location.hostname;
    var proxy_port = config['system_config']['vnc_proxy_port'];
    var pw = response["password"];
    var token = response["token"];
    var vm_name = response["vm_name"];
    var path = '?token='+token;

    var url = "vnc?";
    url += "host=" + proxy_host;
    url += "&port=" + proxy_port;
    url += "&token=" + token;
    url += "&password=" + pw;
    url += "&encrypt=" + config['user_config']['vnc_wss'];
    url += "&title=" + vm_name;

    $("#open_in_a_new_window").attr('href', url)
    rfb.connect(proxy_host, proxy_port, pw, path);
    $vnc_dialog.foundation("reveal", "open");

    $vnc_dialog.off("closed");
    $vnc_dialog.on("closed", function () {
      rfb.disconnect();
    });
}

// returns true if the vnc button should be enabled
function enableVnc(vm){
    var graphics = vm.TEMPLATE.GRAPHICS;
    var state = OpenNebula.Helper.resource_state("vm_lcm",vm.LCM_STATE);

    return (graphics &&
        graphics.TYPE &&
        graphics.TYPE.toLowerCase() == "vnc" &&
        $.inArray(state, VNCstates)!=-1);
}

// Ezilla redirect start 
// returns true if the spice button should be enabled
function enableSpice(vm){
    var graphics = vm.TEMPLATE.GRAPHICS;
    var state = OpenNebula.Helper.resource_state("vm_lcm",vm.LCM_STATE);

    return (graphics &&
        graphics.TYPE &&
        graphics.TYPE.toLowerCase() == "spice" &&
        state == tr("RUNNING"));
}

function vncIcon(vm){
    var gr_icon;
    var port = vm.TEMPLATE.GRAPHICS.PORT;

    if (enableVnc(vm)){
        gr_icon = '<a class="vnc" href="#" vm_id="'+vm.ID+'">';
        gr_icon += '<i class="fa fa-desktop" style="color: rgb(111, 111, 111)"/>';
    }
    else if (enableSpice(vm)){
        gr_icon =  '<a class="redir_spice" href="#" vm_id="'+vm.ID+'" vm_port="'+port+'" vm_loc="spice">';
        //Ezilla Need to modify
        gr_icon += '<i class="fa fa-desktop" style="color: rgb(111, 111, 111);"/>';
    }
    else {
        gr_icon = '';
    }

    gr_icon += '</a>'
    return gr_icon;
}

function setupRedirectPort(){
    //Append to DOM
    dialogs_context.append('<div id="redir_dialog" style="width:auto; max-width:70%" title=\"'+tr("Endpoint connection")+'\"></div>');
    $redir_dialog = $('#redir_dialog',dialogs_context);
    var dialog = $redir_dialog;

    dialog.html('\
            <div class="reveal-body" >\
                <table border=0 width="100%"><tr>\
                <td width="200"><div id="RedirectPort_Info_image"></div></td>\
                </div>\
                <td><div id="RedirectPort_Info_output">'+tr("Loading")+'</td>\
                </div>\
                </tr></table>\
            </div>\
        <a class="close-reveal-modal">&#215;</a>\
    ');

    dialog.addClass("reveal-modal large max-height").attr("data-reveal", "");
    $redir_dialog.foundation();
    //dialog.addClass("reveal-modal medium");

    $('.redir_spice').live("click",function(){

        var id=$(this).attr('vm_id');
                var port = $(this).attr('vm_port');
                var loc = $(this).attr('vm_loc');
                if (loc == "spice"){
                        Sunstone.runAction("VM.redirspice",id,port);
                }
                return false;
    });
    $('.redir').live("click",function(){
        var id = $(this).attr('vm_id');
        var port = $(this).attr('vm_port');
        var loc = $(this).attr('vm_loc');
        Sunstone.runAction("VM.redirect",id,port);
        $('.redir').addClass('disable_redir');
        $('.redir').removeClass('redir');
        return false;
    });
}

function RedirectPortCallback(request,response){
    setTimeout(function(){
    var srv_hostname = window.location.host;

    if ( srv_hostname.search(":") > 0 ){
            srv_hostname = srv_hostname.substring(0,srv_hostname.indexOf(":"));
    }
    else{
        srv_hostname = srv_hostname;
    }
    var port;
    var id = response["id"];
    if ( response["loc"]  == "spice" ){
        port = $(".redir_spice").attr('vm_port');
        spice_password=response["spice_pw"];
    }
    else{
        port = response["cport"];
    }
    var connecting_tool_image ='<a class="connecting_info">';
    var connecting_tool;
    if ( port == "3389" ){
        connecting_tool = tr("You can use the connect information to connect to the virtual machine via RDP client.");
        connecting_tool_image += '<img src="images/rdp_icon_big.png" /></a>';
    }
    else{
        if ( port == "22" ){
            connecting_tool = tr("You can use the connect information to connect to the virtual machine via SSH client.");
            connecting_tool_image += '<img src="images/ssh_icon_big.png"/></a>';
        }
        else{
            connecting_tool = tr("SPICE protocol password")+"<input type=text readonly=false id=\'spice_protocol_password\' value="+spice_password+" style=\'width:250px;height:15px;\'/>";
            connecting_tool += tr("You can use the connect information to connect to the virtual machine via SPICE client");
            connecting_tool += '<hr style=margin:5px;width=100%>';
            connecting_tool += '<h6 style=margin-top:0px>'+tr("EzView")+'</h6>';
            connecting_tool += '<a target="_blank" style=margin-right:5px href="http://ezilla.info/index.php/EzillaTW/Download#EzView">'+tr("Download")+'</a>'
//            connecting_tool += '<hr style=margin:5px;width=100%>';
            //connecting_tool += '<h6 style=margin-top:0px>'+tr("How To use SPICE client?")+'</h6>';
//            connecting_tool += tr("choose your operating system and follow behind tutorial, please.")+'</br></br>';
            connecting_tool += '<a target="_blank" href="http://easycloud.nchc.org.tw/user_doc/Login/EzView/#h.5cppqt4nzlj">'+tr("Tutorial")+'</a>'

            connecting_tool_image += '<img src="images/spice_icon_big.png" /></a>';
        }
    }
    $('#RedirectPort_Info_image').html(connecting_tool_image);
    $('#RedirectPort_Info_output').html(tr("Endpoint Information")+'<input type=text readonly=false id=\'connecting_textarea\' value=\"\" style=\'width:250px;height:15px;\'/>'+connecting_tool);

    $('#connecting_textarea').attr("value",function(){
    return  srv_hostname+":"+response["info"];
    });

    $redir_dialog.foundation("reveal", "open");
    $redir_dialog.off("closed");
    $redir_dialog.on("closed", function () {
             $('.disable_redir').addClass('redir');
             $('redir').removeClass('disable_redir');
    });

    },1000);
};

function redirectPortIcon(vm){
    var redir_icon;
    var ostype;
    var state = OpenNebula.Helper.resource_state("vm_lcm",vm.LCM_STATE);
    if (typeof(vm.TEMPLATE.CONTEXT) != "undefined"){
        if (typeof(vm.TEMPLATE.CONTEXT.OSTYPE) != "undefined"){
            ostype = vm.TEMPLATE.CONTEXT.OSTYPE;
            if ( ostype == "WINDOWS"  && state == tr("RUNNING") ){
                redir_icon = '<a class="redir" href="#" vm_id="'+vm.ID+'" vm_port="3389">';
                redir_icon += '<i class="fa fa-desktop" style="color:rgb(111, 111, 111);"></i></a>';
            }
            else if ( ostype == "WINDOWS" && state != tr("RUNNING") ){
                redir_icon='';
            }
            else if ( ostype != "WINDOWS" && state == tr("RUNNING") ) {
                redir_icon = '<a class="redir" href="#" vm_id="'+vm.ID+'" vm_port="22">';
                redir_icon += '<i class="fa fa-desktop" style="background-color:rgb(111,111,111);"></i></span></a>';

            }
            else {
                redir_icon='';
            }
        }
        else{
            redir_icon = "";
        }
   }
   else{
        redir_icon  = "";
   }
    return redir_icon;

}
// Ezilla redirect end

// Special error callback in case historical monitoring of VM fails
function vmMonitorError(req,error_json){
    var message = error_json.error.message;
    var info = req.request.data[0].monitor;
    var labels = info.monitor_resources;
    var id_suffix = labels.replace(/,/g,'_');
    var id = '#vm_monitor_'+id_suffix;
    $('#vm_monitoring_tab '+id).html('<div style="padding-left:20px;">'+message+'</div>');
}

// At this point the DOM is ready and the sunstone.js ready() has been run.
$(document).ready(function(){
    var tab_name = 'vms-tab';

    if (Config.isTabEnabled(tab_name)) {
      dataTable_vMachines = $("#datatable_vmachines",main_tabs_context).dataTable({
            "bSortClasses": false,
            "bDeferRender": true,
            "aoColumnDefs": [
//Ezilla redir start
              { "bSortable": false, "aTargets": ["check",6,7,9,11,12] },
//Ezilla redir End
              { "sWidth": "35px", "aTargets": [0] },
              { "bVisible": true, "aTargets": Config.tabTableColumns(tab_name)},
              { "bVisible": false, "aTargets": ['_all']},
          ]
      });

      $('#vms_search').keyup(function(){
        dataTable_vMachines.fnFilter( $(this).val() );
      })

      dataTable_vMachines.on('draw', function(){
        recountCheckboxes(dataTable_vMachines);
      })


      Sunstone.runAction("VM.list");

      setupVNC();
//Ezilla redir start
      setupRedirectPort();
//Ezilla redir end
      hotpluggingOps();
      setup_vm_network_tab();
      setup_vm_capacity_tab();
      setup_vm_snapshot_tab();

      initCheckAllBoxes(dataTable_vMachines);
      tableCheckboxesListener(dataTable_vMachines);
      infoListener(dataTable_vMachines,'VM.show');

      $('div#vms_tab div.legend_div').hide();


      dataTable_vMachines.fnSort( [ [1,config['user_config']['table_order']] ] );
    }
})
