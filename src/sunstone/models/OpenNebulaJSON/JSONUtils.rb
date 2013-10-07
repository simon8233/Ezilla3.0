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

module OpenNebulaJSON

    require 'json'

    module JSONUtils
        def to_json
            begin
                JSON.pretty_generate self.to_hash
            rescue Exception => e
                OpenNebula::Error.new(e.message)
            end
        end

        def parse_json(json_str, root_element)
            begin
                hash = JSON.parse(json_str)
            rescue Exception => e
                return OpenNebula::Error.new(e.message)
            end

            if hash.has_key?(root_element)
                return hash[root_element]
            else
                return OpenNebula::Error.new("Error parsing JSON: Wrong resource type")
            end
        end

        def parse_json_sym(json_str, root_element)
            begin
                parser = JSON.parser.new(json_str, {:symbolize_names => true})
                hash = parser.parse

                if hash.has_key?(root_element)
                    return hash[root_element]
                end

                Error.new("Error parsing JSON:\ root element not present")

            rescue => e
                Error.new(e.message)
            end
        end

        def template_to_str(attributes, indent=true)
             if indent
                 ind_enter="\n"
                 ind_tab='  '
             else
                 ind_enter=''
                 ind_tab=' '
             end

             str=attributes.collect do |key, value|
                 if value
                     str_line=""
                     if value.class==Array && !value.empty?
                         value.each do |value2|
                             str_line << key.to_s.upcase << "=[" << ind_enter
                             if value2 && value2.class==Hash
                                 str_line << value2.collect do |key3, value3|
                                     str = ind_tab + key3.to_s.upcase + "="
                                     str += "\"#{value3.to_s}\"" if value3
                                     str
                                 end.compact.join(",\n")
                             end
                             str_line << "\n]\n"
                         end

                     elsif value.class==Hash && !value.empty?
                         str_line << key.to_s.upcase << "=[" << ind_enter

                         str_line << value.collect do |key3, value3|
                             str = ind_tab + key3.to_s.upcase + "="
                             str += "\"#{value3.to_s}\"" if value3
                             str
                         end.compact.join(",\n")

                         str_line << "\n]\n"

                     else
                         str_line<<key.to_s.upcase << "=" << "\"#{value.to_s}\""
                     end
                     str_line
                 end
             end.compact.join("\n")

             str
         end
     end
end
