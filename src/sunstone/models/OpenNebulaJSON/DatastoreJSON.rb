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
    class DatastoreJSON < OpenNebula::Datastore
        include JSONUtils

        def create(template_json)
            ds_hash = parse_json(template_json, 'datastore')
            if OpenNebula.is_error?(ds_hash)
                return ds_hash
            end

            cluster_id = parse_json(template_json, 'cluster_id')
            if OpenNebula.is_error?(cluster_id)
                return cluster_id
            end

            if ds_hash['datastore_raw']
                template = ds_hash['datastore_raw']
            else
                template = template_to_str(ds_hash)
            end

            self.allocate(template,cluster_id.to_i)
        end

        def perform_action(template_json)
            action_hash = parse_json(template_json, 'action')
            if OpenNebula.is_error?(action_hash)
                return action_hash
            end

            rc = case action_hash['perform']
                 when "update"        then self.update(action_hash['params'])
                 when "chown"         then self.chown(action_hash['params'])
                 when "chmod"         then self.chmod_octet(action_hash['params'])
                 when "rename"        then self.rename(action_hash['params'])
                 else
                     error_msg = "#{action_hash['perform']} action not " <<
                         " available for this resource"
                     OpenNebula::Error.new(error_msg)
                 end
        end

        def update(params=Hash.new)
            super(params['template_raw'])
        end

        def chown(params=Hash.new)
            super(params['owner_id'].to_i,params['group_id'].to_i)
        end

        def chmod_octet(params=Hash.new)
            super(params['octet'])
        end

        def rename(params=Hash.new)
            super(params['name'])
        end
    end
end
