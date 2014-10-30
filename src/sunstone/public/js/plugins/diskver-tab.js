/*-------------------------------------------------------------------------------*/
/* Copyright (C) 2013                                                            */
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
/*         Serena Yi-Lun Pan <serenapan _at_ nchc narl org tw>                   */
/*         Hsi-En Yu <yun _at_  nchc narl org tw>                                */
/*         Hui-Shan Chen  <chwhs _at_ nchc narl org tw>                          */
/*         Kuo-Yang Cheng  <kycheng _at_ nchc narl org tw>                       */
/*         CHI-MING Chen <jonchen _at_ nchc narl org tw>                         */
/*-------------------------------------------------------------------------------*/
var diskver_dialog;
var config_response;
var ezilla_diskver_step1 = '\
';
var ezilla_diskver_wizard ='\
<div class="reveal-body">\
<table align="center"  border="0" cellpadding="0" cellspacing="0">\
    <tbody><tr><td>\
        <div id="wizard" class="swMain">\
            <ul class="anchor">\
                <li><a href="#step-1" class="selected" isdone="1" rel="1">\
                    <label class="stepNumber">1</label>\
                    <span class="stepDesc">\
                       Step 1<br>\
                       <small>'+tr("Welcome")+'</small>\
                    </span>\
                </a></li>\
                <li><a href="#step-2" class="disabled" isdone="0" rel="2">\
                    <label class="stepNumber">2</label>\
                    <span class="stepDesc">\
                       Step 2<br>\
                       <small>'+tr("Choose Your Installation")+'</small>\
                    </span>\
                </a></li>\
                <li><a href="#step-3" class="disabled" isdone="0" rel="3">\
                    <label class="stepNumber">3</label>\
                    <span class="stepDesc">\
                       Step 3<br>\
                       <small>'+tr("Disk enviroment")+'</small>\
                    </span>\
                 </a></li>\
                <li><a href="#step-4" class="disabled" isdone="0" rel="4">\
                    <label class="stepNumber">4</label>\
                    <span class="stepDesc">\
                       Step 4<br>\
                       <small>'+tr("Network enviroment")+'</small>\
                    </span>\
                </a></li>\
                 <li><a href="#step-5" class="disabled" isdone="0" rel="5">\
                    <label class="stepNumber">5</label>\
                    <span class="stepDesc">\
                       Step 5<br>\
                       <small>'+tr("Finish")+'</small>\
                    </span>\
                </a></li>\
            </ul>\
            <div id="step-1" class="content" style="display: block;">\
                <h2 class="StepTitle">'+tr("Welcome")+'</h2>\
                <div class="StepContext">\
                    '+tr("Welcome to Ezilla-diskver setup")+'<br>\
                    '+tr("The wizard will help your setup your ezilla slave node.")+'<br>\
                    '+tr("When you finish the wizard , must booting your slave node for installation.")+'<br>\
                </div>\
            </div>\
            <div id="step-2" class="content" style="display: none; ">\
                <h2 class="StepTitle">'+tr("Choose Your Installation")+'</h2>\
                <div class="StepContext">\
                    '+tr("You can select Install mode on this section")+'<br>\
                    <form>\
<!-----             <input type="radio" name="install_mode" value="default" ><label>'+tr("Default")+'</label><br>---->\
                    <input type="radio" name="install_mode" value="custom" checked ><label>'+tr("Custom")+'</label><br>\
                    </form>\
                </div>\
            </div>\
            <div id="step-3" class="content" style="display: none; ">\
                <h2 class="StepTitle">'+tr("Slave node Disk enviroment")+'</h2>\
                <div class="StepContext">\
                    '+tr("What kind of the disk is used to install ezilla project on your server? MAX: 2 disks")+'<br>\
                    <label>sda</label><input type="checkbox" name="disk" value="sda" checked ><br>\
                    <label>sdb</label><input type="checkbox" name="disk" value="sdb" ><br>\
                    <label>sdc</label><input type="checkbox" name="disk" value="sdc" ><br>\
                    <label>sdd</label><input type="checkbox" name="disk" value="sdd" ><br>\
<!-----             <label>'+tr("Other")+'</label><input id="disk_other" type="text" name="disk" value=""><br> ---->\
                    <hr>\
                    '+tr("What kind of the file system is used to put VM images?")+'<br>\
<!-----             <label>SCP</label><input type="radio" name="filesystem" value="scp"><br>------>\
                    <label>NFS</label><input type="radio" name="filesystem" value="nfs"><br>\
                    <label>CEPH</label><input type="radio" name="filesystem" value="ceph" checked><br>\
               </div>\
            </div>\
            <div id="step-4" class="content" style="display: none; ">\
                <h2 class="StepTitle">'+("Slave node Network enviroment")+'</h2>\
                <div class="StepContext">\
                    '+tr("How many network card of the machine in your environments?")+'<br>\
                    <label style="width:200px">1 Ethernet card</label><input type="radio" name="net_card" value="1" checked="checked" ><br>\
<!----                    <label style="width:200px">2 Ethernet card</label><input type="radio" name="net_card" value="2" ><br>----->\
                </div>\
            </div>\
            <div id="step-5" class="content" style="display: none; ">\
                <h2 class="StepTitle">'+("Complete")+'</h2>\
                <div  class="StepContext">\
                    '+("Setup has finished")+'<br>\
                    '+("then Must boot your Slave Node")+'<br>\
                    '+("AND Follow Your Bios guide,step by step.set slave node with pxe booting ")+'<br>\
                </div>\
            </div>\
        </div>\
   </td></tr></tbody>\
    </table>\
</div>\
<a class="close-reveal-modal">&#215;</a>';

