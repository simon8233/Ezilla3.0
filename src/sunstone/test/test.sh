#!/bin/bash

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

if [ -z $ONE_LOCATION ]; then
    echo "ONE_LOCATION not defined."
    exit -1
fi

VAR_LOCATION="$ONE_LOCATION/var"

if [ "$(ls -A $VAR_LOCATION)" ]; then
    echo "$VAR_LOCATION is not empty."
    exit -1
fi

for j in `ls ./spec/*_spec.rb` ; do
    PID=$$

    oned -f &
    sleep 1
    until grep 'Auth Manager loaded' ${VAR_LOCATION}/oned.log; do sleep 1; done

    rspec $j -f s
    CODE=$?

    pkill -P $PID oned
    sleep 2s;
    pkill -9 -P $PID oned

    if [ $CODE != 0 ] ; then
        exit 1
    fi

    find $VAR_LOCATION -mindepth 1 -delete
done
