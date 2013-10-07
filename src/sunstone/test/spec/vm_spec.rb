#-------------------------------------------------------------------------------
# Copyright (C) 2013
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

require File.expand_path(File.dirname(__FILE__) + '/spec_helper')

describe 'VirtualMachine tests' do
    before(:all) do
        basic_authorize('oneadmin','opennebula')
        post '/login'
        last_response.status.should eql(204)

        @host0_s = File.read(EXAMPLES_PATH + '/host/host0.json')
        post '/host', @host0_s
        last_response.status.should eql(201)
        sleep 2

        @vm0_s = File.read(EXAMPLES_PATH + '/vm/vm0.json')
        @vm0_h = JSON.parse(@vm0_s)

        @vm1_s = File.read(EXAMPLES_PATH + '/vm/vm1.json')
        @vm1_h = JSON.parse(@vm1_s)

        @action_deploy  = File.read(EXAMPLES_PATH + '/vm/deploy.json')
        @action_hold    = File.read(EXAMPLES_PATH + '/vm/hold.json')
        @action_saveas = File.read(EXAMPLES_PATH + '/vm/saveas.json')
        @wrong_action   = File.read(EXAMPLES_PATH + '/error/wrong_action.json')
    end

    it "should get empty vm_pool information" do
        get '/vm'

        last_response.status.should eql(200)

        json_response = JSON.parse(last_response.body)
        json_response['VM_POOL'].empty?.should eql(true)
    end

    it "should create a first VirtualMachine" do
        post '/vm', @vm0_s

        last_response.status.should eql(201)

        json_response = JSON.parse(last_response.body)
        json_response['VM']['ID'].should eql("0")
    end


    it "should get VirtualMachine 0 information" do
        url = '/vm/0'
        get url

        last_response.status.should eql(200)

        json_response = JSON.parse(last_response.body)
        json_response['VM']['NAME'].should eql(@vm0_h['vm']['name'])
        json_response['VM']['STATE'].should eql("1")
        json_response['VM']['TEMPLATE']['CPU'].should eql(@vm0_h['vm']['cpu'])
        json_response['VM']['TEMPLATE']['MEMORY'].should eql(@vm0_h['vm']['memory'])
    end

    it "should create a second VirtualMachine" do
        post '/vm', @vm1_s

        last_response.status.should eql(201)

        json_response = JSON.parse(last_response.body)
        json_response['VM']['ID'].should eql("1")
    end

    it "should get VirtualMachine 1 information" do
        url = '/vm/1'
        get url

        last_response.status.should eql(200)

        json_response = JSON.parse(last_response.body)
        json_response['VM']['NAME'].should eql(@vm1_h['vm']['name'])
        json_response['VM']['TEMPLATE']['CPU'].should eql(@vm1_h['vm']['cpu'])
        json_response['VM']['TEMPLATE']['MEMORY'].should eql(@vm1_h['vm']['memory'])
    end

    ############################################################################
    # Deploy
    ############################################################################
    it "should deploy VirtualMachine 0 in Host 0" do
        url = '/vm/0/action'
        post url, @action_deploy

        last_response.status.should eql(204)
    end

    it "should get first VirtualMachine information after deploying it" do
        url = '/vm/0'
        get url

        last_response.status.should eql(200)

        json_response = JSON.parse(last_response.body)
        json_response['VM']['STATE'].should eql("3")
        json_response['VM']['NAME'].should eql(@vm0_h['vm']['name'])
        json_response['VM']['TEMPLATE']['CPU'].should eql(@vm0_h['vm']['cpu'])
        json_response['VM']['TEMPLATE']['MEMORY'].should eql(@vm0_h['vm']['memory'])
    end

    it "should try to delete a host with running VMs and check the error" do
        delete '/host/0'

        last_response.status.should eql(500)

        json_response = JSON.parse(last_response.body)
        json_response['error']['message'].should_not eql(nil)
    end

    ############################################################################
    # Saveas
    ############################################################################
    #it "should prepare the VirtualMachine 0 disk to be saved" do
    #    url = '/vm/0/action'
    #    post url, @action_saveas