var diskver_tab_content =
'<form>\
<table id="diskver_table" style="width:100%">\
    <tr>\
      <td>\
    <div class ="panel">\
<h3>'+tr("Ezilla  Auto-Installation Configuration") + '</h3>\
    <div class="panel_info">\
        <table class="info_table">\
        <tr>\
            <td class="key_td">'+tr("Ezilla Auto-Installation Service for Slave node") +'</td>\
            <td class="value_td">\
                <input type="checkbox" class="iButton" id="EzillaAutoInstallation"/>\
            </td>\
        </tr>\
        <tr id="SetupYourSlaveEnvironment" style="display:none;" >\
            <td class="key_td">'+tr("Set up Your Slave environment") +'</td>\
            <td class="value_td" style="text-align:left;"><button type="button" style="height:27px;width:89px;" id="setupSlaveEnv">'+tr("setup")+'</button>\
            </td>\
        </tr>\
          </table>\
        </div>\
        </div>\
    </td>\
  </tr>\
</table>\
</form>';

var diskver_actions = {
    "Diskver.startInstallServ" :  {
        type : "single",
        call : OpenNebula.Diskver.startInstallServ,
        callback : notifyError("OK"),
        error: onError,
        notify :true
    },
    "Diskver.stopInstallServ" : {
        type : "single",
        call : OpenNebula.Diskver.stopInstallServ,
        callback : notifyError("OK"),
        error: onError,
        notify: true        
    },
    "Diskver.wizardSetup": {
        type: "custom",
        call : OpenNebula.Diskver.wizardSetup,
        callback : notifyError("OK"),
        error:onError,
        notify: true
    },
    "Diskver.statusInstallServ":{
        type: "single",
        call: OpenNebula.Diskver.statusInstallServ,
        callback:button_with_ezilla_autoinstall_service,
        error: onError
        //notify: true
    }
   
};

var diskver_tab = {
    title: '<i class="icon-magic"></i>'+tr("Set up Slave Node"),
    content: diskver_tab_content,
    //tabClass: "subTab"
};
Sunstone.addActions(diskver_actions);
Sunstone.addMainTab('diskver-tab',diskver_tab);

function button_with_ezilla_autoinstall_service(response){
    var status = response["status"];
    if ( status == 0 ){
     $('input#EzillaAutoInstallation').attr('checked',true);
     $('input#EzillaAutoInstallation').iButton('repaint');
     $('#diskver_table #SetupYourSlaveEnvironment').show();
    }
}

// Update secure websockets configuration
// First we perform a User.show(). In the callback we update the user template
// to include this parameter.
// Then we post to the server configuration so that it is saved for the session
// Note: the session is originally initialized to the user VNC_WSS if present
// otherwise it is set according to sunstone configuration
// TO DO improve this, server side should take care

// ezilla disk-ver setup .
// dialog ver = diskver_dialog
//

