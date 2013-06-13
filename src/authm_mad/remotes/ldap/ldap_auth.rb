# ---------------------------------------------------------------------------- #
# Copyright 2010-2013, C12G Labs S.L                                           #
#                                                                              #
# Licensed under the Apache License, Version 2.0 (the "License"); you may      #
# not use this file except in compliance with the License. You may obtain      #
# a copy of the License at                                                     #
#                                                                              #
# http://www.apache.org/licenses/LICENSE-2.0                                   #
#                                                                              #
# Unless required by applicable law or agreed to in writing, software          #
# distributed under the License is distributed on an "AS IS" BASIS,            #
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.     #
# See the License for the specific language governing permissions and          #
# limitations under the License.                                               #
# ---------------------------------------------------------------------------- #

require 'rubygems'
require 'net/ldap'

module OpenNebula; end

class OpenNebula::LdapAuth
    def initialize(options)
        @options={
            :host => 'localhost',
            :port => 389,
            :user => nil,
            :password => nil,
            :base => nil,
            :auth_method => :simple,
            :user_field => 'cn',
            :user_group_field => 'dn',
            :group_field => 'member'
        }.merge(options)

        ops={}

        if @options[:user]
            ops[:auth] = {
                :method => @options[:auth_method],
                :username => @options[:user],
                :password => @options[:password]
            }
        end

        ops[:host]=@options[:host] if @options[:host]
        ops[:port]=@options[:port].to_i if @options[:port]
        ops[:encryption]=@options[:encryption] if @options[:encryption]

        @ldap=Net::LDAP.new(ops)
    end

    def find_user(name)
        begin
            result=@ldap.search(
                :base => @options[:base],
                :filter => "#{@options[:user_field]}=#{name}")

            if result && result.first
                [result.first.dn, result.first[@options[:user_group_field]]]
            else
                result=@ldap.search(:base => name)

                if result && result.first
                    [name, result.first[@options[:user_group_field]]]
                else
                    [nil, nil]
                end
            end
        rescue
            [nil, nil]
        end
    end

    def is_in_group?(user, group)
        result=@ldap.search(
                    :base   => group,
                    :filter => "(#{@options[:group_field]}=#{user.first})")

        if result && result.first
            true
        else
            false
        end
    end

    def authenticate(user, password)
        ldap=@ldap.clone

        auth={
            :method => @options[:auth_method],
            :username => user,
            :password => password
        }

        if ldap.bind(auth)
            true
        else
            false
        end
    end
end

