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
/*         Serena Yi-Lun Pan <serenapan _at_ nchc narl org tw>                   */
/*         Hsi-En Yu <yun _at_  nchc narl org tw>                                */
/*         Hui-Shan Chen  <chwhs _at_ nchc narl org tw>                          */
/*         Kuo-Yang Cheng  <kycheng _at_ nchc narl org tw>                       */
/*         CHI-MING Chen <jonchen _at_ nchc narl org tw>                         */
/*-------------------------------------------------------------------------------*/

var activeTab;
var outerLayout, innerLayout;

function hideDialog(){
    innerLayout.close("south");
}

function popDialog(content){
    $("#dialog").html(content);
    innerLayout.open("south");
}

function popDialogLoading(){
    var loading = '<div style="margin-top:'+Math.round($("#dialog").height()/6)+'px; text-align: center; width: 100%"><img src="images/pbar.gif" alt="loading..." /></div>';
    popDialog(loading);
}

function showTab(tabname,highlight_tab){
    //Since menu items no longer have an <a> element
    //we no longer expect #tab_id here, but simply tab_id
    //So safety check - remove # from #tab_id if present to ensure compatibility

    //$('tbody input.check_item:checked').click();
    //$('td').removeClass('markrowchecked markrowselected');
    last_selected_row = null;

    if (tabname.indexOf('#') == 0)
        tabname = tabname.substring(1);
    if (highlight_tab && highlight_tab.indexOf('#') == 0)
        highlight_tab == highlight.substring(1);

    var activeTab = tabname;

    if (!highlight_tab) highlight_tab = activeTab;

    //clean selected menu
    $("#navigation li").removeClass("navigation-active-li");
    $("div#header ul#menutop_ul li").removeClass("navigation-active-li");

    //select tab in left menu
    var li = $("#navigation li#li_"+highlight_tab)
    li.addClass("navigation-active-li");

    //select tab in top menu
    var top_li = $("div#header ul#menutop_ul li#top_"+highlight_tab);
    top_li.addClass("navigation-active-li");


    //show tab
    $(".tab").hide();
    $('#'+activeTab).show();

    $("#refresh_buttons button", $('#'+activeTab)).click()

    innerLayout.close("south");
}

function setupTabs(){

    var topTabs = $(".outer-west ul li.topTab");
    var subTabs = $(".outer-west ul li.subTab");

    subTabs.live("click",function(){
        //leave floor to topTab listener in case of tabs with both classes
        if ($(this).hasClass('topTab')) return false;

        var tab = $(this).attr('id').substring(3);
        showTab(tab);
        return false;
    });

    topTabs.live("click",function(e){
        var tab = $(this).attr('id').substring(3);
        //Subtabs have a class with the name of  this tab
        var subtabs = $('div#menu li.'+tab);

        //toggle subtabs only when clicking on the icon or when clicking on an
        //already selected menu
        if ($(e.target).is('span') ||
            $(this).hasClass("navigation-active-li") ||
            $(this).hasClass("tab_with_no_content")){
            //for each subtab, we hide the subsubtabs
            subtabs.each(function(){
                //for each subtab, hide its subtabs
                var subsubtabs = $(this).attr('id').substr(3);
                //subsubtabs class
                subsubtabs = $('div#menu li.'+subsubtabs);
                subsubtabs.hide();
            });
            //hide subtabs and reset icon to + position, since all subsubtabs
            //are hidden
            subtabs.fadeToggle('fast');
            $(this).removeClass('active');
            $('span',subtabs).removeClass(' icon-caret-down');
            $('span',subtabs).addClass(' icon-caret-left');
            //toggle icon on this tab
            $('span',this).toggleClass(' icon-caret-left  icon-caret-down');
            return false;
        }
        else {
            showTab(tab);
            return false;
        }
        //if we are clicking on the icon only, do not show the tab
        if ($(e.target).is('span')) return false;


    });

};

function setupTopMenu(){
    $('div#header ul#menutop_ul li').live('click',function(){
        var tab = "#" + $(this).attr('id').substring(4);
        showTab(tab);
    });
};

function changeInnerLayout(factor){
    var dialog_height = Math.floor($(".outer-center").height()*factor);
    innerLayout.sizePane("south", dialog_height)
}

$(document).ready(function () {
    $(".tab").hide();

    setupTabs();
    setupTopMenu();

    outerLayout = $('body').layout({
        applyDefaultStyles:       false
    ,   center__paneSelector:	".outer-center"
    ,	west__paneSelector:		".outer-west"
    ,	west__size:				240
    ,	north__size:			26
    ,   south__size:            26
    ,	spacing_open:			0 // ALL panes
    ,	spacing_closed:			0 // ALL panes
    //,	north__spacing_open:	0
    //,	south__spacing_open:	0
    ,   west__spacing_open:      10
    ,   west__spacing_closed:    10
    ,   west__togglerContent_open:   '<i class="icon-angle-left">'
    ,   west__togglerContent_closed: '<i class="icon-angle-right">'
    ,	north__maxSize:			200
    ,	south__maxSize:			200
    ,   south__closable:        false
    ,   north__closable:        false
    ,   west__closable:         true
    ,   south__resizable:       false
    ,   north__resizable:       false
    ,   west__resizable:        false
    });

    var factor = 0.5;
    var dialog_height = Math.floor($(".outer-center").height()*factor);
    innerLayout = $('div.outer-center').layout({
        fxName:                 "slide"
    ,   initClosed:             true
    ,   center__paneSelector:   ".inner-center"
    ,   south__paneSelector:    ".inner-south"
    ,   south__size:            dialog_height
    ,   south__togglerContent_open:   '<i class="icon-angle-down">'
    ,   south__togglerContent_closed: '<i class="icon-angle-up">'
    ,   south__resizable:       true
    ,   south__spacing_open:      10
    ,   south__spacing_closed:    0
    ,   north__resizable:       true
    ,   north__spacing_open:      10
    ,   spacing_open:           5  // ALL panes
    ,   spacing_closed:         5 // ALL panes
    });

});