function setupDiskVerSetting(){
    dialogs_context.append('<div title=\"'+tr("Setting Ezilla Disk-ver environment")+'\" id="diskver_dialog" class="diskver_class"></div>');
    $diskver_dialog = $('#diskver_dialog',dialogs_context);
    var dialog = $diskver_dialog;
    dialog.html(ezilla_diskver_wizard);
    dialog.addClass("reveal-modal large max-height").attr("data-reveal","");
    Sunstone.runAction("Diskver.statusInstallServ");
    $diskver_dialog.foundation(); 
    
    $('div#wizard').smartWizard({
        onLeaveStep:leaveAStepCallback,
        onFinish:onFinishCallback
    });
    $('button#setupSlaveEnv').click(function(){
        $diskver_dialog.foundation("reveal","open");
    });
  

 
    $('input#EzillaAutoInstallation').iButton({
    change:function($input){
        if ( $input.is(":checked") ){
            Sunstone.runAction("Diskver.startInstallServ");
            $('#diskver_table #SetupYourSlaveEnvironment').show();
        }
        else {
            Sunstone.runAction("Diskver.stopInstallServ");
            $('#diskver_table #SetupYourSlaveEnvironment').hide();
        }
    }
    }); // ibutton example.
};
function leaveAStepCallback(obj){
        var step_num= obj.attr('rel'); // get the current step number
        return validateSteps(step_num); // return false to stay on step and true to continue navigation 
}
function onFinishCallback(){
        var  diskver_wizard = $('div#wizard');
        install_mode = $('input[name=install_mode]:checked',diskver_wizard).val();
        disk = new Array();
        $('input[name=disk]:checked',diskver_wizard).each(function(i){
            disk[i] = this.value;
        });
        
        filesystem = $('input[name=filesystem]:checked',diskver_wizard).val();
        net_card = $('input[name=net_card]:checked',diskver_wizard).val();
        var config_diskver = {
            "install_mode":install_mode, 
            "disk":disk,            
            "filesystem":filesystem,
            "net_card":net_card
        };
        Sunstone.runAction("Diskver.wizardSetup",config_diskver);
        dialog = $('#diskver_dialog');
        dialog.foundation("reveal","close");

}
function validateSteps2(){
    var isValid = true;
    var install_mode =  $('input[name=install_mode]:checked','div#wizard').val();
  
    if ( install_mode == undefined ){
            console.log("install_mode == undefined");
            isValid = false;            
    }
    return isValid;
}
function validateSteps3(){
    var isValid = true;
    disk = new Array();
    $('input[name=disk]:checked','div#wizard').each(function(i){
            disk[i] = this.value;
    });
    if (disk.length <= 0 || disk.length > 2){
            isValid = false;
    }
    var filesystem = $('input[name=filesystem]:checked','div#wizard').val();
    
    if ( filesystem == undefined  ){
            isValid = false; 
    }
    return isValid;
}
function validateSteps4(){
    var isValid = true;
    var net_card = $('input[name=net_card]:checked','div#wizard').val();
    if ( net_card == undefined ){
            isValid = false;            
    }
    return isValid;
}
function validateSteps(stepnumber){
        var isStepValid = true;
        // validate step 1
        if(stepnumber == 2){
            if (validateSteps2() == false){
            isStepValid = false;
                $('div#wizard').smartWizard('showMessage','Please correct the errors in step'+stepnumber+ ' and click next.');
                $('div#wizard').smartWizard('setError',{stepnum:stepnumber,iserror:true});            
            }
            else{
                $('div#wizard').smartWizard('setError',{stepnum:stepnumber,iserror:false});
            }
        }
        if(stepnumber == 3){
            if (validateSteps3() == false){
            isStepValid = false;
                $('div#wizard').smartWizard('showMessage','Please correct the errors in step'+stepnumber+ ' and click next.');
 
                $('div#wizard').smartWizard('setError',{stepnum:stepnumber,iserror:true});            
            }
            else{
                $('div#wizard').smartWizard('setError',{stepnum:stepnumber,iserror:false});
            }
        }
        if(stepnumber == 4){
            if (validateSteps4() == false){
            isStepValid = false;
                $('div#wizard').smartWizard('showMessage','Please correct the errors in step'+stepnumber+ ' and click next.'); 
                $('div#wizard').smartWizard('setError',{stepnum:stepnumber,iserror:true});            
            }
            else{
                $('div#wizard').smartWizard('setError',{stepnum:stepnumber,iserror:false});
            }
        }
        if (!isStepValid){
            $('div#wizard').smartWizard('showMessage','Please correct the errors in the steps and continue');
        }
        return isStepValid; 

}
function validateAllSteps(){

    if(validateStep2() == false){
        isStepValid = false;
        $('div#wizard').smartWizard('setError',{stepnum:2,iserror:true});         
   }else{
        $('div#wizard').smartWizard('setError',{stepnum:2,iserror:false});
   }
       
   if(validateStep3() == false){
        isStepValid = false;
        $('div#wizard').smartWizard('setError',{stepnum:3,iserror:true});         
   }else{
        $('div#wizard').smartWizard('setError',{stepnum:3,iserror:false});
   }
   if(validateStep4() == false){
        isStepValid = false;
        $('div#wizard').smartWizard('setError',{stepnum:3,iserror:true});
   }else{
        $('div#wizard').smartWizard('setError',{stepnum:3,iserror:false});
   }

   if(!isStepValid){
        $('div#wizard').smartWizard('showMessage','Please correct the errors in the steps and continue');
   }
              
   return isStepValid;
}
$(document).ready(function(){

    var tab_name = 'diskver_tab';
    console.log(Config.isTabEnabled(tab_name));
    //$('#iButton').iButton();
    setupDiskVerSetting(); 
});
