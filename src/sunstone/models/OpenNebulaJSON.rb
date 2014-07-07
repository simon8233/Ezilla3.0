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

require 'opennebula'
include OpenNebula

require 'OpenNebulaJSON/GroupJSON'
require 'OpenNebulaJSON/HostJSON'
require 'OpenNebulaJSON/ClusterJSON'
require 'OpenNebulaJSON/ImageJSON'
require 'OpenNebulaJSON/TemplateJSON'
require 'OpenNebulaJSON/JSONUtils'
require 'OpenNebulaJSON/PoolJSON'
require 'OpenNebulaJSON/UserJSON'
require 'OpenNebulaJSON/VirtualMachineJSON'
require 'OpenNebulaJSON/VirtualNetworkJSON'
require 'OpenNebulaJSON/AclJSON'
require 'OpenNebulaJSON/DatastoreJSON'
require 'OpenNebulaJSON/ZoneJSON'

module OpenNebula
    class Error
        def to_json
            message = { :message => @message }
            error_hash = { :error => message }

            return JSON.pretty_generate error_hash
        end
    end
end