#
    #    last_response.status.should eql(204)
    #end
#
    #it "should get VirtualMachine 0 information after saveas action" do
    #    url = '/vm/0'
    #    get url
#
    #    last_response.status.should eql(200)
#
    #    json_response = JSON.parse(last_response.body)
    #    json_response['VM']['STATE'].should eql("3")
    #    json_response['VM']['NAME'].should eql(@vm0_h['vm']['name'])
    #    json_response['VM']['TEMPLATE']['CPU'].should eql(@vm0_h['vm']['cpu'])
    #    json_response['VM']['TEMPLATE']['MEMORY'].should eql(@vm0_h['vm']['memory'])
    #    json_response['VM']['TEMPLATE']['DISK']["SAVE_AS"].should eql("0")
    #end

    ############################################################################
    # Stop
    ############################################################################
    it "should stop VirtualMachine 1" do
        url = '/vm/1/action'
        post url, @action_hold

        last_response.status.should eql(204)
    end

    it "should get VirtualMachine 1 information after stopping it" do
        url = '/vm/1'
        get url

        last_response.status.should eql(200)

        json_response = JSON.parse(last_response.body)
        json_response['VM']['STATE'].should eql("2")
        json_response['VM']['NAME'].should eql(@vm1_h['vm']['name'])
        json_response['VM']['TEMPLATE']['CPU'].should eql(@vm1_h['vm']['cpu'])
        json_response['VM']['TEMPLATE']['MEMORY'].should eql(@vm1_h['vm']['memory'])
    end

    ############################################################################
    # Pool
    ############################################################################
    it "should get vm_pool information" do
        get '/vm'

        last_response.status.should eql(200)

        json_response = JSON.parse(last_response.body)
        json_response['VM_POOL']['VM'].size.should eql(2)
        json_response['VM_POOL']['VM'].each do |vm|
            if vm['ID'] == '0'
                vm['NAME'].should eql(@vm0_h['vm']['name'])
                vm['TEMPLATE']['CPU'].should eql(@vm0_h['vm']['cpu'])
                vm['TEMPLATE']['MEMORY'].should eql(@vm0_h['vm']['memory'])
            elsif vm['ID'] == '1'
                vm['NAME'].should eql(@vm1_h['vm']['name'])
                vm['TEMPLATE']['CPU'].should eql(@vm1_h['vm']['cpu'])
                vm['TEMPLATE']['MEMORY'].should eql(@vm1_h['vm']['memory'])
            end
        end
    end

    ############################################################################
    # Delete
    ############################################################################
    it "should delete VirtualMachine 1" do
        url = '/vm/1'
        delete url

        last_response.status.should eql(204)
    end

    it "should get the deleted VirtualMchine information" do
        url = '/vm/1'
        get url

        last_response.status.should eql(200)

        json_response = JSON.parse(last_response.body)
        json_response['VM']['STATE'].should eql("6")
        json_response['VM']['NAME'].should eql(@vm1_h['vm']['name'])
        json_response['VM']['TEMPLATE']['CPU'].should eql(@vm1_h['vm']['cpu'])
        json_response['VM']['TEMPLATE']['MEMORY'].should eql(@vm1_h['vm']['memory'])
    end

    ############################################################################
    # Errors
    ############################################################################
    it "should try to get VirtualMachine 3 information and check the error, " <<
        " because it does not exist" do
        get '/vm/3'

        last_response.status.should eql(404)

        json_response = JSON.parse(last_response.body)
        json_response['error']['message'].should_not eql(nil)
    end

    it "should try to deploy VirtualMachine 3 and check the error, because " <<
        "it does not exist" do
        post '/vm/3/action', @action_deploy

        last_response.status.should eql(404)

        json_response = JSON.parse(last_response.body)
        json_response['error']['message'].should_not eql(nil)
    end

    it "should try to perform a wrong action and check the error" do
        post '/vm/0/action', @wrong_action

        last_response.status.should eql(500)

        json_response = JSON.parse(last_response.body)
        json_response['error']['message'].should_not eql(nil)
    end
end
