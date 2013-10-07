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

require 'yaml'
require 'json'

require 'pp'

VIEWS_CONFIGURATION_FILE = ETC_LOCATION + "/sunstone-views.yaml"
VIEWS_CONFIGURATION_DIR = ETC_LOCATION + "/sunstone-views/"

class SunstoneViews
	def initialize
		@views_config = YAML.load_file(VIEWS_CONFIGURATION_FILE)

		base_path = SUNSTONE_ROOT_DIR+'/public/js/'

        @views = Hash.new

        Dir[VIEWS_CONFIGURATION_DIR+'*.yaml'].each do |p_path|
            m = p_path.match(/^#{VIEWS_CONFIGURATION_DIR}(.*).yaml$/)
            if m && m[1]
                @views[m[1]] = YAML.load_file(p_path)
            end
        end
	end

	def view(user_name, group_name, view_name=nil)
        available_views = available_views(user_name, group_name)

		if view_name && available_views.include?(view_name)
			return @views[view_name]
		else
			return @views[available_views.first]
		end
	end

    def available_views(user_name, group_name)
        available_views = @views_config['users'][user_name] if @views_config['users']
        available_views ||= @views_config['groups'][group_name] if @views_config['groups']
        available_views ||= @views_config['default']

        return available_views
    end

    def available_tabs
        @views_config['available_tabs']
    end

    def logo
        @views_config['logo']
    end
end
