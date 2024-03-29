# -------------------------------------------------------------------------- #
# Copyright 2002-2013, OpenNebula Project (OpenNebula.org), C12G Labs        #
#                                                                            #
# Licensed under the Apache License, Version 2.0 (the "License"); you may    #
# not use this file except in compliance with the License. You may obtain    #
# a copy of the License at                                                   #
#                                                                            #
# http://www.apache.org/licenses/LICENSE-2.0                                 #
#                                                                            #
# Unless required by applicable law or agreed to in writing, software        #
# distributed under the License is distributed on an "AS IS" BASIS,          #
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.   #
# See the License for the specific language governing permissions and        #
# limitations under the License.                                             #
#--------------------------------------------------------------------------- #


begin # require 'rubygems'
    require 'rubygems'
rescue Exception
end

require 'digest/sha1'
require 'rexml/document'
require 'pp'

require 'opennebula/xml_utils'
require 'opennebula/client'
require 'opennebula/error'
require 'opennebula/virtual_machine'
require 'opennebula/virtual_machine_pool'
require 'opennebula/virtual_network'
require 'opennebula/virtual_network_pool'
require 'opennebula/image'
require 'opennebula/image_pool'
require 'opennebula/user'
require 'opennebula/user_pool'
require 'opennebula/host'
require 'opennebula/host_pool'
require 'opennebula/template'
require 'opennebula/template_pool'
require 'opennebula/group'
require 'opennebula/group_pool'
require 'opennebula/acl'
require 'opennebula/acl_pool'
require 'opennebula/datastore'
require 'opennebula/datastore_pool'
require 'opennebula/cluster'
require 'opennebula/cluster_pool'
require 'opennebula/document'
require 'opennebula/document_pool'
require 'opennebula/system'

module OpenNebula

    # OpenNebula version
    VERSION = '4.0.1'
end
