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
    class UserJSON < OpenNebula::User
        include JSONUtils

        def create(template_json)
            user_hash = parse_json(template_json, 'user')
            if OpenNebula.is_error?(user_hash)
                return user_hash
            end

            self.allocate(user_hash['name'],
                          user_hash['password'],
                          user_hash['auth_driver'])
        end

        def perform_action(template_json)
            action_hash = parse_json(template_json, 'action')
            if OpenNebula.is_error?(action_hash)
                return action_hash
            end

            rc = case action_hash['perform']
                 when "passwd"       then self.passwd(action_hash['params'])
                 when "chgrp"        then self.chgrp(action_hash['params'])
                 when "chauth"       then self.chauth(action_hash['params'])
                 when "update"       then self.update(action_hash['params'])
                 when "set_quota"    then self.set_quota(action_hash['params'])
                 when "addgroup"     then self.addgroup(action_hash['params'])
                 when "delgroup"     then self.delgroup(action_hash['params'])
                 else
                     error_msg = "#{action_hash['perform']} action not " <<
                         " available for this resource"
                     OpenNebula::Error.new(error_msg)
                 end
        end

        def passwd(params=Hash.new)
            super(params['password'])
        end

        def chgrp(params=Hash.new)
            super(params['group_id'].to_i)
        end

        def chauth(params=Hash.new)
            super(params['auth_driver'])
        end

        def update(params=Hash.new)
            super(params['template_raw'])
        end

        def set_quota(params=Hash.new)
            quota_json = params['quotas']
            quota_template = template_to_str(quota_json)
            super(quota_template)
        end

        def addgroup(params=Hash.new)
            super(params['group_id'].to_i)
        end

        def delgroup(params=Hash.new)
            super(params['group_id'].to_i)
        end

    end
end
