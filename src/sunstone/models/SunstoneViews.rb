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

    def logo
        @views_config['logo']
    end
end