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
    class GroupJSON < OpenNebula::Group
        include JSONUtils

        def create(template_json)
            group_hash = parse_json_sym(template_json,:group)
            if OpenNebula.is_error?(group_hash)
                return group_hash
            end

            super(group_hash)
        end

        def perform_action(template_json)
            action_hash = parse_json(template_json, 'action')
            if OpenNebula.is_error?(action_hash)
                return action_hash
            end

            rc = case action_hash['perform']
                 when "chown"       then self.chown(action_hash['params'])
                 when "update"       then self.update_json(action_hash['params'])
                 when "set_quota"   then self.set_quota(action_hash['params'])
                 when "add_provider" then 
                                   self.add_provider_json(action_hash['params'])
                 when "del_provider" then 
                                   self.del_provider_json(action_hash['params'])
                 else
                     error_msg = "#{action_hash['perform']} action not " <<
                         " available for this resource"
                     OpenNebula::Error.new(error_msg)
                 end
        end

        def chown(params=Hash.new)
            super(params['owner_id'].to_i)
        end

        def update_json(params=Hash.new)
            update(params['template_raw'])
        end

        def set_quota(params=Hash.new)
            quota_json = params['quotas']
            quota_template = template_to_str(quota_json)
            super(quota_template)
        end

        def add_provider_json(params=Hash.new)
            add_provider(params['zone_id'].to_i, params['cluster_id'].to_i)
        end

        def del_provider_json(params=Hash.new)
            del_provider(params['zone_id'].to_i, params['cluster_id'].to_i)
        end
    end
end
