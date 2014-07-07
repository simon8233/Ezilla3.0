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

EXAMPLES_PATH = File.join(File.dirname(__FILE__),'../examples')
FIXTURES_PATH = File.join(File.dirname(__FILE__),'../fixtures')
ONEUI_LIB_LOCATION = File.join(File.dirname(__FILE__), '..', '..')
$: << ONEUI_LIB_LOCATION

# Load the testing libraries
require 'rubygems'
require 'rspec'
require 'rack/test'
require 'json'

# Load the Sinatra app
require 'sunstone-server'

# Make Rack::Test available to all spec contexts
Spec::Runner.configure do |conf|
    conf.include Rack::Test::Methods
end

# Set the Sinatra environment
set :environment, :test

# Add an app method for RSpec
def app
    Sinatra::Application
end
