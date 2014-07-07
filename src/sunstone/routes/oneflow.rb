#-------------------------------------------------------------------------------
# Copyright (C) 2013-2014
#
# This file is part of ezilla.
#
# This program is free software: you can redistribute it and/or modify it
# under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful, but WITHOUT
# ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
# FOR A PARTICULAR PURPOSE. See the GNU General Public License
# for more details.
#
# You should have received a copy of the GNU General Public License along with
# this program. If not, see <http://www.gnu.org/licenses/>
#
# Author: Chang-Hsing Wu <hsing _at_ nchc narl org tw>
#         Serena Yi-Lun Pan <serenapan _at_ nchc narl org tw>
#         Hsi-En Yu <yun _at_  nchc narl org tw>
#         Hui-Shan Chen  <chwhs _at_ nchc narl org tw>
#         Kuo-Yang Cheng  <kycheng _at_ nchc narl org tw>
#         CHI-MING Chen <jonchen _at_ nchc narl org tw>
#-------------------------------------------------------------------------------

$: << RUBY_LIB_LOCATION+"/oneflow"

require 'opennebula/oneflow_client'


helpers do
    def af_build_client
        flow_client = $cloud_auth.client(session[:user])
        split_array = flow_client.one_auth.split(':')

        Service::Client.new(
                :url        => $conf[:oneflow_server],
                :user_agent => "Sunstone",
                :username   => split_array.shift,
                :password   => split_array.join(':'))
    end

    def af_format_response(resp)
        if CloudClient::is_error?(resp)
            logger.error("[OneFlow] " + resp.to_s)

            error = Error.new(resp.to_s)
            error resp.code.to_i, error.to_json
        else
            body resp.body.to_s
        end
    end
end

##############################################################################
# Service
##############################################################################

get '/service' do
    client = af_build_client

    resp = client.get('/service')

    af_format_response(resp)
end

get '/service/:id' do
    client = af_build_client

    resp = client.get('/service/' + params[:id])

    af_format_response(resp)
end

delete '/service/:id' do
    client = af_build_client

    resp = client.delete('/service/' + params[:id])

    af_format_response(resp)
end

post '/service/:id/action' do
    client = af_build_client

    resp = client.post('/service/' + params[:id] + '/action', request.body.read)

    af_format_response(resp)
end

post '/service/:id/role/:role_name/action' do
    client = af_build_client

    resp = client.post('/service/' + params[:id] + '/role/' + params[:role_name]  + '/action', request.body.read)

    af_format_response(resp)
end


put '/service/:id/role/:role_name' do
    client = af_build_client

    resp = client.put('/service/' + params[:id] + '/role/' + params[:role_name], request.body.read)

    af_format_response(resp)
end

##############################################################################
# Service Template
##############################################################################

get '/service_template' do
    client = af_build_client

    resp = client.get('/service_template')

    af_format_response(resp)
end

get '/service_template/:id' do
    client = af_build_client

    resp = client.get('/service_template/' + params[:id])

    af_format_response(resp)
end

delete '/service_template/:id' do
    client = af_build_client

    resp = client.delete('/service_template/' + params[:id])

    af_format_response(resp)
end

post '/service_template/:id/action' do
    client = af_build_client

    resp = client.post('/service_template/' + params[:id] + '/action', request.body.read)

    af_format_response(resp)
end

post '/service_template' do
    client = af_build_client

    resp = client.post('/service_template', request.body.read)

    af_format_response(resp)
end
