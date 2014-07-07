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

require 'OpenNebulaJSON/JSONUtils'

module OpenNebulaJSON
    class ClusterJSON < OpenNebula::Cluster
        include JSONUtils

        def create(template_json)
            cluster_hash = parse_json(template_json, 'cluster')
            if OpenNebula.is_error?(cluster_hash)
                return cluster_hash
            end

            self.allocate(cluster_hash['name'])
        end

        def perform_action(template_json)
            action_hash = parse_json(template_json, 'action')
            if OpenNebula.is_error?(action_hash)
                return action_hash
            end

            rc = case action_hash['perform']
                 when "addhost" then self.addhost(action_hash['params'])
                 when "delhost" then self.delhost(action_hash['params'])
                 when "adddatastore" then self.adddatastore(action_hash['params'])
                 when "deldatastore" then self.deldatastore(action_hash['params'])
                 when "addvnet" then self.addvnet(action_hash['params'])
                 when "delvnet" then self.delvnet(action_hash['params'])
                 when "update"  then self.update(action_hash['params'])
                 when "rename"  then self.rename(action_hash['params'])

                 else
                     error_msg = "#{action_hash['perform']} action not " <<
                         " available for this resource"
                     OpenNebula::Error.new(error_msg)
                 end
        end

        def addhost(params=Hash.new)
            super(params['host_id'].to_i)
        end

        def delhost(params=Hash.new)
            super(params['host_id'].to_i)
        end

        def adddatastore(params=Hash.new)
            super(params['ds_id'].to_i)
        end

        def deldatastore(params=Hash.new)
            super(params['ds_id'].to_i)
        end

        def addvnet(params=Hash.new)
            super(params['vnet_id'].to_i)
        end

        def delvnet(params=Hash.new)
            super(params['vnet_id'].to_i)
        end

        def update(params=Hash.new)
            super(params['template_raw'])
        end

        def rename(params=Hash.new)
            super(params['name'])
        end
    end
end
