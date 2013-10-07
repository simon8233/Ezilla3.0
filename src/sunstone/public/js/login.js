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

function auth_success(req, response){
    window.location.href = ".";
}

function auth_error(req, error){

    var status = error.error.http_status;

    switch (status){
    case 401:
        $("#error_message").text("Invalid username or password");
        break;
    case 500:
        $("#error_message").text("OpenNebula is not running or there was a server exception. Please check the server logs.");
        break;
    case 0:
        $("#error_message").text("No answer from server. Is it running?");
        break;
    default:
        $("#error_message").text("Unexpected error. Status "+status+". Check the server logs.");
    };
    $("#error_box").fadeIn("slow");
    $("#login_spinner").hide();
}

function authenticate(){
    var username = $("#username").val();
    var password = $("#password").val();
    var remember = $("#check_remember").is(":checked");

    $("#error_box").fadeOut("slow");
    $("#login_spinner").show();

    OpenNebula.Auth.login({ data: {username: username
                                    , password: password}
                            , remember: remember
                            , success: auth_success
                            , error: auth_error
                        });
}

function getInternetExplorerVersion(){
// Returns the version of Internet Explorer or a -1
// (indicating the use of another browser).
    var rv = -1; // Return value assumes failure.
    if (navigator.appName == 'Microsoft Internet Explorer')
    {
        var ua = navigator.userAgent;
        var re  = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
        if (re.exec(ua) != null)
            rv = parseFloat( RegExp.$1 );
    }
    return rv;
}

function checkVersion(){
    var ver = getInternetExplorerVersion();

    if ( ver > -1 ){
        msg = ver <= 7.0 ? "You are using an old version of IE. \
Please upgrade or use Firefox or Chrome for full compatibility." :
        "OpenNebula Sunstone is best seen with Chrome or Firefox";
        $("#error_box").text(msg);
        $("#error_box").fadeIn('slow');
    }
}

$(document).ready(function(){
    $("#login_form").submit(function (){
        authenticate();
        return false;
    });

    //compact login elements according to screen height
    if (screen.height <= 600){
        $('div#logo_sunstone').css("top","15px");
        $('div#login').css("top","10px");
        $('.error_message').css("top","10px");
    };

    $("input#username.box").focus();
    $("#login_spinner").hide();

    checkVersion();
});
