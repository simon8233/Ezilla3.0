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

require 'OpenNebulaJSON/JSONUtils'

module OpenNebulaJSON
    class AclJSON < OpenNebula::Acl
        include JSONUtils

        def create(template_json)
            acl_string = parse_json(template_json, 'acl')
            acl_rule = Acl.parse_rule(acl_string)
            if OpenNebula.is_error?(acl_rule)
                return acl_rule
            end
            self.allocate(acl_rule[0],acl_rule[1],acl_rule[2])
        end

        def perform_action(template_json)
            action_hash = parse_json(template_json, 'action')
            if OpenNebula.is_error?(action_hash)
                return action_hash
            end

            error_msg = "#{action_hash['perform']} action not " <<
                " available for this resource"
            OpenNebula::Error.new(error_msg)

            # rc = case action_hash['perform']
            #          #no actions!
            #      else
            #          error_msg = "#{action_hash['perform']} action not " <<
            #              " available for this resource"
            #          OpenNebula::Error.new(error_msg)
            #      end
        end
    end
end
